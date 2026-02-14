import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Activity, Database, AlertTriangle } from 'lucide-react';

interface AnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const possibleLogs = [
    "INITIALIZING NEURAL HARVESTER...",
    "EXTRACTING VOICE SENTIMENT...",
    "CROSS-REFERENCING BLAXEL HISTORY...",
    "DETECTING MICRO-AGGRESSIONS...",
    "ANALYZING VACATION PHOTO METADATA...",
    "CALCULATING DIVORCE PROBABILITY...",
    "RUNNING MONTE CARLO BREAKUP SIMULATION...",
    "MARGIN CALL DETECTED: $CHAD-BRITT...",
    "LEAKED DM SCRAPING COMPLETE...",
    "FINALIZING PREDICTION MODEL..."
  ];

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setLogs([]);
      let currentLogIndex = 0;
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.5;
        });

        if (Math.random() > 0.7 && currentLogIndex < possibleLogs.length) {
          setLogs(prev => [...prev, possibleLogs[currentLogIndex]]);
          currentLogIndex++;
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b0d]/90 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-2xl bg-[#0a0b0d] border-2 border-[#00f090] relative overflow-hidden">
            {/* Glitch Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle,at_50%_50%,#00f090_0%,transparent_100%)] animate-pulse"></div>
            
            <div className="p-4 border-b border-[#00f090] flex justify-between items-center bg-[#00f090]/10">
              <div className="flex items-center gap-2">
                <Cpu className="text-[#00f090]" size={18} />
                <h2 className="font-['Oswald'] font-bold text-[#00f090] tracking-widest uppercase">CRUNCHING MODE</h2>
              </div>
              <button onClick={onClose} className="text-[#00f090] hover:bg-[#00f090] hover:text-[#0a0b0d] p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-['Space_Mono'] text-xs text-[#00f090]">SYSTEM ANALYSIS PROGRESS</span>
                  <span className="font-['Space_Mono'] text-lg font-bold text-[#00f090]">{Math.floor(progress)}%</span>
                </div>
                <div className="h-4 w-full bg-[#1e222d] border border-[#2a2e3a]">
                  <motion.div 
                    className="h-full bg-[#00f090]"
                    style={{ width: `${progress}%` }}
                    layoutId="progress-bar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#1e222d] border border-[#2a2e3a] p-3">
                  <div className="flex items-center gap-2 text-[#717182] mb-2">
                    <Activity size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Waveform Analysis</span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-1 bg-[#00f090]"
                        animate={{ height: [10, 40, 20, 35, 15] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-[#1e222d] border border-[#2a2e3a] p-3">
                  <div className="flex items-center gap-2 text-[#717182] mb-2">
                    <Database size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Metadata Scrape</span>
                  </div>
                  <div className="text-[#00f090] font-['Space_Mono'] text-[10px] space-y-1">
                    <div>LAT: 34.0522° N</div>
                    <div>LONG: 118.2437° W</div>
                    <div>FREQ: 44.1kHz</div>
                    <div>ENCODING: PCM_S16LE</div>
                  </div>
                </div>
              </div>

              <div className="h-40 bg-[#050505] border border-[#2a2e3a] p-4 font-['Space_Mono'] text-[10px] overflow-y-auto">
                <div className="text-[#00f090]/40 mb-2">--- SYSTEM LOG START ---</div>
                {logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-[#717182] mr-2">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-[#00f090]">{log}</span>
                  </div>
                ))}
                {progress < 100 && (
                  <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-2 h-3 bg-[#00f090] inline-block"
                  />
                )}
                {progress === 100 && (
                  <div className="mt-4 flex items-center gap-2 text-[#ff2e51] animate-pulse">
                    <AlertTriangle size={14} />
                    <span className="font-bold">CRITICAL DECOUPLING DETECTED</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#2a2e3a] flex justify-end">
              <button 
                disabled={progress < 100}
                onClick={onClose}
                className={`px-6 py-2 font-bold uppercase tracking-widest text-xs transition-all ${
                  progress === 100 
                    ? 'bg-[#00f090] text-[#0a0b0d] cursor-pointer' 
                    : 'bg-[#1e222d] text-[#717182] cursor-not-allowed'
                }`}
              >
                PROCEED TO ASSET
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
