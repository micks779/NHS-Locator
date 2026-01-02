
/**
 * ELFT PRODUCTION SCRAPER v2
 * 
 * Instructions:
 * 1. Ensure Node.js is installed.
 * 2. Run: npm install node-fetch@2 jsdom
 * 3. Run: node scraper.js
 */

const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://www.elft.nhs.uk/service-search?page=';
const MAX_PAGES = 31; 

async function scrapeServiceDetail(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Field Extraction
    const name = doc.querySelector('h1')?.textContent?.trim() || '';
    const description = doc.querySelector('.field--name-field-service-description')?.textContent?.trim() || 
                        doc.querySelector('.field--name-body')?.textContent?.trim() || '';
    
    const addressBlock = doc.querySelector('.address')?.textContent?.trim() || 
                        doc.querySelector('.field--name-field-address')?.textContent?.trim() || '';
    
    const phone = doc.querySelector('.field--name-field-service-phone')?.textContent?.trim() || 
                  doc.querySelector('.field--name-field-phone-number')?.textContent?.trim() || '';
    
    let serviceLead = '';
    let seniorManager = '';
    
    // Look for lists containing manager info
    doc.querySelectorAll('li').forEach(li => {
      const text = li.textContent;
      if (text.includes('Service Lead:')) serviceLead = text.split('Service Lead:')[1].trim();
      if (text.includes('Senior Manager:')) seniorManager = text.split('Senior Manager:')[1].trim();
    });

    return {
      name,
      description,
      address: addressBlock,
      phone,
      serviceLead,
      seniorManager,
      url
    };
  } catch (error) {
    console.error(`Error fetching detail: ${url}`, error.message);
    return null;
  }
}

async function run() {
  const allServices = [];
  console.log('🚀 Starting ELFT Trust-Wide Scrape...');

  for (let p = 0; p < MAX_PAGES; p++) {
    console.log(`📄 Processing Page ${p} of ${MAX_PAGES-1}...`);
    try {
      const response = await fetch(`${BASE_URL}${p}`);
      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      const links = Array.from(doc.querySelectorAll('.views-field-title a'))
        .map(a => `https://www.elft.nhs.uk${a.getAttribute('href')}`);

      for (const link of links) {
        console.log(`  🔍 Scrapping: ${link.split('/').pop()}`);
        const data = await scrapeServiceDetail(link);
        if (data) allServices.push(data);
        
        // Wait 300ms to be a "good citizen" to the server
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (err) {
      console.error(`FAILED Page ${p}:`, err.message);
    }
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    total: allServices.length,
    services: allServices
  };

  fs.writeFileSync('elft_production_data.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ SUCCESS: Scraped ${allServices.length} service records.`);
  console.log('Data saved to elft_production_data.json');
  console.log('You can now use this JSON to populate your Supabase "services" table.');
}

run();
