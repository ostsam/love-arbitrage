import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Wallet, 
  History, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users,
  CreditCard,
  Database,
  X,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Lock,
  Wifi,
  Loader2,
  CheckCircle2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';

interface ProfileSectionProps {
  profile: any;
  accessToken: string;
  onDeposit: (amount: number) => Promise<void>;
  onSell?: (betId: string) => Promise<void>;
  viewMode?: 'profile' | 'portfolio';
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  profile, 
  accessToken, 
  onDeposit, 
  onSell,
  viewMode = 'profile' 
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState<'amount' | 'card' | 'processing' | 'success'>('amount');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [isLiquidating, setIsLiquidating] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await apiFetch('/friends', {}, accessToken);
        const data = await response.json();
        if (Array.isArray(data)) setFriends(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (accessToken && viewMode === 'profile') fetchFriends();
  }, [accessToken, viewMode]);

  const handleStartDeposit = () => {
    setDepositStep('amount');
    setIsDepositModalOpen(true);
  };

  const handleAmountNext = () => setDepositStep('card');

  const handleProcessPayment = async () => {
    setDepositStep('processing');
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      await onDeposit(Number(depositAmount));
      setDepositStep('success');
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setDepositStep('amount');
      }, 2500);
    } catch (err) {
      toast.error("GATEWAY_REJECTED: Source funds verification failed.");
      setDepositStep('card');
    }
  };

  const handleSell = async (betId: string) => {
    if (!onSell) return;
    setIsLiquidating(betId);
    try {
      await onSell(betId);
    } finally {
      setIsLiquidating(null);
    }
  };

  const handleSeedUsers = async () => {
    try {
      const response = await apiFetch('/seed-test-users', { method: 'POST' }, accessToken);
      if (response.ok) {
        toast.success("NETWORK_NODES_INJECTED", {
          description: "10 high-volatility targets added to terminal registry.",
          icon: <Users size={14} />
        });
      }
    } catch (err) {
      toast.error("SEED_FAILED");
    }
  };

  const displayName = profile?.name || 'OPERATOR_UNKNOWN';
  const balance = profile?.balance?.toLocaleString() || '0.00';
  const joinDate = profile?.joined ? new Date(profile.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Feb 2026';
  const portfolio = profile?.portfolio || [];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile/Portfolio Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-[#2a2e3a] pb-8">
          <div className="w-32 h-32 border-2 border-[#00f090] bg-[#1e222d] flex items-center justify-center relative group overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="text-[#00f090]" />
            )}
            <div className="absolute inset-0 bg-[#00f090]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="font-['Oswald'] text-3xl font-black uppercase tracking-tighter text-ghost-white italic">
                {viewMode === 'profile' ? displayName : 'OPERATOR_PORTFOLIO'}
              </h1>
              <span className="bg-[#00f090] text-[#0a0b0d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                {viewMode === 'profile' ? 'Active_Node' : 'Index_Active'}
              </span>
            </div>
            {viewMode === 'profile' ? (
              <p className="font-['Space_Mono'] text-sm text-[#717182]">NODE_ID: {profile?.id?.slice(0, 12) || '---'} | Joined: {joinDate}</p>
            ) : (
              <p className="font-['Space_Mono'] text-sm text-[#717182]">TRACKING: {portfolio.length} ACTIVE_CONTRACTS | LIQUIDITY: ${balance}</p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                <span className="text-[10px] text-[#717182] uppercase block mb-1">Terminal Liquidity</span>
                <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">${balance}</span>
              </div>
              {viewMode === 'profile' ? (
                <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                  <span className="text-[10px] text-[#717182] uppercase block mb-1">Network Strength</span>
                  <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">{friends.length} CONNS</span>
                </div>
              ) : (
                <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                  <span className="text-[10px] text-[#717182] uppercase block mb-1">Market Exposure</span>
                  <span className="font-['Space_Mono'] text-lg font-bold text-[#ff2e51]">${portfolio.reduce((acc: number, b: any) => acc + Number(b.amount), 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Positions - Always shown in both but styled differently */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
                <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                  <Activity size={14} className="text-[#00f090]" /> 
                  {viewMode === 'portfolio' ? 'ACTIVE_MARKET_POSITIONS' : 'RECENT_ACTIVITY'}
                </h2>
                <span className="text-[9px] text-[#717182] font-bold uppercase">{portfolio.length} CONTRACTS</span>
              </div>
              
              <div className="space-y-3">
                {portfolio.length > 0 ? (
                  portfolio.map((bet: any, i: number) => (
                    <div key={i} className="bg-[#1e222d] border border-[#2a2e3a] p-4 flex flex-col sm:flex-row justify-between sm:items-center group hover:border-[#00f090] transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0a0b0d] flex items-center justify-center border border-[#2a2e3a] group-hover:border-[#00f090]/30">
                          <span className="font-['Space_Mono'] text-[10px] font-black text-[#00f090]">{bet.symbol.split('-')[0].replace('$', '')}</span>
                        </div>
                        <div>
                          <div className="font-['Space_Mono'] font-bold text-sm text-ghost-white flex items-center gap-2">
                            {bet.symbol}
                            {bet.pnlUp ? <ArrowUpRight size={14} className="text-[#00f090]" /> : <ArrowDownLeft size={14} className="text-[#ff2e51]" />}
                          </div>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1 ${bet.side === 'LONG' || bet.side === 'YES' ? 'bg-[#00f090] text-[#0a0b0d]' : 'bg-[#ff2e51] text-white'}`}>
                                {bet.side}
                              </span>
                              <span className="text-[9px] text-[#717182] uppercase font-['Space_Mono']">${bet.amount} COLLATERAL</span>
                            </div>
                            {bet.question && (
                              <p className="text-[8px] text-[#717182] italic leading-none mt-1">"{bet.question}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className={`font-['Space_Mono'] text-sm font-bold ${bet.pnlUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
                            {bet.pnl || '$0.00'}
                          </div>
                          <div className="text-[9px] text-[#717182] uppercase mt-1 tracking-tighter">UNREALIZED P&L</div>
                        </div>
                        <button 
                          onClick={() => handleSell(bet.id)}
                          disabled={isLiquidating === bet.id}
                          className="p-3 bg-[#0a0b0d] border border-[#2a2e3a] text-[#717182] hover:text-[#ff2e51] hover:border-[#ff2e51]/30 transition-all flex items-center gap-2 group/btn"
                        >
                          {isLiquidating === bet.id ? <Loader2 size={16} className="animate-spin" /> : <TrendingDown size={16} className="group-hover/btn:scale-110 transition-transform" />}
                          <span className="text-[10px] font-black uppercase hidden sm:inline">Liquidate</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1e222d] border border-dashed border-[#2a2e3a] p-12 text-center space-y-4">
                    <Database size={32} className="mx-auto text-[#2a2e3a]" />
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#717182] uppercase font-bold tracking-widest italic">Terminal registry is empty</p>
                      <p className="text-[8px] text-[#2a2e3a] uppercase">No active relationship liquidations found on this node.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {viewMode === 'profile' && (
              <section className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
                  <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                    <Users size={14} className="text-[#00f090]" /> TRUSTED_NETWORK
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <div key={friend.id} className="bg-[#1e222d] border border-[#2a2e3a] p-3 flex items-center gap-3 hover:border-[#00f090] transition-colors group">
                        <img src={friend.avatar} alt={friend.name} className="w-10 h-10 border border-[#2a2e3a]" />
                        <div className="overflow-hidden flex-1">
                          <p className="text-[11px] font-black text-ghost-white uppercase truncate">{friend.name}</p>
                          <p className="text-[9px] text-[#717182] lowercase truncate">{friend.email}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#2a2e3a] group-hover:text-[#00f090]" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-[#1e222d] border border-dashed border-[#2a2e3a] p-8 text-center">
                      <p className="text-[10px] text-[#717182] uppercase font-bold tracking-widest">Isolated Node: Add friends to expand network</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <CreditCard size={80} />
              </div>
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2 relative z-10">
                <Wallet size={14} className="text-[#717182]" /> TERMINAL_WALLET
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#717182] uppercase">Liquidity Available</span>
                  <span className="text-ghost-white font-['Space_Mono'] font-bold text-sm">${balance}</span>
                </div>
                <div className="w-full h-1 bg-[#0a0b0d]">
                  <div className="h-full bg-[#00f090]" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] pt-1">
                  <span className="text-[#717182] uppercase tracking-tighter">System_Clearing_Speed</span>
                  <span className="text-[#00f090]">INSTANT</span>
                </div>
              </div>
              <button 
                onClick={handleStartDeposit}
                className="w-full mt-6 py-3 bg-[#00f090] text-[#0a0b0d] font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all relative z-10"
              >
                INJECT_CAPITAL
              </button>
            </section>

            {viewMode === 'profile' && (
              <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
                <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                  <Cpu size={14} className="text-[#717182]" /> SYSTEM_UTILITIES
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleSeedUsers}
                    className="w-full py-2 border border-[#2a2e3a] text-[#717182] font-bold text-[9px] uppercase tracking-widest hover:text-[#00f090] hover:border-[#00f090]/30 transition-all text-center"
                  >
                    SEED_NETWORK_NODES
                  </button>
                  <p className="text-[8px] text-[#2a2e3a] uppercase font-['Space_Mono'] text-center">Clearance Level: Alpha-2026</p>
                </div>
              </section>
            )}

            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                <Clock size={14} className="text-[#717182]" /> AUDIT_LOG
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-[10px]">
                  <div className="w-1 h-auto bg-[#00f090]"></div>
                  <div className="space-y-0.5">
                    <p className="text-[#717182] uppercase font-bold text-[8px]">TIMESTAMP: {new Date().toLocaleTimeString()}</p>
                    <p className="text-ghost-white uppercase font-bold tracking-tighter leading-tight">Terminal Registry Refresh</p>
                    <p className="text-[#00f090] font-['Space_Mono'] text-[9px]">STATUS: NODE_ONLINE</p>
                  </div>
                </div>
                {portfolio.slice(0, 3).map((bet: any, i: number) => (
                  <div key={i} className="flex gap-3 text-[10px]">
                    <div className={`w-1 h-auto ${bet.side === 'LONG' || bet.side === 'YES' ? 'bg-[#00f090]' : 'bg-[#ff2e51]'}`}></div>
                    <div className="space-y-0.5">
                      <p className="text-[#717182] uppercase font-bold text-[8px]">TRADE_ID: {bet.id?.slice(0, 10)}</p>
                      <p className="text-ghost-white uppercase font-bold tracking-tighter leading-tight">Order: {bet.symbol}</p>
                      <p className={`${bet.side === 'LONG' || bet.side === 'YES' ? 'text-[#00f090]' : 'text-[#ff2e51]'} font-['Space_Mono'] text-[9px]`}>WAGER: ${bet.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0b0d] border border-[#00f090]/30 w-full max-w-[420px] overflow-hidden shadow-[0_0_80px_rgba(0,240,144,0.15)]"
            >
              <div className="border-b border-[#2a2e3a] p-4 flex justify-between items-center bg-[#1e222d]">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#00f090]/10 border border-[#00f090]/30 rounded-sm">
                    <Lock size={12} className="text-[#00f090]" />
                  </div>
                  <div>
                    <h2 className="font-['Oswald'] text-[11px] font-bold uppercase tracking-[0.2em] text-ghost-white leading-none">
                      GATEWAY_BRIDGE_SECURE
                    </h2>
                    <p className="text-[8px] text-[#00f090] font-['Space_Mono'] mt-1 flex items-center gap-1">
                      <Wifi size={8} className="animate-pulse" /> ENCRYPTED_TUNNEL_ESTABLISHED
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDepositModalOpen(false)} className="text-[#717182] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8">
                {depositStep === 'amount' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="font-['Oswald'] text-lg font-bold uppercase text-ghost-white italic tracking-tighter">Select_Infusion_Scale</h3>
                      <p className="text-[10px] text-[#717182] uppercase leading-relaxed font-['Space_Mono']">Define the magnitude of liquidity to be bridged from external banking node.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['1000', '5000', '25000', '100000'].map((amt) => (
                        <button 
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className={`relative group overflow-hidden py-4 border font-['Space_Mono'] font-bold text-sm transition-all flex flex-col items-center justify-center ${depositAmount === amt ? 'bg-[#00f090] border-[#00f090] text-[#0a0b0d]' : 'bg-[#1e222d] border-[#2a2e3a] text-[#717182] hover:border-[#00f090]'}`}
                        >
                          <span className="relative z-10">${Number(amt).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-[#717182] uppercase font-bold font-['Space_Mono'] tracking-widest">Manual_Entry_Field</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00f090] font-['Space_Mono'] text-lg font-bold">$</span>
                        <input 
                          type="number"
                          className="w-full bg-[#050505] border border-[#2a2e3a] p-4 pl-10 text-xl text-[#00f090] focus:outline-none focus:border-[#00f090] font-['Space_Mono']"
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleAmountNext}
                      className="w-full py-5 bg-[#00f090] text-[#0a0b0d] font-['Oswald'] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:brightness-110 shadow-[0_4px_30px_rgba(0,240,144,0.3)]"
                    >
                      PROCEED_TO_AUTH
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {depositStep === 'card' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="font-['Oswald'] text-lg font-bold uppercase text-ghost-white italic tracking-tighter">Banking_Credentials</h3>
                      <p className="text-[10px] text-[#717182] uppercase leading-relaxed font-['Space_Mono']">Input external credit node details for transaction authorization.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[#1e222d] to-[#0a0b0d] border border-[#2a2e3a] p-6 rounded-lg space-y-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Cpu size={40} className="text-[#00f090]" />
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-8 bg-[#00f090]/20 border border-[#00f090]/40 rounded-sm"></div>
                          <Wifi className="text-[#717182] rotate-90" size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-[#717182] uppercase font-['Space_Mono']">Card_Registry_Number</p>
                          <p className="text-lg font-['Space_Mono'] tracking-[0.2em] text-ghost-white">
                            {cardDetails.number.padEnd(16, '•').match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••'}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[8px] text-[#717182] uppercase font-['Space_Mono']">Operator_Name</p>
                            <p className="text-[10px] text-ghost-white uppercase tracking-widest">{cardDetails.name || 'ANONYMOUS_HOLDER'}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[8px] text-[#717182] uppercase font-['Space_Mono']">EXP</p>
                            <p className="text-[10px] text-ghost-white font-['Space_Mono']">{cardDetails.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input 
                          type="text"
                          placeholder="CARD_NUMBER"
                          className="w-full bg-[#1e222d] border border-[#2a2e3a] p-3 text-[11px] text-ghost-white font-['Space_Mono'] focus:border-[#00f090] outline-none"
                          maxLength={16}
                          onChange={e => setCardDetails(p => ({ ...p, number: e.target.value }))}
                        />
                        <input 
                          type="text"
                          placeholder="OPERATOR_LEGAL_NAME"
                          className="w-full bg-[#1e222d] border border-[#2a2e3a] p-3 text-[11px] text-ghost-white font-['Space_Mono'] focus:border-[#00f090] outline-none"
                          onChange={e => setCardDetails(p => ({ ...p, name: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text"
                            placeholder="EXP (MM/YY)"
                            className="w-full bg-[#1e222d] border border-[#2a2e3a] p-3 text-[11px] text-ghost-white font-['Space_Mono'] focus:border-[#00f090] outline-none"
                            maxLength={5}
                            onChange={e => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                          />
                          <input 
                            type="password"
                            placeholder="CVC"
                            className="w-full bg-[#1e222d] border border-[#2a2e3a] p-3 text-[11px] text-ghost-white font-['Space_Mono'] focus:border-[#00f090] outline-none"
                            maxLength={4}
                            onChange={e => setCardDetails(p => ({ ...p, cvc: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setDepositStep('amount')}
                        className="py-4 border border-[#2a2e3a] text-[#717182] font-['Oswald'] text-xs uppercase tracking-widest hover:text-white"
                      >
                        BACK_TO_SCALE
                      </button>
                      <button 
                        onClick={handleProcessPayment}
                        className="py-4 bg-[#00f090] text-[#0a0b0d] font-['Oswald'] font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(0,240,144,0.2)]"
                      >
                        AUTHORIZE_${Number(depositAmount).toLocaleString()}
                      </button>
                    </div>
                  </div>
                )}

                {depositStep === 'processing' && (
                  <div className="py-20 flex flex-col items-center justify-center space-y-8">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-2 border-[#00f090]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-[#00f090] border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="text-[#00f090] animate-pulse" size={32} />
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <h3 className="font-['Oswald'] text-xl font-bold uppercase text-ghost-white animate-pulse">BRIDGING_CAPITAL...</h3>
                      <div className="space-y-1 font-['Space_Mono'] text-[8px] text-[#717182] uppercase tracking-[0.2em]">
                        <p className="flex items-center gap-2 justify-center"><Wifi size={8} className="text-[#00f090]" /> Connecting to banking node...</p>
                        <p className="flex items-center gap-2 justify-center"><ShieldCheck size={8} className="text-[#00f090]" /> Verifying clearance...</p>
                      </div>
                    </div>
                  </div>
                )}

                {depositStep === 'success' && (
                  <div className="py-20 flex flex-col items-center justify-center space-y-8">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 bg-[#00f090] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,240,144,0.4)]"
                    >
                      <CheckCircle2 size={48} className="text-[#0a0b0d]" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <h3 className="font-['Oswald'] text-2xl font-black uppercase text-[#00f090] italic">TRANSFER_COMPLETE</h3>
                      <p className="font-['Space_Mono'] text-[10px] text-ghost-white uppercase tracking-widest font-bold">
                        ${Number(depositAmount).toLocaleString()} Credited
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
