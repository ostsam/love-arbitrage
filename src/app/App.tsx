import React, { useEffect, useRef, useState } from 'react';
import { Ticker } from './components/Ticker';
import { GlobalIndexChart } from './components/GlobalIndexChart';
import { MarketCard } from './components/MarketCard';
import { CandlestickChart } from './components/CandlestickChart';
import { AnalysisOverlay } from './components/AnalysisOverlay';
import { Sidebar } from './components/Sidebar';
import { MarketSection } from './components/MarketSection';
import { ProfileSection } from './components/ProfileSection';
import { ALL_ASSETS } from './data/market-data';
import {
  Mic,
  Search,
  Bell,
  Menu,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  LogIn,
  X,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  RecordingService,
  type WiretapMarketUpdate,
} from '../../services/services/recording';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c0ec1358`;
const DEFAULT_WIRETAP_SYMBOL = '$CHAD-BRITT';

const INITIAL_INSIDER_TRADING: WiretapMarketUpdate[] = [
  {
    id: 'seed-1',
    symbol: '$CHAD-BRITT',
    user: 'QUANT_LAUREN',
    time: '2m ago',
    quote: 'Weekend argument frequency spiking. I am widening my short spread.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-2',
    symbol: '$CHAD-BRITT',
    user: 'INSIDER_47',
    time: '6m ago',
    quote: 'Two-word replies and zero eye contact. Momentum still bearish.',
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-3',
    symbol: '$KYLE-SARA',
    user: 'BETA_HUNTER',
    time: '11m ago',
    quote: 'Joint vacation planning resumed. Long thesis is intact for now.',
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
  },
];

const mergeMarketUpdates = (
  current: WiretapMarketUpdate[],
  incoming: WiretapMarketUpdate[],
): WiretapMarketUpdate[] => {
  const map = new Map<string, WiretapMarketUpdate>();

  [...incoming, ...current].forEach((item, index) => {
    const key = item.id || `${item.symbol}-${item.createdAt || index}-${item.quote}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values())
    .sort((a, b) => {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return bt - at;
    })
    .slice(0, 40);
};

