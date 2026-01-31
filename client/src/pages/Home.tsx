import { usePrices } from "@/hooks/use-market-data";
import { PriceCard } from "@/components/PriceCard";
import { GoldChart } from "@/components/GoldChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Coins, Sparkles, Banknote, Clock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl border bg-card/50">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data, isLoading, isError, refetch, isRefetching } = usePrices();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Unable to Load Prices</h1>
          <p className="text-muted-foreground">We couldn't fetch the latest prices. Please try again.</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Data
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Just Check <span className="text-primary">Market</span>
            </h1>
            <p className="text-muted-foreground">
              Real-time market prices
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-primary" />
            <span>Auto-refresh: 5 min</span>
            <button 
              onClick={() => refetch()}
              disabled={isRefetching}
              className={`p-2 rounded-full hover:bg-white/5 transition-colors ${isRefetching ? 'animate-spin text-primary' : ''}`}
              title="Refresh Now"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <Tabs defaultValue="crypto" className="space-y-6">
          <TabsList className="bg-secondary/40 p-1 border border-white/5 rounded-lg inline-flex">
            <TabsTrigger value="crypto" className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Coins className="w-4 h-4" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="gold" className="px-4 py-2 rounded-md data-[state=active]:bg-yellow-500 data-[state=active]:text-black gap-2">
              <Sparkles className="w-4 h-4" />
              Gold & Coins
            </TabsTrigger>
            <TabsTrigger value="currencies" className="px-4 py-2 rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white gap-2">
              <Banknote className="w-4 h-4" />
              Currencies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="focus:outline-none">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {data?.crypto?.map((item: any) => (
                  <PriceCard key={item.symbol} item={item} type="crypto" />
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="gold" className="focus:outline-none">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <GoldChart data={data?.gold || []} />
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {data?.gold?.map((item: any) => (
                    <PriceCard key={item.symbol} item={item} type="gold" />
                  ))}
                </motion.div>
              </>
            )}
          </TabsContent>

          <TabsContent value="currencies" className="focus:outline-none">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {data?.currencies?.map((item: any) => (
                  <PriceCard key={item.symbol} item={item} type="currency" />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        <footer className="pt-16 pb-8 text-center space-y-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent max-w-xl mx-auto" />
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground font-medium">
              Built by <span className="text-primary">Artin Zomorodian</span>
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a 
                href="https://t.me/ArtinZomorodian" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.02-2.38-1.63-1.05-.71-1.72-1.21-1.72-1.21-.05-.08.02-.15.11-.22.68-.52 1.5-1.16 2.22-1.74.09-.07-.03-.1-.08-.06-.52.36-1.17.82-1.68 1.18l-1.35.95c-.38.27-.8.42-1.25.42-.48 0-.97-.13-1.42-.36l-.8-.42c-.42-.22-.43-.44.09-.64.64-.25 2.58-1.01 5.3-2.03 2.73-1.02 4.48-1.69 5.3-2 1.87-.71 2.26-.84 2.51-.84.05 0 .17.01.25.04.17.06.32.18.39.42.08.26.06.54.02.67z"/>
                </svg>
                Telegram
              </a>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <a 
                href="https://DeepInkteam.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4" />
                DeepInkteam.com
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Updates every 5 minutes
          </p>
        </footer>
      </div>
    </div>
  );
}
