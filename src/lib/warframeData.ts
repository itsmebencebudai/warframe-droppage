import { ParsedDropData } from "./types";

const CORS_PROXY = "https://corsproxy.io/?";
const WARFRAME_DATA_URL = "https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html";

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log("Fetching Warframe drop data...");
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(WARFRAME_DATA_URL));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // Parse the HTML content to extract drop data
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const dropData: ParsedDropData = {};
    
    // Find all mission sections
    const missionSections = doc.querySelectorAll('h3');
    missionSections.forEach(section => {
      const location = section.textContent?.trim() || '';
      const items: { name: string; dropChance: number; }[] = [];
      
      // Get the next table after this section header
      const table = section.nextElementSibling as HTMLTableElement;
      if (table && table.tagName === 'TABLE') {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const name = cells[0].textContent?.trim() || '';
            const chanceText = cells[1].textContent?.trim() || '0';
            const dropChance = parseFloat(chanceText.replace('%', ''));
            if (name && !isNaN(dropChance)) {
              items.push({ name, dropChance });
            }
          }
        });
      }
      
      if (items.length > 0) {
        dropData[location] = items;
      }
    });
    
    return dropData;
  } catch (error) {
    console.error("Error fetching Warframe drop data:", error);
    throw error;
  }
}