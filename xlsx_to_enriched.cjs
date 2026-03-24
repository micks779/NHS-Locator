const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const INPUT_FILE = process.argv[2] || 'ELFT_Sites_Services_v2.xlsx';
const OUTPUT_FILE = process.argv[3] || 'enriched_elft_data_from_xlsx.json';
const INCLUDE_EXTERNAL = process.argv.includes('--include-external');

const BOROUGH_MAP = {
  'TOWER HAMLETS': 'TOWER HAMLETS',
  NEWHAM: 'NEWHAM',
  'CITY & HACKNEY': 'CITY & HACKNEY',
  BEDFORDSHIRE: 'BEDFORDSHIRE',
  BEDFORD: 'BEDFORD',
  LUTON: 'LUTON',
  FORENSICS: 'CITY & HACKNEY',
  'TRUST WIDE': 'LONDON',
  LONDON: 'LONDON',
};

function normalizeText(value) {
  return (value || '').toString().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function toSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBorough(value) {
  const v = normalizeText(value).toUpperCase();
  return BOROUGH_MAP[v] || (v && v !== '—' ? v : 'LONDON');
}

function rowIsUsable(row) {
  const status = normalizeText(row['Match Status']);
  if (status === 'Matched - ELFT Estate') return true;
  if (INCLUDE_EXTERNAL && status === 'External / Partner Site') return true;
  return false;
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

  const sitesMap = new Map();
  let skipped = 0;

  for (const row of rows) {
    if (!rowIsUsable(row)) {
      skipped += 1;
      continue;
    }

    const serviceName = normalizeText(row['Service Name']);
    const siteName = normalizeText(row['Estates Building']) || normalizeText(row['Original Site Name']);
    const postcode = normalizeText(row.Postcode);
    const borough = normalizeBorough(row.Borough);

    if (!serviceName || !siteName || siteName === '—') {
      skipped += 1;
      continue;
    }

    const siteKey = `${siteName}__${postcode || 'NO_POSTCODE'}`;
    if (!sitesMap.has(siteKey)) {
      const lat = toNumber(row.Latitude, 51.52);
      const lng = toNumber(row.Longitude, 0.03);
      sitesMap.set(siteKey, {
        id: toSlug(siteName),
        name: siteName,
        address: postcode ? `${siteName}, ${postcode}` : siteName,
        postcode: postcode || undefined,
        latitude: lat,
        longitude: lng,
        receptionPhone: '020 7655 4000',
        borough,
        hasStepFreeAccess: true,
        hasParking: false,
        teams: [],
        _teamSet: new Set(),
      });
    }

    const site = sitesMap.get(siteKey);
    const teamKey = serviceName.toLowerCase();
    if (!site._teamSet.has(teamKey)) {
      site._teamSet.add(teamKey);
      site.teams.push({
        id: `service-${toSlug(serviceName).slice(0, 40)}`,
        name: serviceName,
        category: normalizeText(row.Category) || 'Other',
        directorate: 'Uncategorized',
        url: normalizeText(row['Service URL']) || undefined,
        description: '',
      });
    }
  }

  const output = Array.from(sitesMap.values()).map((s) => {
    delete s._teamSet;
    return s;
  });

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  const teamCount = output.reduce((sum, site) => sum + site.teams.length, 0);
  console.log(`Sheet: ${sheetName}`);
  console.log(`Rows read: ${rows.length}`);
  console.log(`Rows skipped: ${skipped}`);
  console.log(`Built sites: ${output.length}`);
  console.log(`Built service links: ${teamCount}`);
  console.log(`Output: ${outputPath}`);
}

main();
