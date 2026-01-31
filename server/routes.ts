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

let nobitexOrderbookCache: { data: any; timestamp: number } | null = null;
const NOBITEX_ORDERBOOK_CACHE_TTL = 30 * 1000;

const NOBITEX_CRYPTO_PAIRS: Record<string, { symbol: string; name: string }> = {
  'BTCUSDT': { symbol: 'BTC', name: 'Bitcoin' },
  'ETHUSDT': { symbol: 'ETH', name: 'Ethereum' },
  'XRPUSDT': { symbol: 'XRP', name: 'Ripple' },
  'LTCUSDT': { symbol: 'LTC', name: 'Litecoin' },
  'BNBUSDT': { symbol: 'BNB', name: 'Binance Coin' },
  'TRXUSDT': { symbol: 'TRX', name: 'Tron' },
  'DOGEUSDT': { symbol: 'DOGE', name: 'Dogecoin' },
  'ADAUSDT': { symbol: 'ADA', name: 'Cardano' },
  'SOLUSDT': { symbol: 'SOL', name: 'Solana' },
  'AVAXUSDT': { symbol: 'AVAX', name: 'Avalanche' },
  'DOTUSDT': { symbol: 'DOT', name: 'Polkadot' },
  'LINKUSDT': { symbol: 'LINK', name: 'Chainlink' },
  'MATICUSDT': { symbol: 'MATIC', name: 'Polygon' },
  'ATOMUSDT': { symbol: 'ATOM', name: 'Cosmos' },
  'UNIUSDT': { symbol: 'UNI', name: 'Uniswap' },
  'XLMUSDT': { symbol: 'XLM', name: 'Stellar' },
  'ETCUSDT': { symbol: 'ETC', name: 'Ethereum Classic' },
  'FILUSDT': { symbol: 'FIL', name: 'Filecoin' },
  'VETUSDT': { symbol: 'VET', name: 'VeChain' },
  'AAVEUSDT': { symbol: 'AAVE', name: 'Aave' },
  'XMRUSDT': { symbol: 'XMR', name: 'Monero' },
  'EOSUSDT': { symbol: 'EOS', name: 'EOS' },
  'NEOUSDT': { symbol: 'NEO', name: 'Neo' },
  'SANDUSDT': { symbol: 'SAND', name: 'The Sandbox' },
  'SHIBUSDT': { symbol: 'SHIB', name: 'Shiba Inu' },
  'TONUSDT': { symbol: 'TON', name: 'Toncoin' },
};

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
      if (nobitexOrderbookCache && Date.now() - nobitexOrderbookCache.timestamp < NOBITEX_ORDERBOOK_CACHE_TTL) {
        return res.json(nobitexOrderbookCache.data);
      }

      const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(url, {
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
              }
            });
            clearTimeout(timeoutId);
            return response;
          } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          }
        }
        throw new Error('All retries failed');
      };
      
      const response = await fetchWithRetry('https://apiv2.nobitex.ir/v3/orderbook/all');
      
      if (!response.ok) {
        throw new Error('Nobitex orderbook API failed');
      }
      
      const data = await response.json() as NobitexOrderbook;
      
      if (data.status !== 'ok') {
        throw new Error('Nobitex API returned error status');
      }

      const prices: Record<string, any> = {};
      
      for (const [pair, info] of Object.entries(NOBITEX_CRYPTO_PAIRS)) {
        const orderbook = data[pair];
        if (orderbook && orderbook.lastTradePrice) {
          const price = parseFloat(orderbook.lastTradePrice);
          prices[info.symbol] = {
            price,
            symbol: info.symbol,
            name: info.name,
            dayHigh: price * 1.02,
            dayLow: price * 0.98,
            lastUpdate: orderbook.lastUpdate || Date.now()
          };
        }
      }

      const rawPrices = await fetchBaha24Prices();
      const usdtItem = rawPrices.find(p => p.symbol === 'USDT');
      const usdtPrice = usdtItem ? parseFloat(usdtItem.sell) : 0;
      
      if (usdtPrice > 0) {
        prices['USDT'] = {
          price: usdtPrice,
          symbol: 'USDT',
          name: 'Tether',
          dayHigh: usdtPrice * 1.01,
          dayLow: usdtPrice * 0.99
        };
      }
      
      const result = {
        status: 'ok',
        prices,
        lastUpdated: new Date().toISOString()
      };
      
      nobitexOrderbookCache = { data: result, timestamp: Date.now() };
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
