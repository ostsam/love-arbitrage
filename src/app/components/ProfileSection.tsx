import React from 'react';
import { RECENT_BETS } from '../data/market-data';
import { User, Wallet, History, Shield, Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const ProfileSection: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-[#2a2e3a] pb-8">
          <div className="w-32 h-32 border-2 border-[#00f090] bg-[#1e222d] flex items-center justify-center relative group">
            <User size={64} className="text-[#00f090]" />
            <div className="absolute inset-0 bg-[#00f090]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="font-['Oswald'] text-3xl font-black uppercase tracking-tighter text-ghost-white italic">OPERATOR_0821</h1>
              <span className="bg-[#00f090] text-[#0a0b0d] px-2 py-0.5 text-[10px] font-bold">LEGENDARY</span>
            </div>
            <p className="font-['Space_Mono'] text-sm text-[#717182]">Joined: Feb 2024 | Total Trades: 1,248</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                <span className="text-[10px] text-[#717182] uppercase block mb-1">Portfolio Value</span>
                <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">$14,204.67</span>
              </div>
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 w-40">
                <span className="text-[10px] text-[#717182] uppercase block mb-1">Win Rate</span>
                <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">68.4%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Positions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
              <h2 className="font-['Oswald'] font-bold text-xs tracking-widest uppercase text-ghost-white flex items-center gap-2">
                <Shield size={14} className="text-[#00f090]" /> Active Positions
              </h2>
            </div>
            <div className="space-y-2">
              {RECENT_BETS.filter(b => b.status === 'OPEN').map((bet, i) => (
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
              ))}
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                <Wallet size={14} className="text-[#717182]" /> Wallet Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#717182] uppercase">Margin Utilized</span>
                  <span className="font-['Space_Mono'] text-xs text-ghost-white">42.5%</span>
                </div>
                <div className="w-full h-1 bg-[#0a0b0d]">
                  <div className="h-full bg-[#00f090]" style={{ width: '42.5%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#717182] uppercase">Available</span>
                  <span className="text-ghost-white font-['Space_Mono']">$8,162.19</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-[#00f090] text-[#0a0b0d] font-bold text-[10px] uppercase tracking-widest hover:brightness-110">
                Deposit Liquidity
              </button>
            </section>

            <section className="bg-[#1e222d] border border-[#2a2e3a] p-4">
              <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-ghost-white mb-4 flex items-center gap-2">
                <Clock size={14} className="text-[#717182]" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 text-[10px]">
                    <div className="w-1 h-auto bg-[#00f090]"></div>
                    <div className="space-y-0.5">
                      <p className="text-[#717182]">2 hours ago</p>
                      <p className="text-ghost-white uppercase font-bold tracking-tighter">Liquidated $BEN-JEN short position</p>
                      <p className="text-[#00f090] font-['Space_Mono']">PROFIT: +$240.50</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
