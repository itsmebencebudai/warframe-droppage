import { ParsedDropData } from "./types";
import { dropDataLibrary } from "./dropDataLibrary";

export async function fetchWarframeData(): Promise<ParsedDropData> {
  console.log("Fetching Warframe drop data from local library...");
  return dropDataLibrary;
}