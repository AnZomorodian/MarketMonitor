import type { CategorizedPrices } from "@shared/schema";

export interface IStorage {
  getPrices(): Promise<{ data: CategorizedPrices; lastUpdated: string } | null>;
  savePrices(data: CategorizedPrices): Promise<void>;
}

export class MemStorage implements IStorage {
  private cache: CategorizedPrices | null = null;
  private lastUpdated: number = 0;

  async getPrices() {
    if (this.cache && Date.now() - this.lastUpdated < 5 * 60 * 1000) {
      return { 
        data: this.cache, 
        lastUpdated: new Date(this.lastUpdated).toISOString() 
      };
    }
    return null;
  }

  async savePrices(data: CategorizedPrices) {
    this.cache = data;
    this.lastUpdated = Date.now();
  }
}

export const storage = new MemStorage();
