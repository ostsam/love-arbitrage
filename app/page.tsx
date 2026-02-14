"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Asterisk, X } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  YAxis,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

// --- Bespoke Data ---
const useMarketData = () => {
  return useMemo(() => ({
    bull: Array.from({ length: 15 }, (_, i) => ({ v: 15 + Math.sin(i * 0.5) * 5 + i * 2 })),
    bear: Array.from({ length: 15 }, (_, i) => ({ v: 55 - i * 2.5 + Math.cos(i * 0.5) * 5 })),
    macro: [
      { v: 60 }, { v: 68 }, { v: 55 }, { v: 92 }, { v: 85 }, { v: 95 }, 
      { v: 50 }, { v: 30 }, { v: 15 }, { v: 20 }, { v: 8 }, { v: 4 }
    ]
  }), []);
};

const generatePairData = (positive: boolean) => 
  Array.from({ length: 20 }, (_, i) => ({ 
    v: 30 + (positive ? i * 1.5 : 40 - i * 1.5) + (Math.random() * 10 - 5),
    t: i 
  }));

const MARKETS = {
  LONG: [
    { id: 1, pair: "CHAD & BRITTANY", change: "+$8.42", vol: "$1.2M", img: "https://images.unsplash.com/photo-1516589174184-c685266e430c?w=100&h=100&fit=crop", data: generatePairData(true) },
    { id: 2, pair: "DAVE & JESSICA", change: "+$7.18", vol: "$840K", img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=100&h=100&fit=crop", data: generatePairData(true) },
    { id: 3, pair: "BRUCE & CURRAN", change: "+$2.64", vol: "$2.1M", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", data: generatePairData(true) }
  ],
  SHORT: [
    { id: 4, pair: "RYAN & SARAH", change: "-$12.08", vol: "$4.2M", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", data: generatePairData(false) },
    { id: 5, pair: "DAVIS & SUSAN", change: "-$11.65", vol: "$2.8M", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop", data: generatePairData(false) },
    { id: 6, pair: "ALEX & JORDAN", change: "-$9.48", vol: "$1.5M", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", data: generatePairData(false) }
  ]
};

const TICKER_DATA = [
  { pair: "CHAD & BRITTANY", val: "+$8.42", up: true },
  { pair: "RYAN & SARAH", val: "-$12.08", up: false },
  { pair: "DAVE & JESSICA", val: "+$7.18", up: true },
  { pair: "DAVIS & SUSAN", val: "-$11.65", up: false },
  { pair: "BRUCE & CURRAN", val: "+$2.64", up: true },
  { pair: "ALEX & JORDAN", val: "-$9.48", up: false },
];

// --- Atomic Components ---

const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-rose-500/80">
      <path d="M2 20H6L9 10L13 28L16 20H20L28 4M28 4H22M28 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="serif-display text-2xl tracking-tight shimmer-text whitespace-nowrap">Love Arbitrage</span>
  </div>
);

const Ticker = () => (
  <div className="w-full h-14 bg-black/20 backdrop-blur-md border-b border-white/[0.03] overflow-hidden flex items-center">
    <motion.div 
      initial={{ x: 0 }}
      animate={{ x: "-50%" }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="flex whitespace-nowrap gap-16 px-12"
    >
      {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="serif-display text-xl tracking-tight opacity-40">{item.pair}</span>
          <span className={`mono-utility text-[10px] font-bold ${item.up ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
            {item.val}
          </span>
        </div>
      ))}
    </motion.div>
  </div>
);

const MarketDetailCard = ({ market, onClose }: { market: any, positive: boolean, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#080808] border border-white/10 rounded-[2rem] p-12 relative overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
        
        <div className="flex gap-12 items-start mb-8">
          <div className="w-44 h-44 rounded-[2rem] overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
            <img src={market.img} alt={market.pair} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="mono-utility text-[10px] opacity-30">Security Asset: 0x{market.id}</span>
              <div className="px-2 py-0.5 rounded bg-white/5 mono-utility text-[8px]">Live Data</div>
            </div>
            <h2 className="serif-display text-5xl tracking-tighter mb-6 italic">{market.pair}</h2>
            <div className="flex gap-12">
               <div className="flex flex-col"><span className="mono-utility text-[8px] opacity-30">Last Trade</span><span className="text-2xl font-bold font-mono text-white/90">$142.04</span></div>
               <div className="flex flex-col"><span className="mono-utility text-[8px] opacity-30">24H Volume</span><span className="text-2xl font-bold font-mono text-white/90">{market.vol}</span></div>
               <div className="flex flex-col"><span className="mono-utility text-[8px] opacity-30">Equity Cap</span><span className="text-2xl font-bold font-mono text-white/90">$12.4M</span></div>
            </div>
          </div>
        </div>

        <div className="h-64 w-full bg-white/[0.02] rounded-2xl border border-white/[0.05] p-4 relative mb-10 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={market.data}>
              <defs>
                <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.4)" fill="url(#cardGrad)" strokeWidth={2} dot={false} animationDuration={1000} />
              <ReferenceLine y={35} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <button className="group relative py-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 mono-utility text-[10px] font-bold tracking-widest hover:bg-emerald-500/20 transition-all overflow-hidden uppercase">
            Place Long Position
          </button>
          <button className="group relative py-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 mono-utility text-[10px] font-bold tracking-widest hover:bg-rose-500/20 transition-all overflow-hidden uppercase">
            Place Short Position
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PairRow = ({ item, positive, active, onClick }: { item: any, positive: boolean, active: boolean, onClick: () => void }) => (
  <motion.div 
    onClick={onClick}
    animate={{ 
      backgroundColor: active ? "rgba(255,255,255,0.04)" : "transparent", 
      borderColor: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
      x: active ? 4 : 0
    }}
    className="flex items-center justify-between py-4 px-4 rounded-2xl border cursor-pointer transition-all duration-500 group"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
        <img src={item.img} alt={item.pair} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="serif-display text-base tracking-tight text-white/80 group-hover:text-white transition-all">{item.pair}</span>
        <span className="mono-utility text-[7px] opacity-40">VOL: {item.vol}</span>
      </div>
    </div>
    <span className={`mono-utility text-[10px] font-bold ${positive ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>{item.change}</span>
  </motion.div>
);

export default function LoveArbitrageExchange() {
  const [mounted, setMounted] = useState(false);
  const [activeLong, setActiveLong] = useState(0);
  const [activeShort, setActiveShort] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  
  const data = useMarketData();
  const currentMacro = data.macro[data.macro.length - 1].v;
  const isMarketDown = currentMacro < 50;

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveLong(p => (p + 1) % MARKETS.LONG.length);
      setActiveShort(p => (p + 1) % MARKETS.SHORT.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="bg-[#020203] min-h-screen" />;

  return (
    <main className="relative min-h-screen w-full bg-canvas text-white selection:bg-white/10 pb-20">
      <div className="grain-overlay" />
      
      <nav className="sticky top-0 left-0 w-full z-[110] bg-black/40 backdrop-blur-md border-b border-white/[0.02] h-24 px-16 flex items-center justify-between">
        <div className="flex items-center gap-24">
          <Logo />
          <div className="hidden lg:flex items-center gap-14 mt-1">
            {['Terminal', 'Markets', 'Archives'].map(item => (
              <a key={item} className="mono-utility text-[11px] font-bold hover:text-white transition-colors cursor-pointer text-white/40">{item}</a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end leading-tight"><span className="mono-utility text-[8px] opacity-30 uppercase tracking-widest">Equity</span><span className="text-sm font-bold font-mono text-emerald-500/80">$42,840.12</span></div>
           <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all"><User size={18} className="text-white/40" /></div>
        </div>
      </nav>

      <Ticker />

      <div className="relative z-10 pt-16 flex flex-col items-center">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="serif-display text-[90px] leading-none tracking-tighter italic opacity-90 mb-12">
          {isMarketDown ? "The Great Decoupling" : "Structural Euphoria"}
        </motion.h1>

        <div className="w-full max-w-[1400px] h-[320px] relative px-16">
          <div className="absolute top-0 left-20 z-20 flex flex-col gap-0">
             <span className="serif-display text-7xl tracking-tighter tabular-nums">${currentMacro}.04</span>
             <div className="flex items-center gap-6 mt-2">
                <span className={`mono-utility text-[11px] font-bold ${isMarketDown ? 'text-rose-500' : 'text-emerald-500'}`}>{isMarketDown ? '−12.4%' : '+4.2%'} 24H</span>
                <span className="mono-utility text-[11px] opacity-40">MARKET CAP: $1.42T</span>
             </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.macro}>
              <defs>
                <linearGradient id="macroGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                  <stop offset={isMarketDown ? "40%" : "60%"} stopColor="rgba(255,255,255,0.5)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="v" stroke="url(#macroGrad)" strokeWidth={2} dot={false} animationDuration={3000} className="chart-glow-white" />
              <YAxis hide domain={[0, 100]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-16 grid grid-cols-12 gap-20 mt-12 pb-24">
        <section className="col-span-12 lg:col-span-3 space-y-10">
          <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.3)]"/><span className="mono-utility text-[10px]">Bull Trajectory</span></div>
          <div className="h-28 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKETS.LONG[activeLong].data}>
                <Area type="step" dataKey="v" stroke="#10b981" fill="rgba(16, 185, 129, 0.1)" strokeWidth={1.5} dot={false} animationDuration={500}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">{MARKETS.LONG.map((m, i) => <PairRow key={m.id} item={m} positive active={i === activeLong} onClick={() => setSelectedMarket({ item: m, positive: true })}/>)}</div>
        </section>

        <section className="col-span-12 lg:col-span-6 border-x border-white/[0.03] px-16 flex flex-col">
           <div className="flex-1 flex flex-col justify-center border-b border-white/[0.03] pb-16">
              <p className="serif-display text-4xl leading-tight opacity-60 italic text-center">"{isMarketDown ? "The current trajectory suggests terminal romantic decoupling. Entropy is accelerating." : "Structural euphoria remains dominant as emotional leverage increases."}"</p>
           </div>
           <div className="grid grid-cols-3 gap-12 py-12">
              <Stat label="Market_Volatility" value="98.24%" />
              <Stat label="Sentiment_State" value={isMarketDown ? "Distressed" : "Euphoric"} />
              <Stat label="Aggregate_Delta" value="−$0.42" />
           </div>
        </section>

        <section className="col-span-12 lg:col-span-3 space-y-10">
          <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-rose-900 shadow-[0_0_10px_rgba(244,63,94,0.3)]"/><span className="mono-utility text-[10px]">Bear Correction</span></div>
          <div className="h-28 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKETS.SHORT[activeShort].data}>
                <Area type="step" dataKey="v" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={1.5} dot={false} animationDuration={500}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">{MARKETS.SHORT.map((m, i) => <PairRow key={m.id} item={m} positive={false} active={i === activeShort} onClick={() => setSelectedMarket({ item: m, positive: false })}/>)}</div>
        </section>
      </div>

      <AnimatePresence>{selectedMarket && <MarketDetailCard market={selectedMarket.item} positive={selectedMarket.positive} onClose={() => setSelectedMarket(null)} />}</AnimatePresence>
    </main>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return <div className="flex flex-col gap-2 items-center"><span className="mono-utility text-[8px] opacity-30">{label}</span><span className="serif-display text-3xl opacity-80 italic tracking-tighter">{value}</span></div>;
}
