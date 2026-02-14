import React from 'react';
import { Trophy, Users, TrendingUp, TrendingDown, Zap, Shield, Crown } from 'lucide-react';

const TOP_TRADERS = [
  { rank: 1, name: 'QUQUANT_REAPER', profit: '+$1.4M', winRate: '92%', avatar: 'QR' },
  { rank: 2, name: 'DIVORCE_WHISPER', profit: '+$842k', winRate: '88%', avatar: 'DW' },
  { rank: 3, name: 'GOSSIP_ALGO_V2', profit: '+$620k', winRate: '85%', avatar: 'GV' },
  { rank: 4, name: 'PABLO_THE_LEAKER', profit: '+$415k', winRate: '81%', avatar: 'PL' },
  { rank: 5, name: 'MARGIN_CALLER', profit: '+$210k', winRate: '79%', avatar: 'MC' },
];

const SYNDICATES = [
  { name: 'THE_BREAKUP_FUND', members: 42, aum: '$12.4M', return: '+24.5%', tag: 'AGGRESSIVE' },
  { name: 'WEDDING_BELLS_SHORT', members: 128, aum: '$45.2M', return: '+18.2%', tag: 'STABLE' },
  { name: 'PAPARAZZI_SYNDICATE', members: 15, aum: '$2.1M', return: '+42.1%', tag: 'HIGH_RISK' },
];

export const LeaderboardSection: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[#2a2e3a] pb-6">
          <div>
            <h1 className="font-['Oswald'] text-3xl font-black uppercase tracking-tighter text-ghost-white italic flex items-center gap-3">
              <Trophy className="text-[#00f090]" size={32} /> TOP_LIQUIDATORS
            </h1>
            <p className="font-['Space_Mono'] text-[10px] text-[#717182]">GLOBAL RANKINGS // UPDATED REAL-TIME // SESSION_2026_Q1</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="block text-[8px] text-[#717182] uppercase">Prize Pool</span>
              <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">14.2 BTC</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Traders Table */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-['Oswald'] text-xs font-bold tracking-widest uppercase text-[#717182] flex items-center gap-2">
              <Crown size={14} className="text-[#00f090]" /> Elite Operators
            </h2>
            <div className="border border-[#2a2e3a] bg-[#1e222d] overflow-hidden">
              <table className="w-full text-left font-['Space_Mono'] text-xs">
                <thead>
                  <tr className="border-b border-[#2a2e3a] bg-[#0a0b0d]/50">
                    <th className="p-4 text-[#717182] font-bold">RANK</th>
                    <th className="p-4 text-[#717182] font-bold">OPERATOR</th>
                    <th className="p-4 text-[#717182] font-bold">TOTAL_PROFIT</th>
                    <th className="p-4 text-[#717182] font-bold text-right">WIN_RATE</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_TRADERS.map((trader) => (
                    <tr key={trader.rank} className="border-b border-[#2a2e3a] hover:bg-[#00f090]/5 transition-colors group">
                      <td className="p-4 font-black italic">{trader.rank}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0a0b0d] border border-[#2a2e3a] flex items-center justify-center font-bold text-[10px] text-[#00f090]">
                            {trader.avatar}
                          </div>
                          <span className="group-hover:text-[#00f090] transition-colors font-bold uppercase">{trader.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#00f090] font-bold">{trader.profit}</td>
                      <td className="p-4 text-right font-bold text-ghost-white">{trader.winRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Syndicates */}
          <div className="space-y-4">
            <h2 className="font-['Oswald'] text-xs font-bold tracking-widest uppercase text-[#717182] flex items-center gap-2">
              <Users size={14} className="text-[#00f090]" /> Active Syndicates
            </h2>
            <div className="space-y-3">
              {SYNDICATES.map((syn, i) => (
                <div key={i} className="bg-[#1e222d] border border-[#2a2e3a] p-4 group hover:border-[#00f090] transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-ghost-white group-hover:text-[#00f090] transition-colors">
                      {syn.name}
                    </h3>
                    <span className="text-[8px] bg-[#0a0b0d] px-2 py-0.5 border border-[#2a2e3a] text-[#717182] font-bold">
                      {syn.tag}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-[8px] text-[#717182] uppercase block mb-1">Members</span>
                      <span className="text-xs font-bold text-ghost-white">{syn.members}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-[#717182] uppercase block mb-1">AUM</span>
                      <span className="text-xs font-bold text-[#00f090]">{syn.aum}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#2a2e3a] flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#00f090]">{syn.return} ROI</span>
                    <button className="text-[9px] font-bold text-[#717182] hover:text-white uppercase flex items-center gap-1">
                      Join <Zap size={10} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-3 border border-dashed border-[#2a2e3a] text-[#717182] hover:text-[#00f090] hover:border-[#00f090] transition-all text-[10px] font-bold uppercase tracking-widest">
                + FORM NEW SYNDICATE
              </button>
            </div>
          </div>
        </div>

        {/* Global Hall of Shame */}
        <section className="bg-[#ff2e51]/5 border border-[#ff2e51]/20 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={24} className="text-[#ff2e51]" />
            <div>
              <h2 className="font-['Oswald'] text-lg font-bold uppercase tracking-widest text-[#ff2e51]">MARKET_LIQUIDATIONS</h2>
              <p className="font-['Space_Mono'] text-[9px] text-[#717182]">Largest margin losses in the last 24 hours.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#0a0b0d] border border-[#ff2e51]/30 p-3 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-ghost-white italic">REKT_OPERATOR_0{i}</span>
                  <TrendingDown size={14} className="text-[#ff2e51]" />
                </div>
                <div className="text-lg font-bold text-[#ff2e51]">-$42,000.00</div>
                <div className="text-[8px] text-[#717182] uppercase">Symbol: $TAY-TRAV SHORT</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
