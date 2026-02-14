import React from 'react';
import { ALL_ASSETS } from '../data/market-data';
import { CandlestickChart } from './CandlestickChart';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  MessageSquare, 
  Activity, 
  BarChart3,
  Flame,
  AlertTriangle,
  GanttChart,
  History,
  Clock,
  Info
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PropBet } from '../data/market-data';
import { toast } from 'sonner';
import { OrderEntryModal } from './OrderEntryModal';

interface AssetDetailViewProps {
  asset: any;
  onBack: () => void;
  onBet: (side: 'long' | 'short' | 'yes' | 'no', propBet?: PropBet) => void;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({ asset, onBack, onBet }) => {
  const handlePropBet = (bet: PropBet, side: 'YES' | 'NO') => {
    onBet(side.toLowerCase() as any, bet);
  };

  const handleMarketTrade = (side: 'LONG' | 'SHORT') => {
    onBet(side.toLowerCase() as any);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] flex flex-col">
      {/* Navigation Header */}
      <div className="p-4 border-b border-[#2a2e3a] flex items-center justify-between sticky top-0 bg-[#0a0b0d]/80 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#717182] hover:text-[#00f090] font-['Space_Mono'] text-[10px] font-bold uppercase transition-colors"
        >
          <ArrowLeft size={14} /> Back to Terminal
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[8px] text-[#717182] uppercase">Asset Rating</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 bg-[#00f090]"></div>)}
              <div className="w-2 h-2 bg-[#2a2e3a]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Left Column: Data & Chart */}
        <div className="lg:col-span-2 border-r border-[#2a2e3a] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 border border-[#2a2e3a] shrink-0 bg-[#1e222d] overflow-hidden grayscale contrast-125">
                <ImageWithFallback 
                  src={asset.image} 
                  alt={asset.names}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="font-['Oswald'] text-4xl font-black uppercase tracking-tighter italic text-ghost-white">
                    {asset.symbol}
                  </h1>
                  <span className={`px-2 py-0.5 text-[10px] font-bold ${asset.isUp ? 'bg-[#00f090] text-[#0a0b0d]' : 'bg-[#ff2e51] text-white'}`}>
                    {asset.change}
                  </span>
                </div>
                <h2 className="font-['Space_Mono'] text-lg text-[#717182] font-bold">{asset.names}</h2>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-[#ff2e51]" />
                    <span className="text-[10px] text-[#717182] uppercase">Volatility:</span>
                    <span className="text-[10px] text-[#ff2e51] font-bold">{asset.volatility}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity size={14} className="text-[#00f090]" />
                    <span className="text-[10px] text-[#717182] uppercase">Market Cap:</span>
                    <span className="text-[10px] text-ghost-white font-bold">$1.48B</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] text-[#717182] uppercase font-bold tracking-widest">Mark Price</span>
                <span className={`font-['Space_Mono'] text-4xl font-black ${asset.isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
                  ${asset.price}
                </span>
                <span className="text-[9px] text-[#717182]">REAL_TIME_INDEX_VAL</span>
              </div>
            </div>

            <div className="h-[400px] border border-[#2a2e3a] bg-[#050505] p-4 relative overflow-hidden group">
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 font-['Space_Mono'] text-[10px] text-[#00f090]">
                  <BarChart3 size={14} />
                  <span>RELATIONSHIP_STABILITY_INDEX (RSI)</span>
                </div>
              </div>
              <CandlestickChart />
              {/* Fake Depth Overlay */}
              <div className="absolute bottom-4 right-4 text-[8px] text-[#717182] font-mono leading-tight bg-[#0a0b0d]/80 p-2 border border-[#2a2e3a]">
                <p>O: 42.50 H: 43.10</p>
                <p>L: 41.90 C: 42.50</p>
                <p>VOL: 1,248,912</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-4">
                <h3 className="text-[10px] font-bold text-[#717182] uppercase mb-4 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-[#00f090]" /> Bullish Indicators
                </h3>
                <ul className="space-y-2 text-[10px] font-['Space_Mono']">
                  <li className="flex justify-between">
                    <span className="text-[#717182]">Joint Appearance Index</span>
                    <span className="text-[#00f090] font-bold">STABLE</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[#717182]">Engagement Rumor Probability</span>
                    <span className="text-[#00f090] font-bold">12.4%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[#717182]">Public PDA Intensity</span>
                    <span className="text-[#00f090] font-bold">HIGH</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#1e222d] border border-[#2a2e3a] p-4">
                <h3 className="text-[10px] font-bold text-[#717182] uppercase mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#ff2e51]" /> Bearish Indicators
                </h3>
                <ul className="space-y-2 text-[10px] font-['Space_Mono']">
                  <li className="flex justify-between">
                    <span className="text-[#717182]">Separate Vacation Delta</span>
                    <span className="text-[#ff2e51] font-bold">+14 DAYS</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[#717182]">Cryptic IG Post Volatility</span>
                    <span className="text-[#ff2e51] font-bold">ELEVATED</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[#717182]">PR Denial Lag-time</span>
                    <span className="text-ghost-white font-bold">8 HOURS</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Kalshi-style Prop Bets */}
            {asset.propBets && asset.propBets.length > 0 && (
              <section className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
                  <h3 className="font-['Oswald'] text-sm font-bold uppercase tracking-widest text-ghost-white flex items-center gap-2">
                    <GanttChart size={16} className="text-[#00f090]" /> EVENT_MARKETS (PROP_BETS)
                  </h3>
                  <span className="font-['Space_Mono'] text-[9px] text-[#717182]">SETTLEMENT: CASUALTY_ADJUSTED</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {asset.propBets.map((bet: PropBet) => (
                    <div key={bet.id} className="bg-[#1e222d] border border-[#2a2e3a] p-4 flex flex-col gap-3 group hover:border-[#00f090] transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-[#0a0b0d] px-1.5 py-0.5 text-[#717182] font-bold">ID_{bet.id}</span>
                            <span className="text-[8px] text-[#717182] flex items-center gap-1 uppercase tracking-tighter">
                              <Clock size={10} /> {bet.expiry}
                            </span>
                          </div>
                          <div className="group/info relative cursor-help">
                            <Info size={12} className="text-[#717182] hover:text-ghost-white" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0b0d] border border-[#2a2e3a] p-2 text-[8px] text-[#717182] opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-20 font-['Space_Mono'] uppercase">
                              Settlement relies on verified tabloid reports or primary social metadata. High risk of slippage.
                            </div>
                          </div>
                        </div>
                        <p className="font-['Space_Mono'] text-[11px] font-bold text-ghost-white group-hover:text-[#00f090] transition-colors italic leading-tight">
                          "{bet.question}"
                        </p>
                        <div className="flex gap-4 text-[8px] text-[#717182] uppercase">
                          <span>Vol: {bet.volume}</span>
                          <span>Liq: HIGH</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center text-[10px] font-['Space_Mono'] font-bold uppercase px-1">
                          <span className="text-[#00f090]">{bet.yesOdds}</span>
                          <span className="text-[#ff2e51]">{bet.noOdds}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handlePropBet(bet, 'YES')}
                            className="flex-1 h-10 bg-transparent border border-[#00f090] hover:bg-[#00f090] hover:text-[#0a0b0d] flex items-center justify-center transition-all font-black text-xs text-[#00f090]"
                          >
                            YES
                          </button>
                          <button 
                            onClick={() => handlePropBet(bet, 'NO')}
                            className="flex-1 h-10 bg-transparent border border-[#ff2e51] hover:bg-[#ff2e51] hover:text-white flex items-center justify-center transition-all font-black text-xs text-[#ff2e51]"
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="h-32"></div> {/* Spacer for bottom scroll */}
          </div>
        </div>

        {/* Right Column: Trading Interface */}
        <div className="bg-[#0a0b0d] p-6 space-y-6 overflow-y-auto">
          <section className="space-y-4">
            <h3 className="font-['Oswald'] text-xs font-bold uppercase tracking-widest text-[#717182]">Terminal Execution</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleMarketTrade('LONG')}
                className="group relative overflow-hidden h-24 border border-[#00f090] bg-transparent hover:bg-[#00f090] transition-all flex flex-col items-center justify-center gap-1"
              >
                <TrendingUp size={24} className="text-[#00f090] group-hover:text-[#0a0b0d]" />
                <span className="font-bold text-sm text-[#00f090] group-hover:text-[#0a0b0d]">LONG (STAY)</span>
                <span className="text-[9px] text-[#00f090]/60 group-hover:text-[#0a0b0d]/60 font-bold tracking-widest">BULLISH BET</span>
              </button>
              <button 
                onClick={() => handleMarketTrade('SHORT')}
                className="group relative overflow-hidden h-24 border border-[#ff2e51] bg-transparent hover:bg-[#ff2e51] transition-all flex flex-col items-center justify-center gap-1"
              >
                <TrendingDown size={24} className="text-[#ff2e51] group-hover:text-white" />
                <span className="font-bold text-sm text-[#ff2e51] group-hover:text-white">SHORT (BREAK)</span>
                <span className="text-[9px] text-[#ff2e51]/60 group-hover:text-white/60 font-bold tracking-widest">BEARISH BET</span>
              </button>
            </div>
          </section>

          <section className="bg-[#1e222d] border border-[#2a2e3a] p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
              <h3 className="font-['Oswald'] text-[10px] font-bold uppercase tracking-widest text-[#717182]">Market Mood Poll</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] text-ghost-white font-['Space_Mono'] italic">How long will this last?</p>
              <div className="space-y-2">
                {[
                  { label: '< 3 Months', percent: 42, color: '#ff2e51' },
                  { label: 'End of Year', percent: 28, color: '#717182' },
                  { label: 'Marriage', percent: 18, color: '#00f090' },
                  { label: 'Eternity', percent: 12, color: '#00f090' }
                ].map((option, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#717182]">{option.label}</span>
                      <span className="text-ghost-white font-bold">{option.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0a0b0d]">
                      <div 
                        className="h-full" 
                        style={{ width: `${option.percent}%`, backgroundColor: option.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#1e222d] border border-[#2a2e3a] p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a2e3a] pb-2">
              <h3 className="font-['Oswald'] text-[10px] font-bold uppercase tracking-widest text-[#717182]">Position Specs</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#717182]">Leverage</span>
                <span className="text-[#00f090] font-bold">20x (Isolated)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#717182]">Est. Liquidation Price</span>
                <span className="text-[#ff2e51] font-bold">$38.12</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#717182]">Maintenance Margin</span>
                <span className="text-ghost-white font-bold">$12.40</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-['Oswald'] text-[10px] font-bold uppercase tracking-widest text-[#717182] flex items-center gap-2">
              <MessageSquare size={14} /> Gossip Order Book
            </h3>
            <div className="space-y-1 font-['Space_Mono'] text-[9px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-[#1e222d] p-1">
                  <span className={i < 3 ? 'text-[#ff2e51]' : 'text-[#00f090]'}>{(42 + (i * 0.05)).toFixed(2)}</span>
                  <span className="text-[#717182]">{(Math.random() * 5).toFixed(1)}k UNITS</span>
                  <div className="w-16 h-1 bg-[#1e222d] relative overflow-hidden">
                    <div 
                      className={`h-full absolute right-0 ${i < 3 ? 'bg-[#ff2e51]/20' : 'bg-[#00f090]/20'}`} 
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
