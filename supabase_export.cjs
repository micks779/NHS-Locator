const fs = require('fs');
const path = require('path');
const { readEnvVar } = require('./env_utils.cjs');

// Optional SUPABASE_EXPORT_URL: pull from another project (e.g. legacy) while app uses VITE_* elsewhere
const SUPABASE_URL =
  readEnvVar('SUPABASE_EXPORT_URL') || readEnvVar('SUPABASE_URL') || readEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY =
  readEnvVar('SUPABASE_ANON_KEY') ||
  readEnvVar('VITE_SUPABASE_ANON_KEY') ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  readEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUTPUT_FILE = process.argv[2] || 'supabase_source_of_truth.json';

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL');
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function main() {
  const base = `${SUPABASE_URL}/rest/v1`;
  const query1 = `${base}/sites?select=*,services:site_services(service:services(*))&order=name.asc`;
  const query2 = `${base}/sites?select=*,site_services(services(*))&order=name.asc`;

  let raw;
  try {
    raw = await fetchJson(query1);
  } catch (_) {
    raw = await fetchJson(query2);
  }

  const transformed = raw.map((s) => {
    let teams = [];
    if (Array.isArray(s.services)) {
      teams = s.services
        .map((link) => link.service || link)
        .filter(Boolean)
        .map((service) => ({
          id: service.id,
          name: service.name,
          category: service.category || 'Other',
          directorate: service.directorate || 'Uncategorized',
          description: service.description || '',
          serviceLead: service.service_lead || '',
          seniorManager: service.senior_manager || '',
          url: service.url || '',
          phone: service.phone || '',
        }));
    } else if (Array.isArray(s.site_services)) {
      teams = s.site_services
        .map((link) => link.services || link.service || link)
        .filter(Boolean)
        .map((service) => ({
          id: service.id,
          name: service.name,
          category: service.category || 'Other',
          directorate: service.directorate || 'Uncategorized',
          description: service.description || '',
          serviceLead: service.service_lead || '',
          seniorManager: service.senior_manager || '',
          url: service.url || '',
          phone: service.phone || '',
        }));
    }

    return {
      id: s.id,
      name: s.name,
      address: s.address,
      postcode: s.postcode || undefined,
      latitude: s.latitude,
      longitude: s.longitude,
      receptionPhone: s.reception_phone || '',
      borough: (s.borough || 'LONDON').toUpperCase().trim(),
      hasStepFreeAccess: s.has_step_free_access,
      hasParking: s.has_parking,
      teams,
    };
  });

  const outputPath = path.resolve(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
  const totalTeams = transformed.reduce((sum, site) => sum + site.teams.length, 0);
  console.log(`Exported ${transformed.length} sites and ${totalTeams} linked services`);
  console.log(`Output: ${outputPath}`);
}

main().catch((err) => {
  console.error(`Export failed: ${err.message}`);
  process.exit(1);
});
