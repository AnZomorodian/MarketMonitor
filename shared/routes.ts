import { z } from 'zod';
import { priceItemSchema } from './schema';

export const api = {
  prices: {
    get: {
      method: 'GET' as const,
      path: '/api/prices',
      responses: {
        200: z.object({
          crypto: z.array(priceItemSchema),
          gold: z.array(priceItemSchema),
          currencies: z.array(priceItemSchema),
          lastUpdated: z.string()
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
