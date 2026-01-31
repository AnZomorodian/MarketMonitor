import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import type { PriceItem } from "@shared/schema";

interface GoldChartProps {
  data: PriceItem[];
}

const ENGLISH_NAMES: Record<string, string> = {
  'سکه امامی': 'Emami',
  'گرم طلا': 'Gold 1g',
  'انس طلا': 'Ounce',
  'تمام سکه': 'Azadi (1)',
  'سکه ۱ گرمی': 'Azadi 1g',
  'انس نقره': 'Silver',
  'مثقال طلا': 'Mithqal',
  'ربع سکه': '1/4 Azadi',
  'نیم سکه': '1/2 Azadi',
};

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#eab308', '#d97706', '#b45309'];

export function GoldChart({ data }: GoldChartProps) {
  const chartData = data
    .filter(item => parseFloat(item.sell) > 100000)
    .map(item => ({
      name: ENGLISH_NAMES[item.title] || item.symbol,
      value: parseFloat(item.sell) / 1000000,
      fullValue: parseFloat(item.sell),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <span className="text-xl">🪙</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Gold & Coins Overview</h3>
          <p className="text-sm text-muted-foreground">Prices in Million Toman</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={item.name} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <span className="text-sm font-bold text-yellow-400">
                {new Intl.NumberFormat('en-US').format(item.fullValue)} T
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {chartData.length}
            </p>
            <p className="text-xs text-muted-foreground">Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">
              {(chartData[0]?.value || 0).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">Highest</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">
              {(chartData[chartData.length - 1]?.value || 0).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">Lowest</p>
          </div>
        </div>
      </div>
    </div>
  );
}
