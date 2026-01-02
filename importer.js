
/**
 * ELFT SUPABASE IMPORTER (PRODUCTION READY)
 * 
 * Usage: 
 * 1. Ensure you ran the UNIQUE constraint SQL in Supabase.
 * 2. Use the SERVICE_ROLE key from Supabase Settings -> API.
 * 3. node importer.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
// CRITICAL: Use the 'service_role' key to bypass RLS during import.
const SUPABASE_URL = 'https://hqvfjr lmxjoiohrjtbzf.supabase.co'; 
const SUPABASE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runImport() {
  console.log('🚀 Starting ELFT Production Data Upload...');

  try {
    const data = JSON.parse(fs.readFileSync('enriched_elft_data.json', 'utf8'));
    console.log(`📂 Found ${data.length} sites to process.`);

    for (const siteData of data) {
      process.stdout.write(`📍 Processing: ${siteData.name}... `);

      // 1. Upsert Site (Uses the unique constraint on 'name')
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .upsert({
          name: siteData.name,
          address: siteData.address,
          latitude: siteData.latitude,
          longitude: siteData.longitude,
          reception_phone: siteData.receptionPhone,
          borough: siteData.borough,
          has_step_free_access: siteData.hasStepFreeAccess,
          has_parking: siteData.hasParking
        }, { onConflict: 'name' })
        .select()
        .single();

      if (siteError) {
        console.log(`\n❌ Site Error: ${siteError.message}`);
        continue;
      }

      // 2. Process Teams for this Site
      for (const teamData of siteData.teams) {
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .upsert({
            name: teamData.name,
            category: teamData.category,
            directorate: teamData.directorate || 'Uncategorized',
            service_lead: teamData.serviceLead,
            senior_manager: teamData.seniorManager,
            url: teamData.url,
            description: teamData.description
          }, { onConflict: 'name' })
          .select()
          .single();

        if (serviceError) {
          console.log(`\n⚠️ Service Error (${teamData.name}): ${serviceError.message}`);
          continue;
        }

        // 3. Link Site to Service
        const { error: linkError } = await supabase
          .from('site_services')
          .upsert({
            site_id: site.id,
            service_id: service.id
          }, { onConflict: 'site_id,service_id' });

        if (linkError) {
          console.log(`\n🔗 Link Error: ${linkError.message}`);
        }
      }
      console.log('✅ Done');
    }

    console.log('\n✨ SUCCESS: Your Supabase database is now populated with real ELFT data.');
  } catch (err) {
    console.error('\n💥 CRITICAL FAILURE:', err.message);
  }
}

runImport();
