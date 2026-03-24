const fs = require('fs');
const path = require('path');

const INPUT_FILE =
  process.argv[2] ||
  'East London NHS Foundation Trust Map- East_London_NHS_Properties_MyMaps_FULL.csv.csv';
const OUTPUT_FILE = process.argv[3] || 'enriched_elft_data.json';

const FILTER_TO_BOROUGH = {
  'TOWER HAMLETS': 'TOWER HAMLETS',
  NEWHAM: 'NEWHAM',
  'CITY & HACKNEY': 'CITY & HACKNEY',
  BEDFORDSHIRE: 'BEDFORDSHIRE',
  BEDFORD: 'BEDFORD',
  LUTON: 'LUTON',
  FORENSICS: 'CITY & HACKNEY',
  'TRUST WIDE': 'LONDON',
};

const GEO_LOOKUP = {
  'Mile End Hospital': { lat: 51.5241, lng: -0.0441, borough: 'TOWER HAMLETS' },
  'East Ham Care Centre': { lat: 51.5398, lng: 0.0378, borough: 'NEWHAM' },
  'John Howard Centre': { lat: 51.5482, lng: -0.0485, borough: 'CITY & HACKNEY' },
  'Newham Centre for Mental Health': { lat: 51.5226, lng: 0.0248, borough: 'NEWHAM' },
  'Bedford Health Village': { lat: 52.1444, lng: -0.4601, borough: 'BEDFORD' },
  'Charter House': { lat: 51.8814, lng: -0.4184, borough: 'LUTON' },
  'Wolfson House': { lat: 51.5645, lng: -0.0912, borough: 'LONDON' },
  'Homerton University Hospital': { lat: 51.5485, lng: -0.0505, borough: 'CITY & HACKNEY' },
  'The Tower Hamlets Centre for Mental Health': { lat: 51.5241, lng: -0.0441, borough: 'TOWER HAMLETS' },
  'Twinwoods Health Resource Centre': { lat: 52.1751, lng: -0.4984, borough: 'BEDFORDSHIRE' },
  'Oakley Court': { lat: 51.8984, lng: -0.4682, borough: 'LUTON' },
  'Calnwood Court': { lat: 51.9012, lng: -0.4705, borough: 'LUTON' },
  'Mountbatten House': { lat: 51.8845, lng: -0.5212, borough: 'BEDFORDSHIRE' },
};

const CATEGORY_MAP = {
  'Mental Health': ['mental health', 'crisis', 'psychiatric', 'cmht', 'psychology', 'recovery', 'memory', 'ward', 'unit', 'mbu', 'picu'],
  Children: ['camhs', 'child', 'paediatric', 'adolescent', 'schools', 'coborn'],
  'Community Health': ['community health', 'nursing', 'therapy', 'speech', 'foot', 'podiatry', 'blood', 'phlebotomy', 'continence', 'palliative'],
  Forensic: ['forensic', 'john howard', 'wolfson', 'medium secure'],
  Corporate: ['human resources', 'digital', 'it', 'finance', 'executive', 'management offices', 'estates', 'corporate'],
  'Primary Care': ['medical centre', 'practice', 'surgery', 'gp', 'health centre', 'primary care'],
};

function normalizeText(value) {
  return (value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function toSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isNumericToken(token) {
  return /^-?\d+(\.\d+)?$/.test(normalizeText(token));
}

function splitCsvLoose(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => normalizeText(c));
}

function getCategory(text) {
  const value = normalizeText(text).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((k) => value.includes(k))) return category;
  }
  return 'Other';
}

function getLogicalRows(lines) {
  const rows = [];
  let buffer = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, '');
    if (!line.trim()) continue;

    buffer = buffer ? `${buffer} ${line}` : line;
    const tokens = splitCsvLoose(buffer);

    if (tokens.length < 21) continue;
    if (!isNumericToken(tokens[tokens.length - 1])) continue;

    rows.push(tokens);
    buffer = '';
  }

  if (buffer) {
    const maybeRow = splitCsvLoose(buffer);
    if (maybeRow.length >= 21) rows.push(maybeRow);
  }

  return rows;
}

