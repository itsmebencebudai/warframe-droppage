import { DropData, ParsedDropData } from './types';

const WARFRAME_DATA_URL = 'https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html';

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log('Fetching Warframe drop data...');
  
  try {
    const response = await fetch(WARFRAME_DATA_URL, {
      mode: 'cors',
      headers: {
        'Accept': 'text/html',
      }
    });

    // If the direct fetch fails due to CORS, we'll use a CORS proxy
    if (!response.ok) {
      console.log('Direct fetch failed, using CORS proxy...');
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(WARFRAME_DATA_URL)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error('Failed to fetch data through proxy');
      }
      
      const html = await proxyResponse.text();
      return parseWarframeData(html);
    }

    const html = await response.text();
    return parseWarframeData(html);
    
  } catch (error) {
    console.error('Error fetching Warframe drop data:', error);
    throw error;
  }
}

function parseWarframeData(html: string): ParsedDropData {
  // Create a DOM parser to extract data from the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const dropData: ParsedDropData = {};
  
  // Find all mission tables
  const missionTables = doc.querySelectorAll('h3');
  
  missionTables.forEach((table) => {
    const location = table.textContent?.trim() || '';
    const items: { name: string; dropChance: number; }[] = [];
    
    // Get the next table element
    let nextElement = table.nextElementSibling;
    while (nextElement && nextElement.tagName !== 'H3') {
      if (nextElement.tagName === 'TABLE') {
        const rows = nextElement.querySelectorAll('tr');
        
        rows.forEach((row) => {
          const columns = row.querySelectorAll('td');
          if (columns.length >= 2) {
            const name = columns[0].textContent?.trim() || '';
            const dropChanceText = columns[1].textContent?.trim() || '0';
            const dropChance = parseFloat(dropChanceText.replace('%', ''));
            
            if (name && !isNaN(dropChance)) {
              items.push({ name, dropChance });
            }
          }
        });
      }
      nextElement = nextElement.nextElementSibling;
    }
    
    if (items.length > 0) {
      // Sort items by drop chance in descending order
      items.sort((a, b) => b.dropChance - a.dropChance);
      dropData[location] = items;
    }
  });
  
  console.log('Successfully parsed Warframe drop data');
  return dropData;
}