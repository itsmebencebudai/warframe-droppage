import { DropData, ParsedDropData } from './types';

const WARFRAME_DATA_URL = 'https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html';

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log('Fetching Warframe drop data...');
  
  try {
    const response = await fetch(WARFRAME_DATA_URL);
    const html = await response.text();
    
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
    
  } catch (error) {
    console.error('Error fetching Warframe drop data:', error);
    throw new Error('Failed to fetch Warframe drop data');
  }
}