function parseRowsToSites(rows) {
  const sitesMap = new Map();
  let skippedRows = 0;

  for (const tokens of rows) {
    if (tokens.length < 21) {
      skippedRows += 1;
      continue;
    }

    const prefix = tokens.slice(0, tokens.length - 11);
    const filterIdx = prefix.findIndex((v) => {
      const value = normalizeText(v).toUpperCase();
      return Object.hasOwn(FILTER_TO_BOROUGH, value);
    });

    if (filterIdx < 0) {
      skippedRows += 1;
      continue;
    }

    const postcodeIdx = prefix.findIndex(
      (v, idx) => idx > filterIdx && /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(normalizeText(v))
    );

    const filterRaw = normalizeText(prefix[filterIdx]).toUpperCase();
    const borough = FILTER_TO_BOROUGH[filterRaw] || 'LONDON';

    const siteName = normalizeText(prefix[filterIdx + 1]) || 'Unknown Site';
    const buildingName = normalizeText(prefix[filterIdx + 2]);
    const postcode = postcodeIdx > -1 ? normalizeText(prefix[postcodeIdx]) : '';
    const address =
      postcodeIdx > filterIdx + 3
        ? normalizeText(prefix.slice(filterIdx + 3, postcodeIdx).join(', '))
        : normalizeText(prefix[0]);

    const directorate =
      postcodeIdx > -1 ? normalizeText(prefix[postcodeIdx + 1]) || 'Uncategorized' : 'Uncategorized';
    const department =
      postcodeIdx > -1 ? normalizeText(prefix.slice(postcodeIdx + 2).join(', ')) : '';

    const teamName = department || buildingName || directorate || 'General Service';
    const category = getCategory(`${teamName} ${directorate}`);

    const geo = GEO_LOOKUP[siteName] || { lat: 51.52, lng: 0.03, borough };
    const siteKey = `${siteName}__${postcode || 'NO_POSTCODE'}`;

    if (!sitesMap.has(siteKey)) {
      sitesMap.set(siteKey, {
        id: toSlug(siteName || siteKey),
        name: siteName,
        address: address || normalizeText(tokens[0]) || 'Address not provided',
        postcode: postcode || undefined,
        latitude: geo.lat,
        longitude: geo.lng,
        receptionPhone: '020 7655 4000',
        borough: geo.borough || borough,
        hasStepFreeAccess: true,
        hasParking: false,
        teams: [],
        _teamSet: new Set(),
      });
    }

    const site = sitesMap.get(siteKey);
    const teamKey = teamName.toLowerCase();
    if (!site._teamSet.has(teamKey)) {
      site._teamSet.add(teamKey);
      site.teams.push({
        id: `service-${toSlug(`${siteName}-${teamName}`).slice(0, 32) || 'unknown'}`,
        name: teamName,
        category,
        directorate: directorate || 'Uncategorized',
        description: '',
      });
    }
  }

  const sites = Array.from(sitesMap.values()).map((site) => {
    delete site._teamSet;
    return site;
  });

  return { sites, skippedRows };
}

function main() {
  const inputPath = path.resolve(process.cwd(), INPUT_FILE);
  const outputPath = path.resolve(process.cwd(), OUTPUT_FILE);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split('\n');
  if (lines.length < 2) {
    console.error('CSV appears empty.');
    process.exit(1);
  }

  const dataLines = lines.slice(1);
  const logicalRows = getLogicalRows(dataLines);
  const { sites, skippedRows } = parseRowsToSites(logicalRows);

  fs.writeFileSync(outputPath, JSON.stringify(sites, null, 2));

  const teamCount = sites.reduce((sum, s) => sum + s.teams.length, 0);
  console.log(`Built ${sites.length} sites and ${teamCount} teams`);
  console.log(`Logical rows processed: ${logicalRows.length}`);
  console.log(`Rows skipped: ${skippedRows}`);
  console.log(`Output: ${outputPath}`);
}

main();
