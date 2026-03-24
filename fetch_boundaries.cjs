const fs = require('fs');
const path = require('path');

const TARGETS = [
  { key: 'TOWER HAMLETS', query: 'London Borough of Tower Hamlets, England' },
  { key: 'NEWHAM', query: 'London Borough of Newham, England' },
  { key: 'CITY & HACKNEY', query: 'London Borough of Hackney, England' },
  { key: 'LUTON', query: 'Luton, England' },
  { key: 'BEDFORD', query: 'Borough of Bedford, England' },
  { key: 'BEDFORDSHIRE', query: 'Central Bedfordshire, England' },
];

async function fetchBoundary(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=5&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ELFT-Locator-Boundary-Fetcher/1.0 (internal tooling)',
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${query}`);
  }
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No geocoder results for ${query}`);
  }
  const withGeo = results.find((r) => r.geojson && (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon'));
  if (!withGeo) {
    throw new Error(`No polygon geojson in results for ${query}`);
  }
  return withGeo;
}

async function main() {
  const features = [];
  for (const target of TARGETS) {
    const match = await fetchBoundary(target.query);
    features.push({
      type: 'Feature',
      properties: {
        borough_key: target.key,
        source_name: match.display_name,
        source_osm_type: match.osm_type,
        source_osm_id: match.osm_id,
      },
      geometry: match.geojson,
    });
    console.log(`Fetched ${target.key} from ${match.display_name}`);
    // Be polite to Nominatim usage policy.
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  const out = {
    type: 'FeatureCollection',
    name: 'elft_borough_boundaries',
    features,
  };

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  const outPath = path.resolve(publicDir, 'borough_boundaries.geojson');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${features.length} features to ${outPath}`);
}

main().catch((err) => {
  console.error(`Boundary fetch failed: ${err.message}`);
  process.exit(1);
});
