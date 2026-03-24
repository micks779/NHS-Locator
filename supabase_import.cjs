const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { readEnvVar } = require('./env_utils.cjs');

const inputFile = process.argv[2] || 'enriched_elft_data.json';

// Target project for import: optional SUPABASE_IMPORT_URL lets you push to a new project
// while VITE_SUPABASE_URL still points at the old one.
const SUPABASE_URL =
  readEnvVar('SUPABASE_IMPORT_URL') || readEnvVar('SUPABASE_URL') || readEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = readEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL) {
  console.error('Set SUPABASE_IMPORT_URL or VITE_SUPABASE_URL (or SUPABASE_URL) in .env / .env.local.');
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in .env / .env.local (Settings → API → service_role).');
  process.exit(1);
}

const host = SUPABASE_URL.replace(/^https?:\/\//, '').split('/')[0];
console.log(`Import target: https://${host}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runImport() {
  const resolvedInput = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(resolvedInput)) {
    throw new Error(`Input file not found: ${resolvedInput}`);
  }

  const sites = JSON.parse(fs.readFileSync(resolvedInput, 'utf8'));
  if (!Array.isArray(sites)) {
    throw new Error('Input data must be an array of sites.');
  }

  console.log(`Importing ${sites.length} sites from ${inputFile}`);

  let siteOk = 0;
  let serviceOk = 0;
  let linksOk = 0;

  for (const siteData of sites) {
    process.stdout.write(`Site: ${siteData.name} ... `);

    const payload = {
      name: siteData.name,
      address: siteData.address,
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      reception_phone: siteData.receptionPhone || '020 7655 4000',
      borough: siteData.borough || 'LONDON',
      has_step_free_access: siteData.hasStepFreeAccess ?? true,
      has_parking: siteData.hasParking ?? false,
    };
    if (siteData.postcode) {
      payload.postcode = siteData.postcode;
    }

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .upsert(payload, { onConflict: 'name' })
      .select()
      .single();

    if (siteError) {
      console.log(`failed (${siteError.message})`);
      continue;
    }

    siteOk += 1;
    const teams = Array.isArray(siteData.teams) ? siteData.teams : [];

    for (const teamData of teams) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .upsert(
          {
            name: teamData.name,
            category: teamData.category || 'Other',
            directorate: teamData.directorate || 'Uncategorized',
            service_lead: teamData.serviceLead || null,
            senior_manager: teamData.seniorManager || null,
            url: teamData.url || null,
            description: teamData.description || null,
            phone: teamData.phone || null,
          },
          { onConflict: 'name' }
        )
        .select()
        .single();

      if (serviceError) {
        console.log(`service warn: ${teamData.name} (${serviceError.message})`);
        continue;
      }
      serviceOk += 1;

      const { error: linkError } = await supabase
        .from('site_services')
        .upsert({ site_id: site.id, service_id: service.id }, { onConflict: 'site_id,service_id' });

      if (!linkError) linksOk += 1;
    }

    console.log('ok');
  }

  console.log('Import complete');
  console.log(`Sites upserted: ${siteOk}`);
  console.log(`Services upserted: ${serviceOk}`);
  console.log(`Site/service links upserted: ${linksOk}`);
}

runImport().catch((err) => {
  console.error(`Import failed: ${err.message}`);
  process.exit(1);
});
