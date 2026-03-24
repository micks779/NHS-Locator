/**
 * Legacy entrypoint — delegates to supabase_import.cjs.
 *
 * Usage:
 *   node importer.js
 *   node importer.js path/to/enriched.json
 *
 * Prefer: npm run data:import -- enriched_elft_data_from_xlsx.json
 * Env: SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_IMPORT_URL or VITE_SUPABASE_URL (see .env.example).
 */

if (process.argv.length < 3) {
  process.argv.push('enriched_elft_data.json');
}

require('./supabase_import.cjs');
