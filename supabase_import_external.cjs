const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { readEnvVar } = require('./env_utils.cjs');

const inputFile = process.argv[2] || 'external_partner_sites.json';
const SUPABASE_URL =
  readEnvVar('SUPABASE_IMPORT_URL') || readEnvVar('SUPABASE_URL') || readEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = readEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL) {
  console.error('Set SUPABASE_IMPORT_URL or VITE_SUPABASE_URL (or SUPABASE_URL) in .env / .env.local.');
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in .env / .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runImport() {
  const resolvedInput = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(resolvedInput)) {
    throw new Error(`Input file not found: ${resolvedInput}`);
  }

  const rows = JSON.parse(fs.readFileSync(resolvedInput, 'utf8'));
  if (!Array.isArray(rows)) {
    throw new Error('Input data must be an array.');
  }

  console.log(`Importing ${rows.length} external partner entries from ${inputFile}`);

  let ok = 0;
  let failed = 0;
  const errorSamples = [];
  for (const row of rows) {
    const { error } = await supabase.from('external_partner_sites').upsert(
      {
        site_name: row.site_name,
        service_name: row.service_name,
        address: row.address || null,
        postcode: row.postcode || null,
        borough: row.borough || null,
        latitude: row.latitude,
        longitude: row.longitude,
        category: row.category || 'Other',
        service_url: row.service_url || null,
        match_status: row.match_status || 'External / Partner Site',
        source_original_site_name: row.source_original_site_name || null,
        source_estates_building: row.source_estates_building || null,
        flag: row.flag || null,
      },
      { onConflict: 'service_name' }
    );

    if (!error) {
      ok += 1;
    } else {
      failed += 1;
      if (errorSamples.length < 5) {
        errorSamples.push(`${row.service_name}: ${error.message}`);
      }
    }
  }

  console.log(`External partner entries upserted: ${ok}`);
  console.log(`External partner entries failed: ${failed}`);
  if (errorSamples.length > 0) {
    console.log('Sample errors:');
    errorSamples.forEach((sample) => console.log(`  - ${sample}`));
  }
}

runImport().catch((err) => {
  console.error(`External import failed: ${err.message}`);
  process.exit(1);
});