const formatFeedTime = (item: WiretapMarketUpdate): string => {
  if (item.time) return item.time;
  if (!item.createdAt) return 'now';

  const diffMs = Date.now() - new Date(item.createdAt).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const hydrateAssetFromMarket = (
  symbol: string,
  market?: { price: number; change: number },
) => {
  const base = ALL_ASSETS.find((asset) => asset.symbol === symbol);
  if (!base) return null;
  if (!market) return base;

  const formattedChange = `${market.change >= 0 ? '+' : ''}${market.change.toFixed(2)}%`;

  return {
    ...base,
    price: market.price.toFixed(2),
    change: formattedChange,
    isUp: market.change >= 0,
  };
};

const Dashboard = ({
  onSelectAsset,
  onUpload,
  isUploading,
}: {
  onSelectAsset: (asset: any) => void;
  onUpload: () => void;
  isUploading: boolean;
}) => {
  const publicMarket = ALL_ASSETS.filter((a) => a.category === 'Public').slice(0, 4);
  const privateEquity = ALL_ASSETS.filter((a) => a.category === 'Private').slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d]">
      <div className="p-4 space-y-4">
        <GlobalIndexChart />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
              <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                <TrendingUp size={14} className="text-[#00f090]" />
                Public Market (Celebrity)
              </h2>
              <span className="font-['Space_Mono'] text-[9px] text-[#717182]">VOL: 1.4B</span>
            </div>
            <div className="space-y-2">
              {publicMarket.map((asset) => (
                <MarketCard key={asset.symbol} {...asset} onClick={() => onSelectAsset(asset)} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
              <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                <ShieldAlert size={14} className="text-[#ff2e51]" />
                Private Equity (Friends)
              </h2>
              <span className="font-['Space_Mono'] text-[9px] text-[#717182]">RISK: CRITICAL</span>
            </div>
            <div className="space-y-2">
              {privateEquity.map((asset) => (
                <MarketCard key={asset.symbol} {...asset} onClick={() => onSelectAsset(asset)} />
              ))}
            </div>

            <div className="bg-[#1e222d] border border-dashed border-[#ff2e51]/40 p-4 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="text-[#ff2e51]" size={24} />
              <div>
                <p className="font-['Space_Mono'] text-[10px] text-ghost-white font-bold">
                  UNREGISTERED DOMESTIC PARTNERSHIP DETECTED
                </p>
                <p className="text-[9px] text-[#717182] mt-1">Submit evidence to open a short position.</p>
              </div>
              <button
                onClick={onUpload}
                disabled={isUploading}
                className="w-full py-2 border border-[#ff2e51] text-[#ff2e51] font-bold text-[10px] hover:bg-[#ff2e51] hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? 'PROCESSING WIRETAP...' : 'INITIALIZE WIRETAP'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AssetDetailView = ({
  asset,
  onBack,
  onBet,
  insiderTrading,
}: {
  asset: any;
  onBack: () => void;
  onBet: (side: 'long' | 'short') => void;
  insiderTrading: WiretapMarketUpdate[];
}) => {
  const feedItems = insiderTrading
    .filter((item) => item.symbol === asset.symbol)
    .slice(0, 12);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d]">
      <div className="p-4 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#717182] hover:text-[#00f090] text-[10px] font-bold uppercase transition-colors"
        >
          <ChevronRight size={14} className="rotate-180" /> Back to Terminal
        </button>

        <div className="flex justify-between items-end border-b border-[#2a2e3a] pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#00f090] text-[#0a0b0d] px-2 py-0.5 font-['Space_Mono'] font-bold text-sm">ASSET</span>
              <h1 className="font-['Space_Mono'] text-4xl font-bold tracking-tighter text-ghost-white leading-none">
                {asset.symbol}
              </h1>
            </div>
            <p className="font-['Oswald'] text-xs text-[#717182] uppercase tracking-widest">{asset.names}</p>
          </div>
          <div className="text-right">
            <div className="font-['Space_Mono'] text-3xl font-bold text-ghost-white">${asset.price}</div>
            <div className={`font-['Space_Mono'] text-sm font-bold ${asset.isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
              {asset.change} (LATEST MOVE)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <CandlestickChart />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#0a0b0d] border border-[#2a2e3a] px-2 py-1 text-[9px] text-[#00f090] font-bold">1H</span>
                <span className="bg-[#0a0b0d] border border-[#2a2e3a] px-2 py-1 text-[9px] text-[#717182] font-bold">4H</span>
                <span className="bg-[#0a0b0d] border border-[#2a2e3a] px-2 py-1 text-[9px] text-[#717182] font-bold">1D</span>
              </div>

              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 pointer-events-none">
                <div className="bg-[#ff2e51] text-white text-[8px] px-1 font-bold mb-1">LATEST SIGNAL EVENT</div>
                <div className="w-px h-12 bg-[#ff2e51] mx-auto"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['PE RATIO: 4.2', 'BETA: 1.85', 'VOLATILITY: HIGH', 'MARKET CAP: $2.4B', 'DIVIDEND: 0%', 'P/E: N/A'].map((stat) => (
                <div key={stat} className="bg-[#1e222d] border border-[#2a2e3a] p-2 font-['Space_Mono'] text-[9px] text-[#717182]">
                  {stat}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="bg-[#1e222d] border border-[#2a2e3a] h-full flex flex-col">
              <div className="p-3 border-b border-[#2a2e3a] flex items-center gap-2">
                <MessageSquare size={14} className="text-[#00f090]" />
                <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white">Insider Trading Feed</h3>
              </div>
              <div className="flex-1 p-3 space-y-4 overflow-y-auto max-h-[300px]">
                {feedItems.length > 0 ? (
                  feedItems.map((item, i) => (
                    <div key={item.id || `${item.symbol}-${i}`} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#00f090]">{item.user}</span>
                        <span className="text-[9px] text-[#717182]">{formatFeedTime(item)}</span>
                      </div>
                      <p className="text-[11px] text-ghost-white leading-relaxed bg-[#0a0b0d] p-2 border-l-2 border-[#00f090]">
                        {item.quote}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-[#717182] font-['Space_Mono'] uppercase">
                    No wiretap evidence for this market yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => onBet('long')}
            className="h-16 bg-[#00f090] text-[#0a0b0d] font-bold text-xl uppercase tracking-tighter hover:brightness-110 transition-all flex flex-col items-center justify-center"
          >
            LONG
            <span className="text-[10px] opacity-70">BET ON MARRIAGE</span>
          </button>
          <button
            onClick={() => onBet('short')}
            className="h-16 bg-[#ff2e51] text-white font-bold text-xl uppercase tracking-tighter hover:brightness-110 transition-all flex flex-col items-center justify-center"
          >
            SHORT
            <span className="text-[10px] opacity-70">BET ON BREAKUP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isCrunching, setIsCrunching] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [lastAnalyzedSymbol, setLastAnalyzedSymbol] = useState<string | null>(null);
  const [insiderTrading, setInsiderTrading] =
    useState<WiretapMarketUpdate[]>(INITIAL_INSIDER_TRADING);
  const [latestMarkets, setLatestMarkets] = useState<Record<string, { price: number; change: number }>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMarketUpdates = async (symbol: string) => {
    try {
      const updates = await RecordingService.getMarketUpdates(symbol);
      if (updates.length > 0) {
        setInsiderTrading((current) => mergeMarketUpdates(current, updates));
      }
    } catch (_error) {
      // Non-blocking; we still show local updates.
    }
  };

  useEffect(() => {
    if (!selectedAsset?.symbol) return;
    fetchMarketUpdates(selectedAsset.symbol);
  }, [selectedAsset?.symbol]);

  const handleUpload = () => {
    if (isUploadingEvidence) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    const targetSymbol = selectedAsset?.symbol || DEFAULT_WIRETAP_SYMBOL;

    setIsUploadingEvidence(true);
    setIsCrunching(true);
    toast.info(`Uploading wiretap evidence for ${targetSymbol}...`);

    try {
      const result = await RecordingService.analyzeRecording(file, targetSymbol);
      setLastAnalyzedSymbol(result.symbol);
      setLatestMarkets((current) => ({
        ...current,
        [result.symbol]: {
          price: result.market.price,
          change: result.market.change,
        },
      }));

      setInsiderTrading((current) =>
        mergeMarketUpdates(current, [
          {
            ...result.update,
            time: 'JUST NOW',
          },
        ]),
      );

      fetchMarketUpdates(result.symbol);

      toast.success(result.update.headline || `Wiretap analysis complete for ${result.symbol}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wiretap analysis failed';
      toast.error(message);
      setIsCrunching(false);
      setLastAnalyzedSymbol(null);
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const handleAnalysisComplete = () => {
    setIsCrunching(false);

    if (!lastAnalyzedSymbol) return;

    const hydratedAsset = hydrateAssetFromMarket(
      lastAnalyzedSymbol,
      latestMarkets[lastAnalyzedSymbol],
    );

    if (hydratedAsset) {
      setSelectedAsset(hydratedAsset);
    }

    setLastAnalyzedSymbol(null);
  };

  const handlePlaceBet = async (side: 'long' | 'short') => {
    if (!selectedAsset) return;

    const promise = fetch(`${API_BASE}/place-bet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        symbol: selectedAsset.symbol,
        side,
        amount: 100,
        userId: 'anonymous',
      }),
    });

    toast.promise(promise, {
      loading: 'Executing market order...',
      success: () => `Order filled: ${side.toUpperCase()} @ ${selectedAsset.price}`,
      error: 'Order failed: Insufficient liquidity',
    });
  };

  const renderContent = () => {
    if (selectedAsset) {
      return (
        <AssetDetailView
          asset={selectedAsset}
          insiderTrading={insiderTrading}
          onBack={() => setSelectedAsset(null)}
          onBet={handlePlaceBet}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onSelectAsset={setSelectedAsset}
            onUpload={handleUpload}
            isUploading={isUploadingEvidence}
          />
        );
      case 'market':
        return <MarketSection onSelectAsset={setSelectedAsset} searchQuery={searchQuery} />;
      case 'profile':
      case 'portfolio':
        return <ProfileSection />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0b0d]">
            <div className="w-20 h-20 bg-[#1e222d] border border-[#2a2e3a] flex items-center justify-center mb-4">
              <ShieldAlert className="text-[#ff2e51]" size={40} />
            </div>
            <h2 className="font-['Oswald'] text-xl font-bold text-ghost-white uppercase italic">Access Restricted</h2>
            <p className="font-['Space_Mono'] text-[10px] text-[#717182] mt-2 max-w-xs">
              Section requires higher clearance level. Upgrade your terminal license to access encrypted data pools.
            </p>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="mt-6 px-6 py-2 border border-[#00f090] text-[#00f090] text-[10px] font-bold uppercase hover:bg-[#00f090] hover:text-[#0a0b0d] transition-all"
            >
              Return to Terminal
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0b0d] text-ghost-white selection:bg-[#00f090] selection:text-[#0a0b0d] font-['Space_Mono']">
      <Toaster position="top-center" theme="dark" richColors />

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg"
        className="hidden"
        onChange={handleFileSelected}
      />

      <header className="border-b border-[#2a2e3a] bg-[#0a0b0d] z-30 shrink-0">
        <Ticker />
        <div className="px-4 py-3 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#1e222d] transition-colors md:hidden"
            >
              <Menu className="text-[#717182] hover:text-[#00f090]" size={20} />
            </button>
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => {
                setCurrentTab('dashboard');
                setSelectedAsset(null);
              }}
            >
              <span className="font-['Oswald'] font-black text-xl tracking-tighter leading-none italic">
                LOVE ARBITRAGE
              </span>
              <span className="font-['Space_Mono'] text-[9px] text-[#00f090] tracking-widest uppercase">Liquidating Romance</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#1e222d] border border-[#2a2e3a] px-3 py-1.5 focus-within:border-[#00f090] transition-colors">
              <Search size={14} className="text-[#717182]" />
              <input
                type="text"
                placeholder="SEARCH ASSETS..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'market') setCurrentTab('market');
                }}
                className="bg-transparent border-none outline-none font-['Space_Mono'] text-[10px] w-64 text-[#00f090] uppercase"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={12} className="text-[#717182] hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-right border-l border-[#2a2e3a] pl-4">
                <div className="text-[9px] text-[#717182] font-bold uppercase">Margin Balance</div>
                <div className="font-['Space_Mono'] text-xs font-bold text-[#00f090]">$14,204.67</div>
              </div>
              <div className="relative group">
                <Bell size={20} className="text-[#717182] group-hover:text-[#00f090] cursor-pointer" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff2e51] border border-[#0a0b0d]"></span>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <LogIn size={20} className="text-[#00f090]" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex shrink-0 z-20`}>
          <Sidebar
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              setSelectedAsset(null);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
          />
        </div>

        <main className="flex-1 flex flex-col relative overflow-hidden">{renderContent()}</main>
      </div>

      <AnalysisOverlay isOpen={isCrunching} onClose={handleAnalysisComplete} />

      <footer className="border-t border-[#2a2e3a] bg-[#0a0b0d] py-1 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#00f090] animate-pulse"></div>
            <span className="font-['Space_Mono'] text-[8px] text-[#00f090]">SYSTEM_OK</span>
          </div>
          <span className="font-['Space_Mono'] text-[8px] text-[#717182] hidden md:inline">ENCRYPTION: AES-256</span>
          <span className="font-['Space_Mono'] text-[8px] text-[#717182]">LATENCY: 14MS</span>
        </div>
        <div className="font-['Space_Mono'] text-[8px] text-[#717182] uppercase flex gap-4">
          <span className="hidden md:inline">S&P 500: -1.2%</span>
          <span>LOVE INDEX: BEARISH</span>
          <span className="hidden sm:inline">© 2026 LOVE ARBITRAGE</span>
        </div>
      </footer>

      {(currentTab === 'dashboard' || Boolean(selectedAsset)) && (
        <button
          onClick={handleUpload}
          disabled={isUploadingEvidence}
          className="fixed bottom-10 right-6 w-16 h-16 bg-[#00f090] hover:scale-110 transition-transform active:scale-95 flex flex-col items-center justify-center group shadow-[0_0_20px_rgba(0,240,144,0.3)] z-40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Mic size={24} className="text-[#0a0b0d]" />
          <span className="text-[8px] font-bold text-[#0a0b0d] mt-1">WIRETAP</span>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#0a0b0d]/20 animate-[scan_2s_infinite]"></div>
        </button>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
