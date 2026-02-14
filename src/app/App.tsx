import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '/src/utils/supabase/client';
import { Ticker } from './components/Ticker';
import { GlobalIndexChart } from './components/GlobalIndexChart';
import { MarketCard } from './components/MarketCard';
import { CandlestickChart } from './components/CandlestickChart';
import { AnalysisOverlay } from './components/AnalysisOverlay';
import { AssetDetailView } from './components/AssetDetailView';
import { Sidebar } from './components/Sidebar';
import { MarketSection } from './components/MarketSection';
import { ProfileSection } from './components/ProfileSection';
import { InsiderSection } from './components/InsiderSection';
import { LeaderboardSection } from './components/LeaderboardSection';
import { Auth } from './components/Auth';
import { FriendsSearch } from './components/FriendsSearch';
import { Onboarding } from './components/Onboarding';
import { PrivateEquitySection } from './components/PrivateEquitySection';
import { ALL_ASSETS, RECENT_BETS, PropBet } from './data/market-data';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { OrderEntryModal } from './components/OrderEntryModal';
import { 
  TrendingDown, 
  Mic, 
  Search, 
  Bell, 
  Menu, 
  ChevronRight, 
  MessageSquare, 
  AlertCircle,
  TrendingUp,
  Zap,
  ShieldAlert,
  LogIn,
  X,
  Database,
  Trophy,
  History,
  Users,
  UserPlus,
  LogOut
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { apiFetch } from './utils/api';
import { RecordingService } from '../../services/services/recording';

const DEFAULT_WIRETAP_SYMBOL = '$CHAD-BRITT';

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
  onPropTrade,
  isUploading,
}: { 
  onSelectAsset: (asset: any) => void, 
  onUpload: () => void,
  onPropTrade: (symbol: string, side: 'YES' | 'NO', betId: string) => void,
  isUploading: boolean,
}) => {
  const publicMarket = ALL_ASSETS.filter(a => a.category === 'Public').slice(0, 4);
  const privateEquity = ALL_ASSETS.filter(a => a.category === 'Private').slice(0, 2);
  const trendingProps = ALL_ASSETS.flatMap(a => (a.propBets || []).map(b => ({ ...b, symbol: a.symbol }))).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d]">
      <div className="p-4 space-y-4">
        <GlobalIndexChart />
        
        {/* Trending Prop Markets (Kalshi style) */}
        <section className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
            <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
              <History size={14} className="text-[#00f090]" />
              TRENDING_PROP_MARKETS
            </h2>
            <span className="font-['Space_Mono'] text-[9px] text-[#717182]">HOT_ACTION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trendingProps.map((prop, i) => (
              <div 
                key={i} 
                onClick={() => onSelectAsset(ALL_ASSETS.find(a => a.symbol === prop.symbol))}
                className="bg-[#1e222d] border border-[#2a2e3a] p-3 space-y-3 hover:border-[#00f090] transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-[#00f090] uppercase">{prop.symbol}</span>
                  <span className="text-[8px] text-[#717182] uppercase">{prop.expiry}</span>
                </div>
                <p className="font-['Space_Mono'] text-[11px] font-bold text-ghost-white group-hover:text-[#00f090] transition-colors italic leading-tight mb-2">
                  "{prop.question}"
                </p>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase mb-1 px-1">
                  <span className="text-[#00f090]">{prop.yesOdds}</span>
                  <span className="text-[#ff2e51]">{prop.noOdds}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPropTrade(prop.symbol, 'YES', prop.id);
                    }}
                    className="bg-transparent py-2 border border-[#00f090]/60 text-center hover:bg-[#00f090] hover:text-[#0a0b0d] transition-all cursor-pointer text-[10px] font-black text-[#00f090]"
                  >
                    YES
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPropTrade(prop.symbol, 'NO', prop.id);
                    }}
                    className="bg-transparent py-2 border border-[#ff2e51]/60 text-center hover:bg-[#ff2e51] hover:text-white transition-all cursor-pointer text-[10px] font-black text-[#ff2e51]"
                  >
                    NO
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                <MarketCard 
                  key={asset.symbol} 
                  {...asset} 
                  hasProps={!!asset.propBets?.length}
                  onClick={() => onSelectAsset(asset)} 
                />
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
                <MarketCard 
                  key={asset.symbol} 
                  {...asset} 
                  hasProps={!!asset.propBets?.length}
                  onClick={() => onSelectAsset(asset)} 
                />
              ))}
            </div>
            
            <div className="bg-[#1e222d] border border-dashed border-[#ff2e51]/40 p-4 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="text-[#ff2e51]" size={24} />
              <div>
                <p className="font-['Space_Mono'] text-[10px] text-ghost-white font-bold">UNREGISTERED DOMESTIC PARTNERSHIP DETECTED</p>
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

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isCrunching, setIsCrunching] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [lastAnalyzedSymbol, setLastAnalyzedSymbol] = useState<string | null>(null);
  const [latestMarkets, setLatestMarkets] = useState<Record<string, { price: number; change: number }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    asset?: any;
    betType: 'LONG' | 'SHORT' | 'YES' | 'NO';
    question?: string;
    odds?: string;
  }>({
    isOpen: false,
    betType: 'LONG'
  });

  // Check for session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.access_token);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await apiFetch('/profile', {}, token);
      const data = await response.json();
      if (!response.ok) {
        console.warn('Profile fetch rejected:', data);
        return;
      }
      setUserProfile(data);
    } catch (err) {
      console.error('Profile network error:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    toast.info('SESSION_TERMINATED: NODE_OFFLINE');
  };

  // Simulation effect for "Margin Calls" and "Intercepts"
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const types = ['margin', 'intercept', 'alert'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      if (type === 'margin') {
        toast.error("MARGIN CALL: Operator 'DIVORCE_REAPER' liquidated for $2.4M on $TAY-TRAV short.", {
          duration: 5000,
          icon: <ShieldAlert size={16} />
        });
      } else if (type === 'intercept') {
        toast.info("LIVE INTERCEPT: '$BEN-JEN' keyword 'moving_truck' detected in 90210 area.", {
          duration: 4000,
          icon: <Database size={16} />
        });
      } else {
        toast.warning("VIBE SHIFT: Global Love Index falling sharply. High volatility expected.", {
          duration: 4000,
          icon: <AlertCircle size={16} />
        });
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [session]);

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

    if (lastAnalyzedSymbol) {
      const hydratedAsset = hydrateAssetFromMarket(
        lastAnalyzedSymbol,
        latestMarkets[lastAnalyzedSymbol],
      );
      if (hydratedAsset) {
        setSelectedAsset(hydratedAsset);
      } else {
        setSelectedAsset(ALL_ASSETS.find((asset) => asset.symbol === lastAnalyzedSymbol));
      }
      setLastAnalyzedSymbol(null);
      return;
    }

    setSelectedAsset(ALL_ASSETS.find((a) => a.symbol === '$CHAD-BRITT'));
  };

  const handlePlaceBet = async (side: 'long' | 'short' | 'yes' | 'no', propBet?: PropBet) => {
    if (!selectedAsset) return;
    setModalState({
      isOpen: true,
      asset: selectedAsset,
      betType: side.toUpperCase() as any,
      question: propBet?.question,
      odds: propBet ? (side === 'yes' ? propBet.yesOdds : propBet.noOdds) : undefined
    });
  };

  const handleGlobalPropTrade = (symbol: string, side: 'YES' | 'NO', betId: string) => {
    const asset = ALL_ASSETS.find(a => a.symbol === symbol);
    const bet = asset?.propBets?.find(b => b.id === betId);
    if (asset && bet) {
      setModalState({
        isOpen: true,
        asset,
        betType: side,
        question: bet.question,
        odds: side === 'YES' ? bet.yesOdds : bet.noOdds
      });
    }
  };

  const confirmTrade = (amount: number) => {
    toast.success(`Position confirmed: ${modalState.betType} $${amount}`, {
      description: `Target: ${modalState.asset?.symbol} @ ${modalState.asset?.price}`,
      icon: <Zap size={14} className="text-[#00f090]" />
    });
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (!session) {
    return (
      <>
        <Toaster position="top-center" theme="dark" richColors />
        <Auth onAuth={setSession} />
      </>
    );
  }

  if (userProfile && !userProfile.onboarded) {
    return (
      <>
        <Toaster position="top-center" theme="dark" richColors />
        <Onboarding 
          accessToken={session.access_token} 
          projectId={projectId} 
          onComplete={(profile) => {
            setUserProfile(profile);
            toast.success('TERMINAL_INITIALIZED');
          }} 
        />
      </>
    );
  }

  const renderContent = () => {
    if (selectedAsset) {
      return (
        <AssetDetailView 
          asset={selectedAsset} 
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
            onPropTrade={handleGlobalPropTrade}
            isUploading={isUploadingEvidence}
          />
        );
      case 'market':
        return <MarketSection onSelectAsset={setSelectedAsset} searchQuery={searchQuery} />;
      case 'private':
        return (
          <PrivateEquitySection 
            accessToken={session.access_token} 
            projectId={projectId} 
            onSelectAsset={setSelectedAsset}
          />
        );
      case 'insider':
        return <InsiderSection />;
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'profile':
      case 'portfolio':
        return <ProfileSection profile={userProfile} accessToken={session.access_token} />;
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
      
      {/* Top Navigation */}
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
                placeholder="SEARCH TICKERS..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'market') setCurrentTab('market');
                }}
                className="bg-transparent border-none outline-none font-['Space_Mono'] text-[10px] w-64 text-[#00f090] uppercase"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                  <X size={12} className="text-[#717182] hover:text-white" />
                </button>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setIsFriendsModalOpen(true)}
                className="p-2 bg-[#1e222d] border border-[#2a2e3a] text-[#717182] hover:text-[#00f090] transition-colors"
              >
                <UserPlus size={18} />
              </button>
              <div className="text-right border-l border-[#2a2e3a] pl-4 flex flex-col items-end">
                <div className="text-[9px] text-[#717182] font-bold uppercase flex items-center gap-1">
                   <div className="w-1 h-1 bg-[#00f090] rounded-full animate-pulse" />
                   {userProfile?.name || 'NODE_PENDING'}
                </div>
                <div className="font-['Space_Mono'] text-xs font-bold text-[#00f090]">
                  ${userProfile?.balance?.toLocaleString() || '10,000.00'}
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-[#717182] hover:text-[#ff2e51] transition-colors">
                <LogOut size={20} />
              </button>
            </div>
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

        <main className="flex-1 flex flex-col relative overflow-hidden">
          {renderContent()}
        </main>
      </div>

      <AnalysisOverlay isOpen={isCrunching} onClose={handleAnalysisComplete} />

      {/* Friends Search Modal */}
      <AnimatePresence>
        {isFriendsModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0b0d] border border-[#2a2e3a] w-full max-w-md overflow-hidden"
            >
              <div className="border-b border-[#2a2e3a] p-4 flex justify-between items-center bg-[#1e222d]">
                <h2 className="font-['Oswald'] text-xs font-bold uppercase tracking-[0.2em] text-ghost-white flex items-center gap-2">
                  <Users size={14} className="text-[#00f090]" />
                  EXPAND_NETWORK
                </h2>
                <button onClick={() => setIsFriendsModalOpen(false)} className="text-[#717182] hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6">
                <FriendsSearch accessToken={session.access_token} onAdd={() => {}} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Order Modal */}
      {modalState.asset && (
        <OrderEntryModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          asset={modalState.asset}
          betType={modalState.betType}
          question={modalState.question}
          odds={modalState.odds}
          onConfirm={confirmTrade}
        />
      )}

      {/* Footer / Status Bar */}
      <footer className="border-t border-[#2a2e3a] bg-[#0a0b0d] py-1 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#00f090] animate-pulse"></div>
            <span className="font-['Space_Mono'] text-[8px] text-[#00f090]">SYSTEM_OK</span>
          </div>
          <span className="font-['Space_Mono'] text-[8px] text-[#717182] hidden md:inline">NODE_ID: {userProfile?.id?.slice(0, 8) || 'GUEST'}</span>
          <span className="font-['Space_Mono'] text-[8px] text-[#717182]">LATENCY: 14MS</span>
        </div>
        <div className="font-['Space_Mono'] text-[8px] text-[#717182] uppercase flex gap-4">
          <span>{userProfile?.name || 'USER'}_SESSION_ACTIVE</span>
          <span className="hidden sm:inline">© 2026 LOVE ARBITRAGE</span>
        </div>
      </footer>

      {/* Upload FAB */}
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
