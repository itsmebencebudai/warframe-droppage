export interface DropData {
  location: string;
  items: {
    name: string;
    dropChance: number;
  }[];
}

export interface ParsedDropData {
  [key: string]: {
    name: string;
    dropChance: number;
  }[];
}