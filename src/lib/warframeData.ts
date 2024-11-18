import { ParsedDropData } from "./types";
import { dropDataLibrary } from "./dropDataLibrary";

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log("Fetching Warframe drop data from local library...");
  return dropDataLibrary;
}

export async function fetchWarframeDataFromSource(): Promise<ParsedDropData> {
  console.log("Attempting to fetch Warframe drop data from source...");
  try {
    const response = await fetch('https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html');
    if (!response.ok) {
      console.error("Failed to fetch from Warframe drops page:", response.statusText);
      throw new Error('Failed to fetch data');
    }
    const html = await response.text();
    console.log("Successfully fetched HTML from Warframe drops page");
    
    // Create a DOM parser to work with the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Process the data into our format
    const processedData: ParsedDropData = {};
    
    // Find all tables in the document
    const tables = doc.querySelectorAll('table');
    console.log(`Found ${tables.length} tables in the document`);
    
    tables.forEach((table) => {
      // Get the table's header (location)
      const locationHeader = table.previousElementSibling;
      if (!locationHeader) return;
      
      const location = locationHeader.textContent?.trim() || 'Unknown Location';
      processedData[location] = [];
      
      // Process each row in the table
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const itemName = cells[0].textContent?.trim() || '';
          const dropChance = parseFloat(cells[1].textContent?.replace('%', '') || '0');
          
          if (itemName && !isNaN(dropChance)) {
            processedData[location].push({
              name: itemName,
              dropChance: dropChance
            });
          }
        }
      });
    });
    
    console.log("Processed data from HTML:", processedData);
    return processedData;
    
  } catch (error) {
    console.error("Error fetching from source:", error);
    console.log("Falling back to local library...");
    return dropDataLibrary;
  }
}