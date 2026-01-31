import { z } from "zod";

export type PriceItem = {
  title: string;
  symbol: string;
  sell: string;
  last_update: string;
};

export type CategorizedPrices = {
  crypto: PriceItem[];
  gold: PriceItem[];
  currencies: PriceItem[];
};

export const priceItemSchema = z.object({
  title: z.string(),
  symbol: z.string(),
  sell: z.string(),
  last_update: z.string()
});

export const pricesResponseSchema = z.array(priceItemSchema);
