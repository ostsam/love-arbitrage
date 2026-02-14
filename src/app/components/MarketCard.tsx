import React from 'react';
import { ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketCardProps {
  symbol: string;
  names: string;
  price: string;
  change: string;
  isUp: boolean;
  volatility?: 'LOW' | 'MED' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  image: string;
  hasProps?: boolean;
  onClick?: () => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  symbol,
  names,
  price,
  change,
  isUp,
  volatility = 'MED',
  image,
  hasProps,
  onClick
}) => {
  const volColor = {
    LOW: 'text-blue-400 border-blue-400',
    MED: 'text-yellow-400 border-yellow-400',
    HIGH: 'text-orange-500 border-orange-500',
    EXTREME: 'text-red-500 border-red-500 animate-pulse',
    CRITICAL: 'text-red-600 border-red-600 bg-red-600/10'
  }[volatility];

  const isLeveraged = volatility === 'EXTREME' || volatility === 'CRITICAL';

  return (
    <div 
      className="group relative bg-[#1e222d] border border-[#2a2e3a] p-4 cursor-pointer hover:border-[#00f090] transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[#2a2e3a] overflow-hidden grayscale group-hover:grayscale-0 transition-all">
            <ImageWithFallback src={image} alt={names} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-['Space_Mono'] font-bold text-sm tracking-tighter text-[#e1e3e6] leading-none">{symbol}</h4>
            <p className="font-['Oswald'] text-[10px] uppercase text-[#717182] mt-1">{names}</p>
          </div>
        </div>
        <div className={`flex items-center px-1.5 py-0.5 border text-[9px] font-bold ${volColor}`}>
          <Zap size={8} className="mr-1" />
          {volatility} VOL
        </div>
      </div>

      {hasProps && (
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#00f090] text-[#0a0b0d] text-[8px] px-1.5 py-0.5 font-bold italic tracking-tighter z-10">
          EVENT_ACTIVE
        </div>
      )}

      {isLeveraged && (
        <div className="absolute -top-1 left-2 bg-red-600 text-white text-[7px] px-1 font-black tracking-widest uppercase z-10">
          20X_LEVERAGE_AVAIL
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <div className="font-['Space_Mono'] text-lg font-bold text-[#e1e3e6]">
            ${price}
          </div>
          <div className={`flex items-center font-['Space_Mono'] text-xs ${isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </div>
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 bg-[#00f090]/10 border border-[#00f090] text-[#00f090] text-[10px] font-bold hover:bg-[#00f090] hover:text-[#0a0b0d] transition-colors">
            BUY
          </button>
          <button className="px-3 py-1 bg-[#ff2e51]/10 border border-[#ff2e51] text-[#ff2e51] text-[10px] font-bold hover:bg-[#ff2e51] hover:text-white transition-colors">
            SELL
          </button>
        </div>
      </div>
    </div>
  );
};
