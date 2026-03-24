const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const INPUT_FILE = process.argv[2] || 'ELFT_Sites_Services_v2.xlsx';
const OUTPUT_FILE = process.argv[3] || 'external_partner_sites.json';

function normalizeText(value) {
  return (value || '').toString().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function toNumberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasUsableAddress(row) {
  const originalSiteName = normalizeText(row['Original Site Name']);
  const postcode = normalizeText(row.Postcode);
  const borough = normalizeText(row.Borough);
  const lat = toNumberOrNull(row.Latitude);
  const lng = toNumberOrNull(row.Longitude);

  if (originalSiteName && !['—', 'Unknown Address'].includes(originalSiteName)) return true;
  if (postcode && postcode !== '—') return true;
  if (borough && borough !== '—') return true;
  if (lat !== null && lng !== null) return true;
  return false;
}

function buildAddress(row) {
  const originalSiteName = normalizeText(row['Original Site Name']);
  const postcode = normalizeText(row.Postcode);
  if (originalSiteName && originalSiteName !== '—' && originalSiteName !== 'Unknown Address') {
    return postcode && postcode !== '—' ? `${originalSiteName}, ${postcode}` : originalSiteName;
  }
  return '';
}

function main() {
  const inputPath = path.resolve(process.cwd(), INPUT_FILE);
  const outputPath = path.resolve(process.cwd(), OUTPUT_FILE);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(inputPath);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  const externalRows = rows.filter((row) => normalizeText(row['Match Status']) === 'External / Partner Site');
  const output = [];
  let skippedNoAddress = 0;

  for (const row of externalRows) {
    const serviceName = normalizeText(row['Service Name']);
    if (!serviceName) continue;
    if (!hasUsableAddress(row)) {
      skippedNoAddress += 1;
      continue;
    }

    const entry = {
      site_name: serviceName, // treat external site as its own service node
      service_name: serviceName,
      address: buildAddress(row),
      postcode: (() => {
        const p = normalizeText(row.Postcode);
        return p && p !== '—' ? p : null;
      })(),
      borough: (() => {
        const b = normalizeText(row.Borough);
        return b && b !== '—' ? b : null;
      })(),
      latitude: toNumberOrNull(row.Latitude),
      longitude: toNumberOrNull(row.Longitude),
      category: normalizeText(row.Category) || 'Other',
      service_url: normalizeText(row['Service URL']) || null,
      match_status: 'External / Partner Site',
      source_original_site_name: normalizeText(row['Original Site Name']) || null,
      source_estates_building: normalizeText(row['Estates Building']) || null,
      flag: normalizeText(row.Flag) || null,
    };
    output.push(entry);
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Sheet: ${sheetName}`);
  console.log(`External rows found: ${externalRows.length}`);
  console.log(`External rows omitted (no usable address): ${skippedNoAddress}`);
  console.log(`External rows prepared: ${output.length}`);
  console.log(`Output: ${outputPath}`);
}

main();
