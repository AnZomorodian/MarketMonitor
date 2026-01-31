import { motion } from "framer-motion";
import { Sparkles, DollarSign, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceItem } from "@shared/schema";

interface PriceCardProps {
  item: PriceItem;
  type: 'crypto' | 'gold' | 'currency';
}

const ENGLISH_NAMES: Record<string, string> = {
  'تتر': 'Tether',
  'بیت کوین': 'Bitcoin',
  'ریپل': 'Ripple',
  'اتریوم': 'Ethereum',
  'بایننس کوین': 'Binance Coin',
  'بیت کوین کش': 'Bitcoin Cash',
  'ترون': 'Tron',
  'لایت کوین': 'Litecoin',
  'دوج کوین': 'Dogecoin',
  'سولانا': 'Solana',
  'مونرو': 'Monero',
  'ایاس': 'EOS',
  'دش': 'Dash',
  'پولکادات': 'Polkadot',
  'تون کوین': 'Toncoin',
  'کاردانو': 'Cardano',
  'اوالانچ': 'Avalanche',
  'فایل کوین': 'Filecoin',
  'استلار': 'Stellar',
  'شیبا اینو': 'Shiba Inu',
  'وی چین': 'VeChain',
  'چین لینک': 'Chainlink',
  'متیک - پولیگان': 'Polygon',
  'کازموس': 'Cosmos',
  'یونی سواپ': 'Uniswap',
  'سکه امامی': 'Emami Coin',
  'گرم طلا': 'Gold (1 Gram)',
  'انس طلا': 'Gold Ounce',
  'تمام سکه': 'Full Azadi Coin',
  'سکه ۱ گرمی': 'Azadi (1g)',
  'انس نقره': 'Silver Ounce',
  'مثقال طلا': 'Gold Mithqal',
  'ربع سکه': 'Azadi (1/4)',
  'نیم سکه': 'Azadi (1/2)',
  'دلار آمریکا': 'US Dollar',
  'یورو': 'Euro',
  'پوند انگلیس': 'British Pound',
  'درهم امارات': 'UAE Dirham',
  'یوان چین': 'Chinese Yuan',
  'لیر ترکیه': 'Turkish Lira',
  'روبل روسیه': 'Russian Ruble',
  'دلار کانادا': 'Canadian Dollar',
  'فرانک سوئیس': 'Swiss Franc',
  'دلار صرافی ملی': 'National Exchange USD',
  'روپیه هند': 'Indian Rupee',
  'ریال عمان': 'Omani Rial',
  'افغانی': 'Afghan Afghani',
  'دینار کویت': 'Kuwaiti Dinar',
  'رینگیت مالزی': 'Malaysian Ringgit',
  'کرون دانمارک': 'Danish Krone',
  'منات آذربایجان': 'Azerbaijani Manat',
  'بات تایلند': 'Thai Baht',
  'کرون نروژ': 'Norwegian Krone',
  'کرون سوئد': 'Swedish Krona',
  '۱۰ ین ژاپن': 'Japanese Yen (10)',
  'دلار استرالیا': 'Australian Dollar',
  'دلار سنگاپور': 'Singapore Dollar',
};

function formatSymbol(symbol: string): string {
  if (symbol === 'AZADI1') return 'AZADI (1)';
  if (symbol === 'AZADI1_2') return 'AZADI (1/2)';
  if (symbol === 'AZADI1_4') return 'AZADI (1/4)';
  if (symbol === 'AZADI1G') return 'AZADI (1g)';
  return symbol;
}

function getEnglishName(persianName: string): string {
  return ENGLISH_NAMES[persianName] || persianName;
}

function formatPrice(price: string, type: 'crypto' | 'gold' | 'currency'): string {
  const num = parseFloat(price);
  if (type === 'crypto' && num < 1) {
    return num.toFixed(8);
  }
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

function getIcon(type: 'crypto' | 'gold' | 'currency') {
  switch (type) {
    case 'gold': return Sparkles;
    case 'currency': return DollarSign;
    default: return Coins;
  }
}

export function PriceCard({ item, type }: PriceCardProps) {
  const Icon = getIcon(type);
  const formattedPrice = formatPrice(item.sell, type);
  const suffix = 'Toman';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden p-5 rounded-xl border transition-all duration-300",
        "bg-card/50 backdrop-blur-sm hover:shadow-lg",
        type === 'gold' && "hover:border-yellow-500/30 hover:shadow-yellow-500/5",
        type === 'crypto' && "hover:border-blue-500/30 hover:shadow-blue-500/5",
        type === 'currency' && "hover:border-green-500/30 hover:shadow-green-500/5"
      )}
    >
      <div className={cn(
        "absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br",
        type === 'gold' && "from-yellow-500/30 to-transparent",
        type === 'crypto' && "from-blue-500/30 to-transparent",
        type === 'currency' && "from-green-500/30 to-transparent"
      )} />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={cn(
              "w-4 h-4 flex-shrink-0",
              type === 'gold' && "text-yellow-400",
              type === 'crypto' && "text-blue-400",
              type === 'currency' && "text-green-400"
            )} />
            <h3 className="text-lg font-bold text-foreground truncate">{formatSymbol(item.symbol)}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">{getEnglishName(item.title)}</p>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formattedPrice}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">
          {item.last_update}
        </p>
      </div>
    </motion.div>
  );
}
