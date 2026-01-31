import { useNobitexPrices } from "@/hooks/use-market-data";
import { motion } from "framer-motion";
import { RefreshCcw, TrendingUp, Clock, TrendingDown, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface PriceData {
  price: number;
  symbol: string;
  name: string;
  dayHigh?: number;
  dayLow?: number;
}

interface PriceHistory {
  time: string;
  price: number;
}

interface CryptoCardProps {
  symbol: string;
  name: string;
  price: number;
  dayHigh: number;
  dayLow: number;
  color: string;
  history: PriceHistory[];
}

function generateInitialHistory(price: number, dayHigh: number, dayLow: number): PriceHistory[] {
  const history: PriceHistory[] = [];
  const points = 24;
  const range = dayHigh - dayLow;
  
  for (let i = 0; i < points; i++) {
    const hour = 24 - points + i;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const randomFactor = Math.sin(i * 0.5) * 0.5 + Math.random() * 0.3;
    const simulatedPrice = dayLow + range * (0.3 + randomFactor * 0.4);
    history.push({ time: timeStr, price: simulatedPrice });
  }
  
  if (history.length > 0) {
    history[history.length - 1].price = price;
  }
  
  return history;
}

function CryptoCard({ symbol, name, price, dayHigh, dayLow, color, history }: CryptoCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US').format(Math.round(price));
  const formattedHigh = new Intl.NumberFormat('en-US').format(Math.round(dayHigh));
  const formattedLow = new Intl.NumberFormat('en-US').format(Math.round(dayLow));
  
  const priceChange = dayHigh > 0 ? ((price - dayLow) / (dayHigh - dayLow) * 100).toFixed(1) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-opacity-30 transition-all"
      style={{ borderColor: `${color}30` }}
      data-testid={`card-crypto-${symbol}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>{formattedPrice}</p>
          <p className="text-xs text-muted-foreground">Toman</p>
        </div>
      </div>
      
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              formatter={(value: number) => [`${new Intl.NumberFormat('en-US').format(Math.round(value))} Toman`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-muted-foreground">24h High</p>
            <p className="font-medium text-green-400">{formattedHigh}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 rounded-lg p-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-xs text-muted-foreground">24h Low</p>
            <p className="font-medium text-red-400">{formattedLow}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestPlanSection() {
  const { data, isLoading, isError, refetch, isRefetching } = useNobitexPrices();
  const [priceHistories, setPriceHistories] = useState<Record<string, PriceHistory[]>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data?.prices && !initialized) {
      const histories: Record<string, PriceHistory[]> = {};
      ['BTC', 'XRP', 'TRX'].forEach(symbol => {
        const priceData = data.prices[symbol] as PriceData;
        if (priceData) {
          histories[symbol] = generateInitialHistory(
            priceData.price,
            priceData.dayHigh || priceData.price * 1.02,
            priceData.dayLow || priceData.price * 0.98
          );
        }
      });
      setPriceHistories(histories);
      setInitialized(true);
    } else if (data?.prices && initialized) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      setPriceHistories(prev => {
        const newHistories: Record<string, PriceHistory[]> = {};
        ['BTC', 'XRP', 'TRX'].forEach(symbol => {
          const priceData = data.prices[symbol] as PriceData;
          if (priceData) {
            const existing = prev[symbol] || [];
            const updated = [...existing, { time: timeStr, price: priceData.price }];
            newHistories[symbol] = updated.slice(-48);
          }
        });
        return newHistories;
      });
    }
  }, [data, initialized]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card/50 border rounded-xl p-5 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-20 mb-2" />
            <div className="h-4 bg-white/10 rounded w-32 mb-4" />
            <div className="h-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <p className="text-red-400 font-medium mb-2">Unable to connect to Nobitex</p>
          <p className="text-sm text-muted-foreground">The Nobitex API may be temporarily unavailable</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          data-testid="button-retry-nobitex"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'XRP', name: 'Ripple', color: '#00aae4' },
    { symbol: 'TRX', name: 'Tron', color: '#ef0027' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
            Live Crypto Prices
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Auto-refresh: 1 min</span>
          </div>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isRefetching}
          className={`p-2 rounded-full hover:bg-white/5 transition-colors ${isRefetching ? 'animate-spin text-purple-400' : 'text-muted-foreground'}`}
          title="Refresh Now"
          data-testid="button-refresh-nobitex"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {data?.prices?.USDT && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                $
              </div>
              <div>
                <h3 className="font-bold text-foreground">USDT / Toman</h3>
                <p className="text-sm text-muted-foreground">Tether Exchange Rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-400" data-testid="text-usdt-price">
                {new Intl.NumberFormat('en-US').format(Math.round((data.prices.USDT as PriceData).price))}
              </p>
              <p className="text-sm text-muted-foreground">Toman</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cryptos.map(crypto => {
          const priceData = data?.prices?.[crypto.symbol] as PriceData | undefined;
          return (
            <CryptoCard
              key={crypto.symbol}
              symbol={crypto.symbol}
              name={crypto.name}
              price={priceData?.price || 0}
              dayHigh={priceData?.dayHigh || 0}
              dayLow={priceData?.dayLow || 0}
              color={crypto.color}
              history={priceHistories[crypto.symbol] || []}
            />
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/60 text-center">
        Prices in Toman (USDT rate applied) - Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
      </p>
    </div>
  );
}
