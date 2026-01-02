
/**
 * ELFT DATA ENRICHER (PRO)
 * 
 * Usage: node processor.js elft_production_data.json
 */

const fs = require('fs');

const inputFile = process.argv[2] || 'elft_production_data.json';
if (!fs.existsSync(inputFile)) {
  console.error(`Error: File ${inputFile} not found.`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Smart Geo-Lookup for major ELFT Hubs
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
  'Mountbatten House': { lat: 51.8845, lng: -0.5212, borough: 'BEDFORDSHIRE' }
};

const CATEGORY_MAP = {
  'Mental Health': ['Mental Health', 'Crisis', 'Psychiatric', 'CMHT', 'Psychology', 'Recovery', 'Memory', 'Ward', 'Unit', 'MBU', 'PICU'],
  'Children': ['CAMHS', 'Child', 'Paediatric', 'Adolescent', 'Schools', 'Coborn'],
  'Community Health': ['Community Health', 'Nursing', 'Therapy', 'Speech', 'Foot', 'Podiatry', 'Blood', 'Phlebotomy', 'Continence', 'Palliative'],
  'Forensic': ['Forensic', 'John Howard', 'Wolfson', 'Medium Secure'],
  'Corporate': ['Human Resources', 'Digital', 'IT', 'Finance', 'Executive', 'Management Offices', 'Estates'],
  'Primary Care': ['Medical Centre', 'Practice', 'Surgery', 'GP', 'Health Centre']
};

function getCategory(name) {
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) return cat;
  }
  return 'Other';
}

const sitesMap = new Map();

rawData.services.forEach(service => {
  const fullAddress = service.address || 'Unknown Address';
  const siteName = fullAddress.split('\n')[0].trim();
  
  if (!sitesMap.has(siteName)) {
    const geo = GEO_LOOKUP[siteName] || { lat: 51.5, lng: 0.0, borough: 'LONDON' }; // Fallback
    
    sitesMap.set(siteName, {
      id: siteName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: siteName,
      address: fullAddress.split('\n').slice(1).join(', ').trim() || fullAddress,
      latitude: geo.lat,
      longitude: geo.lng,
      receptionPhone: service.phone || '020 7655 4000',
      borough: geo.borough,
      hasStepFreeAccess: true,
      hasParking: false,
      teams: []
    });
  }

  sitesMap.get(siteName).teams.push({
    id: `service-${Math.random().toString(36).substr(2, 9)}`,
    name: service.name,
    category: getCategory(service.name),
    directorate: 'Uncategorized',
    serviceLead: service.serviceLead,
    seniorManager: service.seniorManager,
    url: service.url,
    description: service.description
  });
});

const enrichedData = Array.from(sitesMap.values());

fs.writeFileSync('enriched_elft_data.json', JSON.stringify(enrichedData, null, 2));
console.log(`✅ Success! Enriched ${enrichedData.length} physical sites from ${rawData.total} services.`);
console.log('Processed file: enriched_elft_data.json');
