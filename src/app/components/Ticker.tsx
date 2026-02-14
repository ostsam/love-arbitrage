import React from 'react';

const TICKER_DATA = [
  { symbol: '$TAY-TRAV', price: '+2.4%', up: true },
  { symbol: '$BEN-JEN', price: '-15.2%', up: false },
  { symbol: '$KIM-K', price: '-0.1%', up: false },
  { symbol: '$TOM-ZEND', price: '+8.9%', up: true },
  { symbol: '$BIEBER-H', price: '-4.3%', up: false },
  { symbol: '$RIRI-ASAP', price: '+1.2%', up: true },
  { symbol: '$KYLIE-TIM', price: '+12.5%', up: true },
  { symbol: '$PEWDS-MAR', price: '+0.5%', up: true },
];

export const Ticker: React.FC = () => {
  return (
    <div className="w-full bg-black border-b border-[#2a2e3a] overflow-hidden py-1 select-none">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center mx-8 space-x-2">
            <span className="font-['Space_Mono'] font-bold text-ghost-white tracking-tighter">
              {item.symbol}
            </span>
            <span className={`font-['Space_Mono'] ${item.up ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
              {item.price}
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
