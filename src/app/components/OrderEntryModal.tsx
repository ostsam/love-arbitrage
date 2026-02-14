import React, { useState, useEffect, useRef } from 'react';
import { X, Info, Zap, ShieldAlert, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    names: string;
    price: string;
  };
  betType: 'LONG' | 'SHORT' | 'YES' | 'NO';
  question?: string;
  odds?: string;
  onConfirm: (amount: number) => void;
}

export const OrderEntryModal: React.FC<OrderEntryModalProps> = ({
  isOpen,
  onClose,
  asset,
  betType,
  question,
  odds,
  onConfirm
}) => {
  const [amount, setAmount] = useState<string>('100');
  const [showRisks, setShowRisks] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const isBearish = betType === 'SHORT' || betType === 'NO';
  const isPropBet = betType === 'YES' || betType === 'NO';
  const accentColor = isBearish ? '#ff2e51' : '#00f090';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#0a0b0d] border border-[#2a2e3a] w-full max-w-[340px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Compact Header */}
        <div className="border-b border-[#2a2e3a] p-3 flex justify-between items-center bg-[#1e222d]">
          <h2 className="font-['Oswald'] text-xs font-bold uppercase tracking-[0.2em] text-ghost-white flex items-center gap-2">
            <Zap size={14} style={{ color: accentColor }} />
            {isPropBet ? 'PROP_EXECUTION' : 'MARKET_ORDER'}
          </h2>
          <button onClick={onClose} className="text-[#717182] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Asset Info - Simplified */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-['Space_Mono'] text-[9px] text-[#717182] uppercase">{asset.symbol}</p>
              <p className="font-['Oswald'] text-[10px] uppercase text-ghost-white">{asset.names}</p>
            </div>
            {!isPropBet && (
              <div className="text-right">
                <p className="font-['Space_Mono'] text-[9px] text-[#717182] uppercase">Price</p>
                <p className="font-['Space_Mono'] text-sm font-bold text-ghost-white">${asset.price}</p>
              </div>
            )}
          </div>

          {/* Prop Question & Odds Focus */}
          {isPropBet && (
            <div className="bg-[#1e222d] border border-[#2a2e3a] p-3 space-y-2">
              <p className="font-['Space_Mono'] text-[10px] font-bold text-ghost-white italic leading-tight">
                "{question}"
              </p>
              <div className="flex justify-between items-center border-t border-[#2a2e3a] pt-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#717182] uppercase">Position</span>
                  <span className="text-[10px] font-bold" style={{ color: accentColor }}>{betType}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] text-[#717182] uppercase">Implied Probability</span>
                  <span className="text-[10px] font-bold text-ghost-white">{odds}</span>
                </div>
              </div>
            </div>
          )}

          {/* Input - More Compact */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="font-['Space_Mono'] text-[9px] text-[#717182] uppercase font-bold">Wager Amount</label>
              <span className="font-['Space_Mono'] text-[8px] text-[#00f090]">Bal: $14k</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182] font-['Space_Mono'] text-xs">$</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1e222d] border border-[#2a2e3a] py-2 pl-6 pr-3 text-lg font-['Space_Mono'] text-ghost-white focus:outline-none focus:border-[#00f090]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Risk Toggle - Smaller */}
          <div className="bg-[#050505] border border-[#2a2e3a] p-2">
            <button 
              onClick={() => setShowRisks(!showRisks)}
              className="w-full flex justify-between items-center text-[9px] font-['Space_Mono'] text-[#717182] uppercase hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Info size={10} />
                Risk disclosure
              </span>
              <span className="text-[8px]">{showRisks ? 'CLOSE' : 'VIEW'}</span>
            </button>
            
            <AnimatePresence>
              {showRisks && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 text-[8px] text-[#717182] font-['Space_Mono'] leading-tight space-y-1 border-t border-[#2a2e3a] mt-2">
                    <p>• {isPropBet ? 'Payout based on final binary outcome.' : 'Leverage restricted to 1x for this asset.'}</p>
                    <p>• Settlement relies on verified tabloid reports.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => onConfirm(Number(amount))}
            className="w-full py-3 font-['Oswald'] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ 
              backgroundColor: accentColor,
              color: '#0a0b0d'
            }}
          >
            CONFIRM_{betType}
            {isBearish ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
