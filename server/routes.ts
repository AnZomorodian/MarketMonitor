import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import type { PriceItem, CategorizedPrices } from "@shared/schema";

const CRYPTO_SYMBOLS = ['BITCOIN', 'ETH', 'USDT', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'TRX', 'LTC', 'BCH', 'LINK', 'DOT', 'AVAX', 'SHIB', 'ATOM', 'UNI', 'XLM', 'VET', 'FIL', 'EOS', 'DASH', 'XMR', 'TON', 'MATIC'];
const GOLD_SYMBOLS = ['GOL18', 'MITHQAL', 'EMAMI1', 'AZADI1', 'AZADI1_2', 'AZADI1_4', 'AZADI1G', 'OUNCE', 'XAGUSD'];

function categorizePrices(items: PriceItem[]): CategorizedPrices {
  const crypto: PriceItem[] = [];
  const gold: PriceItem[] = [];
  const currencies: PriceItem[] = [];

  for (const item of items) {
    if (CRYPTO_SYMBOLS.includes(item.symbol)) {
      crypto.push(item);
    } else if (GOLD_SYMBOLS.includes(item.symbol)) {
      gold.push(item);
    } else {
      currencies.push(item);
    }
  }

  return { crypto, gold, currencies };
}

async function fetchBaha24Prices(): Promise<PriceItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://baha24.com/api/v1/price', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Baha24 API failed');
    
    const data = await response.json();
    return data as PriceItem[];
  } catch (error) {
    console.error("Error fetching Baha24:", error);
    return [];
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.prices.get.path, async (req, res) => {
    try {
      const cached = await storage.getPrices();
      if (cached) {
        return res.json({
          ...cached.data,
          lastUpdated: cached.lastUpdated
        });
      }

      const rawPrices = await fetchBaha24Prices();
      
      if (rawPrices.length === 0) {
        return res.status(503).json({ message: "Unable to fetch prices from Baha24" });
      }

      const categorized = categorizePrices(rawPrices);
      await storage.savePrices(categorized);

      res.json({
        ...categorized,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Prices fetch error:", error);
      res.status(500).json({ message: "Failed to fetch prices" });
    }
  });

  return httpServer;
}
