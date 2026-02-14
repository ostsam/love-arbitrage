import React, { useState, useEffect } from 'react';
import { RECENT_BETS } from '../data/market-data';
import { User, Wallet, History, Shield, Zap, TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface ProfileSectionProps {
  profile: any;
  accessToken: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, accessToken }) => {
  const [friends, setFriends] = useState<any[]>([]);

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
    if (accessToken) fetchFriends();
  }, [accessToken]);

  const displayName = profile?.name || 'OPERATOR_UNKNOWN';
  const displayEmail = profile?.email || 'OFFLINE_NODE';
  const balance = profile?.balance?.toLocaleString() || '10,000.00';
  const joinDate = profile?.joined ? new Date(profile.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Feb 2026';

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
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
                {displayName}
              </h1>
              <span className="bg-[#00f090] text-[#0a0b0d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">Active_Node</span>
            </div>
            <p className="font-['Space_Mono'] text-sm text-[#717182]">NODE_ID: {profile?.id?.slice(0, 12) || '---'} | Joined: {joinDate}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                <span className="text-[10px] text-[#717182] uppercase block mb-1">Portfolio Value</span>
                <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">${balance}</span>
              </div>
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                <span className="text-[10px] text-[#717182] uppercase block mb-1">Network Strength</span>
                <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">{friends.length} CONNS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Positions */}
          <div className="lg:col-span-2 space-y-6">
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
                <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                  <Shield size={14} className="text-[#00f090]" /> ACTIVE_POSITIONS
                </h2>
              </div>
              <div className="space-y-2">
                {RECENT_BETS.filter(b => b.status === 'OPEN').length > 0 ? (
                  RECENT_BETS.filter(b => b.status === 'OPEN').map((bet, i) => (
                    <div key={i} className="bg-[#1e222d] border border-[#2a2e3a] p-4 flex justify-between items-center group hover:border-[#00f090] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0a0b0d] flex items-center justify-center border border-[#2a2e3a]">
                          <span className="font-['Space_Mono'] text-[10px] font-bold text-[#00f090]">{bet.symbol.split('-')[0]}</span>
                        </div>
                        <div>
                          <div className="font-['Space_Mono'] font-bold text-sm text-ghost-white">{bet.symbol}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold px-1 ${bet.side === 'LONG' ? 'bg-[#00f090] text-[#0a0b0d]' : 'bg-[#ff2e51] text-white'}`}>
                              {bet.side}
                            </span>
                            <span className="text-[9px] text-[#717182] uppercase">{bet.amount} COLLATERAL</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-['Space_Mono'] text-sm font-bold ${bet.pnlUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
                          {bet.pnl}
                        </div>
                        <div className="text-[9px] text-[#717182] uppercase mt-1">UNREALIZED P&L</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1e222d] border border-dashed border-[#2a2e3a] p-8 text-center">
                    <p className="text-[10px] text-[#717182] uppercase font-bold tracking-widest">No Active Positions Detected</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
                <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                  <Users size={14} className="text-[#00f090]" /> TRUSTED_NETWORK
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="bg-[#1e222d] border border-[#2a2e3a] p-3 flex items-center gap-3">
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 border border-[#2a2e3a]" />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-black text-ghost-white uppercase truncate">{friend.name}</p>
                        <p className="text-[9px] text-[#717182] lowercase truncate">{friend.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-[#1e222d] border border-dashed border-[#2a2e3a] p-8 text-center">
                    <p className="text-[10px] text-[#717182] uppercase font-bold tracking-widest">Isolated Node: Add friends to expand network</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                <Wallet size={14} className="text-[#717182]" /> WALLET_OVERVIEW
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#717182] uppercase">Margin Utilized</span>
                  <span className="font-['Space_Mono'] text-xs text-ghost-white">0.0%</span>
                </div>
                <div className="w-full h-1 bg-[#0a0b0d]">
                  <div className="h-full bg-[#00f090]" style={{ width: '0%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#717182] uppercase">Liquidity Available</span>
                  <span className="text-ghost-white font-['Space_Mono']">${balance}</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-[#00f090] text-[#0a0b0d] font-bold text-[10px] uppercase tracking-widest hover:brightness-110">
                DEPOSIT_FUNDS
              </button>
            </section>

            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                <Clock size={14} className="text-[#717182]" /> AUDIT_LOG
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-[10px]">
                  <div className="w-1 h-auto bg-[#00f090]"></div>
                  <div className="space-y-0.5">
                    <p className="text-[#717182]">NOW</p>
                    <p className="text-ghost-white uppercase font-bold tracking-tighter">Terminal Session Initialized</p>
                    <p className="text-[#00f090] font-['Space_Mono']">STATUS: AUTHORIZED</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
