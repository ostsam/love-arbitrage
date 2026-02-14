import React from 'react';

interface TickerProps {
  assets?: any[];
}

export const Ticker: React.FC<TickerProps> = ({ assets = [] }) => {
  const displayAssets = assets.length > 0 ? assets : [
    { symbol: '$TAY-TRAV', change: '+2.4%', isUp: true },
    { symbol: '$BEN-JEN', change: '-15.2%', isUp: false },
    { symbol: '$KIM-K', change: '-0.1%', isUp: false },
    { symbol: '$TOM-ZEND', change: '+8.9%', isUp: true },
  ];

  return (
    <div className="w-full bg-black border-b border-[#2a2e3a] overflow-hidden py-1 select-none">
      <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        {[...displayAssets, ...displayAssets].map((item, idx) => (
          <div key={idx} className="flex items-center mx-10 space-x-2">
            <span className="font-['Space_Mono'] font-bold text-ghost-white tracking-tighter">
              {item.symbol}
            </span>
            <span className={`font-['Space_Mono'] ${item.isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
              {item.change || '0.00%'}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
