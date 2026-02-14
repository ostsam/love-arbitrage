import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Users, Cpu, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../utils/api';

interface OnboardingProps {
  onComplete: (profile: any) => void;
  accessToken: string;
  projectId: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, accessToken }) => {
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    
    setLoading(true);
    try {
      const response = await apiFetch('/update-profile', {
        method: 'POST',
        body: JSON.stringify({ name: handle })
      }, accessToken);
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');
      
      onComplete(data);
    } catch (err: any) {
      toast.error(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] flex items-center justify-center p-4 font-['Space_Mono'] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full bg-[radial-gradient(#00ff41_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key="onboarding-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0a0b0d] border border-[#2a2e3a] p-8 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-[#00ff41]" size={24} />
            <h2 className="font-['Oswald'] text-xl font-bold uppercase tracking-widest text-ghost-white italic">Link Identity</h2>
          </div>

          <p className="text-[10px] text-[#717182] uppercase leading-relaxed">
            Set your operator handle. This will be visible to other nodes on the global leaderboard. Choose wisely; nodes cannot be renamed.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] text-[#717182] font-bold uppercase tracking-wider">Operator Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41] font-bold">@</span>
                <input 
                  autoFocus
                  required
                  placeholder="WOLF_OF_90210"
                  className="w-full bg-[#050505] border border-[#2a2e3a] p-3 pl-8 text-[#00ff41] focus:outline-none focus:border-[#00ff41] transition-colors placeholder:text-[#1e222d] uppercase"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full py-3 bg-[#00ff41] text-[#050505] font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'INITIALIZING...' : 'ESTABLISH NODE'} <ChevronRight size={18} />
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
