import { ParsedDropData } from "./types";
import { dropDataLibrary } from "./dropDataLibrary";

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log("Fetching Warframe drop data from local library...");
  return dropDataLibrary;
}

export async function fetchWarframeDataFromSource(): Promise<ParsedDropData> {
  console.log("Attempting to fetch Warframe drop data from source...");
  try {
    const response = await fetch('https://api.warframe.market/v1/items');
    if (!response.ok) {
      console.error("Failed to fetch from Warframe Market API:", response.statusText);
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    console.log("Successfully fetched data from Warframe Market API");
    
    // Process the data into our format
    const processedData: ParsedDropData = {};
    
    // Log the raw data for debugging
    console.log("Raw data from API:", data);
    
    return processedData;
  } catch (error) {
    console.error("Error fetching from source:", error);
    console.log("Falling back to local library...");
    return dropDataLibrary;
  }
}