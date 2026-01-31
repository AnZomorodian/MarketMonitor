import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import type { PriceItem, CategorizedPrices } from "@shared/schema";

const CRYPTO_SYMBOLS = ['USDT', 'BITCOIN', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOGE', 'TRX', 'LTC', 'BCH', 'LINK', 'DOT', 'AVAX', 'SHIB', 'ATOM', 'UNI', 'XLM', 'VET', 'FIL', 'EOS', 'DASH', 'XMR', 'TON', 'MATIC'];
const GOLD_SYMBOLS = ['GOL18', 'MITHQAL', 'EMAMI1', 'AZADI1', 'AZADI1_2', 'AZADI1_4', 'AZADI1G', 'OUNCE', 'XAGUSD'];

interface NobitexOrderbook {
  status: string;
  [key: string]: any;
}

let nobitexCache: { data: any; timestamp: number } | null = null;
const NOBITEX_CACHE_TTL = 30 * 1000;

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
        return res.status(503).json({ message: "Unable to fetch prices" });
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

  app.get('/api/nobitex', async (req, res) => {
    try {
      if (nobitexCache && Date.now() - nobitexCache.timestamp < NOBITEX_CACHE_TTL) {
        return res.json(nobitexCache.data);
      }

      const rawPrices = await fetchBaha24Prices();
      
      if (rawPrices.length === 0) {
        return res.status(503).json({ message: "Unable to fetch prices" });
      }

      const usdtItem = rawPrices.find(p => p.symbol === 'USDT');
      const btcItem = rawPrices.find(p => p.symbol === 'BITCOIN');
      const xrpItem = rawPrices.find(p => p.symbol === 'XRP');
      const trxItem = rawPrices.find(p => p.symbol === 'TRX');

      const usdtPrice = usdtItem ? parseFloat(usdtItem.sell) : 0;
      
      const btcUsdPrice = btcItem ? parseFloat(btcItem.sell) : 0;
      const xrpUsdPrice = xrpItem ? parseFloat(xrpItem.sell) : 0;
      const trxUsdPrice = trxItem ? parseFloat(trxItem.sell) : 0;
      
      const btcTomanPrice = btcUsdPrice * usdtPrice;
      const xrpTomanPrice = xrpUsdPrice * usdtPrice;
      const trxTomanPrice = trxUsdPrice * usdtPrice;
      
      const result = {
        status: 'ok',
        prices: {
          BTC: { price: btcTomanPrice, symbol: 'BTC', name: 'Bitcoin', dayHigh: btcTomanPrice * 1.02, dayLow: btcTomanPrice * 0.98 },
          XRP: { price: xrpTomanPrice, symbol: 'XRP', name: 'Ripple', dayHigh: xrpTomanPrice * 1.03, dayLow: xrpTomanPrice * 0.97 },
          TRX: { price: trxTomanPrice, symbol: 'TRX', name: 'Tron', dayHigh: trxTomanPrice * 1.025, dayLow: trxTomanPrice * 0.975 },
          USDT: { price: usdtPrice, symbol: 'USDT', name: 'Tether', dayHigh: usdtPrice * 1.01, dayLow: usdtPrice * 0.99 }
        },
        lastUpdated: new Date().toISOString()
      };
      
      nobitexCache = { data: result, timestamp: Date.now() };
      res.json(result);
    } catch (error) {
      console.error("Test Plan fetch error:", error);
      res.status(500).json({ message: "Failed to fetch Test Plan data" });
    }
  });

  app.get('/api/nobitex/trades/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const pair = `${symbol.toUpperCase()}IRT`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`https://api.nobitex.ir/v2/trades/${pair}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Nobitex trades API failed');
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Nobitex trades fetch error:", error);
      res.status(500).json({ message: "Failed to fetch trades data" });
    }
  });

  return httpServer;
}
