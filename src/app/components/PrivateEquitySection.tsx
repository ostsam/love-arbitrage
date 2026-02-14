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
  Terminal,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { MarketCard } from './MarketCard';
import { apiFetch } from '../utils/api';

interface PrivateEquitySectionProps {
  assets: any[];
  accessToken: string;
  projectId: string;
  onSelectAsset: (asset: any) => void;
  onRefreshMarkets: () => void;
}

export const PrivateEquitySection: React.FC<PrivateEquitySectionProps> = ({ 
  assets,
  accessToken, 
  projectId,
  onSelectAsset,
  onRefreshMarkets
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [wiretapLogs, setWiretapLogs] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const savedUnlock = localStorage.getItem('pe_unlocked');
    if (savedUnlock === 'true') {
      setIsUnlocked(true);
    }
  }, []);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await apiFetch(`/search-users?q=${query}`, {}, accessToken);
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setSearchResults([]);
      }
    }, 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      toast.info("TRANSCRIBING_AUDIO: BRIDGING_ENCRYPTED_SIGNAL");
      setTimeout(() => {
        const mockTranscripts = [
          "Operator A: I saw the moving truck. Operator B: It's for my sister's place, I swear.",
          "Target 1: Why did you delete the messages? Target 2: They were taking up storage. I'm loyal.",
          "Node X: We need to talk about the lease. Node Y: I'm already looking at studios in Brooklyn.",
          "Source: The engagement ring is back in the box. Anonymous: Liquidate the YES positions immediately."
        ];
        const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
        setWiretapLogs(prev => prev ? prev + "\n" + randomTranscript : randomTranscript);
        setIsUploading(false);
        toast.success("TRANSCRIPTION_COMPLETE: DATA_INJECTED_TO_BUFFER");
      }, 2500);
    }
  };

  const handleAnalyze = async () => {
    if (!wiretapLogs || !selectedUser) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await apiFetch('/analyze-relationship', {
        method: 'POST',
        body: JSON.stringify({ logs: wiretapLogs, names: `You and ${selectedUser.name}` })
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
      propBets: analysisResult.propBets.map((pb: any) => ({ ...pb, volume: '$0', expiry: '30D' })),
      aiSummary: analysisResult.summary
    };
    try {
      const response = await apiFetch('/save-private-asset', {
        method: 'POST',
        body: JSON.stringify(newAsset)
      }, accessToken);
      if (response.ok) {
        toast.success('MARKET_INITIALIZED: GLOBAL_NODE_SYNCHRONIZED');
        onRefreshMarkets();
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
                autoFocus required placeholder="XXXX-XXXX-XXXX"
                className="w-full bg-[#050505] border border-[#2a2e3a] p-3 text-[#ff2e51] focus:outline-none focus:border-[#ff2e51] transition-colors placeholder:text-[#1e222d] uppercase font-['Space_Mono']"
                value={licenseKey} onChange={e => setLicenseKey(e.target.value)}
              />
            </div>
            <button className="w-full py-3 bg-[#ff2e51] text-white font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
              AUTHENTICATE <ChevronRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const privateAssets = assets.filter(a => a.category === 'Private');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">
      <header className="border-b border-[#2a2e3a] p-4 flex justify-between items-center bg-[#1e222d]/30">
        <div>
          <h2 className="font-['Oswald'] text-xl font-bold uppercase italic tracking-tighter text-ghost-white">Private Equity</h2>
          <p className="text-[10px] text-[#717182] font-['Space_Mono'] uppercase tracking-widest">Global Intercept Registry</p>
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
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            <section className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2a2e3a] pb-2">
                  <Search size={16} className="text-[#00ff41]" />
                  <h3 className="text-[11px] font-black uppercase text-ghost-white">Step 1: Locate Target</h3>
                </div>
                <div className="relative">
                  <input 
                    type="text" placeholder="SEARCH_BY_HANDLE_OR_ID..."
                    className="w-full bg-[#050505] border border-[#2a2e3a] p-3 text-xs text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-colors uppercase placeholder:opacity-30"
                    value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {searchResults.map((user) => (
                    <button 
                      key={user.id} onClick={() => setSelectedUser(user)}
                      className={`w-full p-3 flex items-center justify-between border transition-all ${selectedUser?.id === user.id ? 'bg-[#00ff41]/10 border-[#00ff41]' : 'bg-[#1e222d] border-[#2a2e3a] hover:border-[#717182]'}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <img src={user.avatar} className="w-8 h-8 border border-[#2a2e3a]" alt="" />
                        <div>
                          <div className="text-[11px] font-bold text-white uppercase">{user.name}</div>
                          <div className="text-[9px] text-[#717182] uppercase">{user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedUser && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#2a2e3a] pb-2">
                    <Mic size={16} className="text-[#ff2e51]" />
                    <h3 className="text-[11px] font-black uppercase text-ghost-white">Step 2: Initialize Wiretap</h3>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1e222d] border border-[#2a2e3a] text-[10px] font-black text-white hover:text-[#00ff41] hover:border-[#00ff41]/30 cursor-pointer transition-all uppercase">
                      {isUploading ? <Loader2 size={14} className="animate-spin text-[#00ff41]" /> : <Mic size={14} />}
                      {isUploading ? 'TRANSCRIBING...' : 'UPLOAD_AUDIO_INTERCEPT'}
                      <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <textarea 
                    placeholder="PASTE_TRANSCRIBED_DATA_HERE..."
                    className="w-full h-48 bg-[#050505] border border-[#2a2e3a] p-4 text-xs text-[#00ff41] focus:outline-none focus:border-[#ff2e51] transition-colors resize-none font-['Space_Mono']"
                    value={wiretapLogs} onChange={(e) => setWiretapLogs(e.target.value)}
                  />
                  <button 
                    disabled={!wiretapLogs || isAnalyzing} onClick={handleAnalyze}
                    className="w-full py-4 bg-[#ff2e51] text-white font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Activity size={18} className="animate-spin" /> : <Cpu size={18} />}
                    {isAnalyzing ? 'CRUNCHING_SENTIMENT...' : 'GENERATE_MARKET_PREDICTION'}
                  </button>
                </motion.div>
              )}
            </section>

            <section className="space-y-6">
              <div className="border border-[#2a2e3a] bg-[#1e222d]/50 h-full flex flex-col">
                <div className="border-b border-[#2a2e3a] p-4 bg-[#1e222d]">
                  <h3 className="text-[11px] font-black uppercase text-ghost-white">AI_PREDICTION_MODELS</h3>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
                  {!analysisResult && !isAnalyzing && (
                    <div className="space-y-4 opacity-30">
                      <ShieldAlert size={48} className="mx-auto" />
                      <p className="text-[10px] font-bold uppercase max-w-[200px]">Waiting for intercept data...</p>
                    </div>
                  )}
                  {analysisResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#050505] p-3 border border-[#2a2e3a]">
                          <div className="text-[8px] text-[#717182] uppercase">Price</div>
                          <div className="text-xl font-black text-[#00ff41]">${analysisResult.price}</div>
                        </div>
                        <div className="bg-[#050505] p-3 border border-[#2a2e3a]">
                          <div className="text-[8px] text-[#717182] uppercase">Volatility</div>
                          <div className="text-xl font-black text-[#ff2e51]">{analysisResult.volatility}</div>
                        </div>
                      </div>
                      <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 p-4 italic text-[10px] text-ghost-white">
                        "{analysisResult.summary}"
                      </div>
                      <div className="space-y-2">
                        {analysisResult.propBets.slice(0, 5).map((pb: any, i: number) => (
                          <div key={i} className="flex justify-between text-[9px] border-b border-[#2a2e3a] pb-1">
                            <span className="text-[#717182] truncate pr-2 italic">"{pb.question}"</span>
                            <span className="text-[#00ff41] font-bold shrink-0">{pb.yesOdds}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 flex gap-2">
                        <button onClick={() => setAnalysisResult(null)} className="flex-1 py-3 border border-[#717182] text-[#717182] text-[10px] font-black uppercase">RE_ANALYZE</button>
                        <button onClick={handleSaveAsset} className="flex-[2] bg-[#00ff41] text-[#050505] text-[10px] font-black uppercase">INITIALIZE_MARKET</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {privateAssets.map((asset, index) => (
              <MarketCard key={`${asset.symbol}-${index}`} {...asset} hasProps={true} onClick={() => onSelectAsset(asset)} />
            ))}
            <button onClick={() => setIsCreating(true)} className="h-[200px] border-2 border-dashed border-[#2a2e3a] hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 transition-all flex flex-col items-center justify-center gap-4 group">
              <Plus className="text-[#717182] group-hover:text-[#00ff41]" />
              <span className="text-[10px] font-bold text-[#717182] uppercase">Initialize New Intercept</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2e3a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00ff41; }
      `}</style>
    </div>
  );
};
