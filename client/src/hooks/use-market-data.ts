import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePrices() {
  return useQuery({
    queryKey: [api.prices.get.path],
    queryFn: async () => {
      const res = await fetch(api.prices.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useNobitexPrices() {
  return useQuery({
    queryKey: ['/api/nobitex'],
    queryFn: async () => {
      const res = await fetch('/api/nobitex', { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch Nobitex prices");
      return res.json();
    },
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useNobitexTrades(symbol: string) {
  return useQuery({
    queryKey: ['/api/nobitex/trades', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/nobitex/trades/${symbol}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
