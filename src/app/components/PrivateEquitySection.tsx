import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Users, 
  Mic, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle,
  FileText,
  ChevronRight,
  Plus,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Lock,
  Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import { MarketCard } from './MarketCard';
import { ALL_ASSETS } from '../data/market-data';
import { apiFetch } from '../utils/api';

interface PrivateEquitySectionProps {
  accessToken: string;
  projectId: string;
  onSelectAsset: (asset: any) => void;
}

export const PrivateEquitySection: React.FC<PrivateEquitySectionProps> = ({ 
  accessToken, 
  projectId,
  onSelectAsset
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [wiretapLogs, setWiretapLogs] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [privateAssets, setPrivateAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Check local storage for persistent unlock
    const savedUnlock = localStorage.getItem('pe_unlocked');
    if (savedUnlock === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchPrivateAssets();
    }
  }, [isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (licenseKey.toUpperCase() === 'ROMANCE-ALPHA-2026') {
      setIsUnlocked(true);
      localStorage.setItem('pe_unlocked', 'true');
      toast.success('PE_TERMINAL_UNLOCKED: HIGH_FIDELITY_ACCESS_ENABLED');
    } else {
      toast.error('INVALID_LICENSE: ACCESS_DENIED');
    }
  };

  const fetchPrivateAssets = async () => {
    try {
      const response = await apiFetch('/private-assets', {}, accessToken);
      const data = await response.json();
      const assetsList = Array.isArray(data) ? data : [];
      const demoPrivate = ALL_ASSETS.filter(a => a.category === 'Private');
      setPrivateAssets([...demoPrivate, ...assetsList]);
    } catch (err) {
      console.error('Failed to fetch private assets', err);
      const demoPrivate = ALL_ASSETS.filter(a => a.category === 'Private');
      setPrivateAssets(demoPrivate);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    // Set a timeout for dynamic search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await apiFetch(`/search-users?q=${query}`, {}, accessToken);
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults([]);
      }
    }, 300);
  };

  const handleAnalyze = async () => {
    if (!wiretapLogs || !selectedUser) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const response = await apiFetch('/analyze-relationship', {
        method: 'POST',
        body: JSON.stringify({
          logs: wiretapLogs,
          names: `You and ${selectedUser.name}`
        })
      }, accessToken);
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setAnalysisResult(data);
    } catch (err: any) {
      toast.error(`ANALYSIS_FAILED: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAsset = async () => {
    if (!analysisResult || !selectedUser) return;
    
    const symbol = `$${selectedUser.name.split(' ')[0].toUpperCase()}-ME`;
    const newAsset = {
      symbol,
      names: `You & ${selectedUser.name}`,
      price: analysisResult.price,
      change: '+0.00%',
      isUp: true,
      volatility: analysisResult.volatility,
      category: 'Private',
      image: selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`,
      propBets: [
        { 
          id: Date.now().toString(), 
          question: `Will ${selectedUser.name} text back within 5 minutes?`, 
          yesOdds: analysisResult.odds.yes, 
          noOdds: analysisResult.odds.no, 
          volume: '$0', 
          expiry: 'Today' 
        }
      ],
      aiSummary: analysisResult.summary
    };
    
    try {
      const response = await apiFetch('/save-private-asset', {
        method: 'POST',
        body: JSON.stringify(newAsset)
      }, accessToken);
      
      if (response.ok) {
        toast.success('MARKET_INITIALIZED: NODE_ADDED_TO_INDEX');
        setPrivateAssets([...privateAssets, newAsset]);
        setIsCreating(false);
        setAnalysisResult(null);
        setSelectedUser(null);
        setWiretapLogs('');
      }
    } catch (err) {
      toast.error('SAVE_FAILED: INDEX_WRITE_ERROR');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0b0d] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0a0b0d] border border-[#ff2e51]/50 p-8 space-y-6 relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock size={64} className="text-[#ff2e51]" />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-[#ff2e51]" size={24} />
            <h2 className="font-['Oswald'] text-xl font-bold uppercase tracking-widest text-ghost-white italic">Access Restricted</h2>
          </div>
          
          <p className="text-[10px] text-[#717182] uppercase leading-relaxed font-['Space_Mono']">
            THE PRIVATE EQUITY TERMINAL REQUIRES A <span className="text-[#ff2e51]">LEVEL 2 ENCRYPTION LICENSE</span>. 
            UNAUTHORIZED ACCESS TO PRIVATE INTERCEPTS IS STRICTLY PROHIBITED.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] text-[#717182] font-bold uppercase tracking-wider">Alpha License Key</label>
              <input 
                autoFocus
                required
                placeholder="XXXX-XXXX-XXXX"
                className="w-full bg-[#050505] border border-[#2a2e3a] p-3 text-[#ff2e51] focus:outline-none focus:border-[#ff2e51] transition-colors placeholder:text-[#1e222d] uppercase font-['Space_Mono']"
                value={licenseKey}
                onChange={e => setLicenseKey(e.target.value)}
              />
            </div>
            <button className="w-full py-3 bg-[#ff2e51] text-white font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
              AUTHENTICATE <ChevronRight size={18} />
            </button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-[8px] text-[#717182] uppercase tracking-[0.2em]">Hint: Check your terminal documentation for 'ROMANCE-ALPHA-2026'</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">
      <header className="border-b border-[#2a2e3a] p-4 flex justify-between items-center bg-[#1e222d]/30">
        <div>
          <h2 className="font-['Oswald'] text-xl font-bold uppercase italic tracking-tighter text-ghost-white">Private Equity</h2>
          <p className="text-[10px] text-[#717182] font-['Space_Mono'] uppercase tracking-widest">Personal Intercept Markets</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00ff41] text-[#050505] font-['Oswald'] font-black text-xs uppercase hover:brightness-110 transition-all"
        >
          <Plus size={16} /> NEW_INTERCEPT
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {isCreating ? (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2a2e3a] pb-2">
                  <Search size={16} className="text-[#00ff41]" />
                  <h3 className="text-[11px] font-black uppercase text-ghost-white">Step 1: Locate Target</h3>
                </div>
                
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="SEARCH_BY_HANDLE_OR_ID..."
                    className="w-full bg-[#050505] border border-[#2a2e3a] p-3 text-xs text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-colors uppercase placeholder:opacity-30"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#717182] font-bold">
                    QUERYING_DB...
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {searchResults.map((user) => (
                    <button 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-3 flex items-center justify-between border transition-all ${selectedUser?.id === user.id ? 'bg-[#00ff41]/10 border-[#00ff41]' : 'bg-[#1e222d] border-[#2a2e3a] hover:border-[#717182]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-8 h-8 bg-black border border-[#2a2e3a]" alt="" />
                        <div className="text-left">
                          <div className="text-[11px] font-bold text-white uppercase">{user.name}</div>
                          <div className="text-[9px] text-[#717182] uppercase">{user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                      {selectedUser?.id === user.id && <Zap size={14} className="text-[#00ff41]" />}
                    </button>
                  ))}
                  {searchQuery.length >= 1 && searchResults.length === 0 && (
                    <div className="p-4 text-center text-[10px] text-[#717182] border border-dashed border-[#2a2e3a]">
                      NO_TARGETS_FOUND_IN_SPECIFIED_RADIUS
                    </div>
                  )}
                </div>
              </div>

              {selectedUser && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 border-b border-[#2a2e3a] pb-2">
                    <Mic size={16} className="text-[#ff2e51]" />
                    <h3 className="text-[11px] font-black uppercase text-ghost-white">Step 2: Initialize Wiretap</h3>
                  </div>
                  <p className="text-[9px] text-[#717182] uppercase leading-relaxed">
                    PASTE RECENT CHAT LOGS, DISPUTES, OR CONVERSATIONS. CLAUDE ANALYTICS WILL CRUNCH THE SENTIMENT TO DETERMINE MARKET ODDS.
                  </p>
                  <textarea 
                    placeholder="PASTE_TRANSCRIBED_DATA_HERE..."
                    className="w-full h-48 bg-[#050505] border border-[#2a2e3a] p-4 text-xs text-[#00ff41] focus:outline-none focus:border-[#ff2e51] transition-colors resize-none font-['Space_Mono']"
                    value={wiretapLogs}
                    onChange={(e) => setWiretapLogs(e.target.value)}
                  />
                  <button 
                    disabled={!wiretapLogs || isAnalyzing}
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-[#ff2e51] text-white font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Activity size={18} className="animate-spin" /> : <Cpu size={18} />}
                    {isAnalyzing ? 'CRUNCHING_SENTIMENT...' : 'GENERATE_MARKET_PREDICTION'}
                  </button>
                </motion.div>
              )}
            </section>

            <section className="space-y-6">
              <div className="border border-[#2a2e3a] bg-[#1e222d]/50 h-full flex flex-col">
                <div className="border-b border-[#2a2e3a] p-4 flex justify-between items-center bg-[#1e222d]">
                  <h3 className="text-[11px] font-black uppercase text-ghost-white flex items-center gap-2">
                    <Activity size={14} className="text-[#00ff41]" />
                    AI_PREDICTION_MODELS
                  </h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#00ff41] animate-pulse" />
                    <div className="w-2 h-2 bg-[#00ff41]/50" />
                    <div className="w-2 h-2 bg-[#00ff41]/20" />
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
                  {!analysisResult && !isAnalyzing && (
                    <div className="space-y-4 opacity-30">
                      <ShieldAlert size={48} className="mx-auto" />
                      <p className="text-[10px] font-bold uppercase max-w-[200px]">Waiting for intercept data to initialize prediction models.</p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-4 w-full">
                      <div className="flex flex-col gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ width: '0%' }}
                            animate={{ width: ['0%', '100%', '80%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="h-1 bg-[#00ff41]/20"
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-[#00ff41] animate-pulse">EXTRACTING_EMOTIONAL_QUANTS...</p>
                    </div>
                  )}

                  {analysisResult && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full text-left space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#050505] p-3 border border-[#2a2e3a]">
                          <div className="text-[8px] text-[#717182] uppercase font-bold">Base Price</div>
                          <div className="text-xl font-black text-[#00ff41]">${analysisResult.price}</div>
                        </div>
                        <div className="bg-[#050505] p-3 border border-[#2a2e3a]">
                          <div className="text-[8px] text-[#717182] uppercase font-bold">Volatility</div>
                          <div className="text-xl font-black text-[#ff2e51]">{analysisResult.volatility}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <span className="text-[#717182]">Sentiment Index</span>
                          <span className="text-white">{(analysisResult.sentiment * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#050505] border border-[#2a2e3a] overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisResult.sentiment * 100}%` }}
                            className={`h-full ${analysisResult.sentiment > 0.5 ? 'bg-[#00ff41]' : 'bg-[#ff2e51]'}`}
                          />
                        </div>
                      </div>

                      <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 p-4">
                        <div className="flex items-center gap-2 mb-2 text-[#00ff41]">
                          <Zap size={14} />
                          <span className="text-[10px] font-black uppercase">Claude Insights</span>
                        </div>
                        <p className="text-[10px] text-ghost-white italic leading-relaxed">
                          "{analysisResult.summary}"
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase text-white">Projected Prop Odds</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#050505] border border-[#00ff41]/30 p-2 text-center">
                            <div className="text-[8px] text-[#717182] uppercase">YES (Breakup)</div>
                            <div className="text-sm font-black text-[#00ff41]">{analysisResult.odds.yes}</div>
                          </div>
                          <div className="bg-[#050505] border border-[#ff2e51]/30 p-2 text-center">
                            <div className="text-[8px] text-[#717182] uppercase">NO (Stay)</div>
                            <div className="text-sm font-black text-[#ff2e51]">{analysisResult.odds.no}</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <button 
                          onClick={() => setAnalysisResult(null)}
                          className="flex-1 py-3 border border-[#717182] text-[#717182] text-[10px] font-black uppercase hover:text-white hover:border-white transition-all"
                        >
                          RE_ANALYZE
                        </button>
                        <button 
                          onClick={handleSaveAsset}
                          className="flex-[2] py-3 bg-[#00ff41] text-[#050505] text-[10px] font-black uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                          INITIALIZE_MARKET <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[200px] bg-[#1e222d] animate-pulse border border-[#2a2e3a]" />
                ))
              ) : (
                <>
                  {privateAssets.map((asset) => (
                    <MarketCard 
                      key={asset.symbol} 
                      {...asset} 
                      hasProps={true} 
                      onClick={() => onSelectAsset(asset)} 
                    />
                  ))}
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="h-[200px] border-2 border-dashed border-[#2a2e3a] hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-[#1e222d] border border-[#2a2e3a] flex items-center justify-center group-hover:border-[#00ff41] group-hover:bg-[#00ff41]/10">
                      <Plus className="text-[#717182] group-hover:text-[#00ff41]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#717182] uppercase tracking-widest group-hover:text-white">Initialize New Intercept</span>
                  </button>
                </>
              )}
            </div>

            {privateAssets.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-[#1e222d] border border-[#2a2e3a] flex items-center justify-center">
                  <Mic size={40} className="text-[#717182]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic">Zero Intercepts Detected</h3>
                  <p className="text-[11px] text-[#717182] max-w-xs mx-auto mt-2">
                    Submit chat logs or conversation transcripts between you and a target to begin relationship liquidation.
                  </p>
                </div>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-[#00ff41] text-[#050505] font-['Oswald'] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  START_WIRETAP
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isCreating && (
        <button 
          onClick={() => {
            setIsCreating(false);
            setAnalysisResult(null);
            setSelectedUser(null);
            setWiretapLogs('');
          }}
          className="absolute top-4 right-4 p-2 text-[#717182] hover:text-white transition-colors"
        >
          CANCEL_X
        </button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2e3a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00ff41;
        }
      `}</style>
    </div>
  );
};
