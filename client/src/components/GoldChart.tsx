import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
  'ربع سکه': 'Azadi 1/4',
  'نیم سکه': 'Azadi 1/2',
};

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#eab308', '#facc15', '#fef08a', '#d97706', '#b45309'];

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

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Gold & Coins Price Comparison (Million Toman)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${new Intl.NumberFormat('en-US').format(props.payload.fullValue)} Toman`,
                'Price'
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
