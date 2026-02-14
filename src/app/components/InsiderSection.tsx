import React, { useState, useEffect } from 'react';
import { Database, Zap, ShieldAlert, Terminal, MessageSquare, Radio, Eye } from 'lucide-react';
import { apiFetch } from '../utils/api';

import { ImageWithFallback } from './figma/ImageWithFallback';

export const InsiderSection: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntel();
    const interval = setInterval(fetchIntel, 30000); // Refresh every 30 seconds as requested
    return () => clearInterval(interval);
  }, [accessToken]);

  const fetchIntel = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/get-intel', {}, accessToken);
      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch intel');
    } finally {
      setTimeout(() => setIsLoading(false), 1000); // Artificial delay for terminal feel
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2e3a] flex justify-between items-center bg-[#0a0b0d]">
        <div>
          <h1 className="font-['Oswald'] text-xl font-bold uppercase tracking-widest text-[#00f090] italic flex items-center gap-3">
            <Database size={20} /> INSIDER_TRADING_FEED
          </h1>
          <p className="font-['Space_Mono'] text-[9px] text-[#717182]">REAL-TIME ENCRYPTED INTELLIGENCE STREAM // CLEARANCE: LEVEL_4</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-[#1e222d] border border-[#2a2e3a] px-3 py-1">
            <Radio size={12} className={`text-[#ff2e51] ${isLoading ? '' : 'animate-pulse'}`} />
            <span className="font-['Space_Mono'] text-[9px] font-bold">LIVE_INTERCEPT</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-['Space_Mono'] text-xs">
          {logs.length === 0 && !isLoading && (
            <div className="text-[#717182] text-[10px] animate-pulse p-4 text-center border border-dashed border-[#2a2e3a]">
              WAITING FOR ENCRYPTED PACKETS...
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="group border border-[#2a2e3a] hover:border-[#00f090] bg-[#0a0b0d] p-3 transition-all relative">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#717182] font-bold">[{log.time}]</span>
                  <span className="text-[10px] bg-[#1e222d] px-2 py-0.5 border border-[#2a2e3a] text-[#00f090] uppercase">{log.source}</span>
                  <span className="font-bold text-[#00f090] underline cursor-pointer">{log.symbol}</span>
                </div>
                <div className={`px-2 py-0.5 text-[9px] font-bold ${
                  log.severity === 'CRITICAL' ? 'bg-[#ff2e51] text-white animate-pulse' : 
                  log.severity === 'HIGH' ? 'bg-[#ff2e51]/20 text-[#ff2e51]' : 
                  'bg-[#717182]/20 text-[#717182]'
                }`}>
                  {log.severity}
                </div>
              </div>
              <p className="text-ghost-white leading-relaxed mb-3">
                <span className="text-[#717182] mr-2">&gt;</span>
                {log.message}
              </p>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[9px] font-bold text-[#00f090] hover:underline flex items-center gap-1">
                  <Zap size={10} /> EXECUTE_TRADE
                </button>
                <button className="text-[9px] font-bold text-[#717182] hover:underline flex items-center gap-1">
                  <Eye size={10} /> VIEW_RAW_DATA
                </button>
              </div>
              {/* Scanline decoration */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f090]/10 group-hover:bg-[#00f090]/30"></div>
            </div>
          ))}

          {/* Terminal Loading Simulation */}
          <div className="py-4 text-[#717182] text-[10px] space-y-1">
            <p>&gt; Re-indexing metadata pools...</p>
            <p>&gt; Establishing secure handshake with gossip node 0xf21...</p>
            <div className="flex items-center gap-1">
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-80 border-l border-[#2a2e3a] bg-[#0a0b0d] hidden lg:flex flex-col">
          <div className="p-4 border-b border-[#2a2e3a]">
            <h2 className="font-['Oswald'] text-xs font-bold uppercase tracking-widest text-[#717182] mb-4 flex items-center gap-2">
              <Terminal size={14} /> INTELLIGENCE_STATUS
            </h2>
            <div className="space-y-4">
              <div className="bg-[#1e222d] p-3 border border-[#2a2e3a]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-[#717182] uppercase">Processing Load</span>
                  <span className="text-[9px] text-[#00f090]">88%</span>
                </div>
                <div className="w-full h-1 bg-[#0a0b0d]">
                  <div className="h-full bg-[#00f090]" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1e222d] p-2 border border-[#2a2e3a] text-center">
                  <div className="text-[18px] font-bold text-[#ff2e51]">14</div>
                  <div className="text-[8px] text-[#717182] uppercase">CRITICAL_EVENTS</div>
                </div>
                <div className="bg-[#1e222d] p-2 border border-[#2a2e3a] text-center">
                  <div className="text-[18px] font-bold text-[#00f090]">2k+</div>
                  <div className="text-[8px] text-[#717182] uppercase">DATA_PACKETS/S</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="font-['Oswald'] text-xs font-bold uppercase tracking-widest text-[#717182] mb-4">ACTIVE_WIRETAPS</h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 items-center p-2 hover:bg-[#1e222d] cursor-pointer group">
                  <div className="w-8 h-8 bg-[#0a0b0d] border border-[#2a2e3a] flex items-center justify-center">
                    <MessageSquare size={14} className="text-[#717182] group-hover:text-[#00f090]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-ghost-white">FEED_0{i}_ENCRYPTED</div>
                    <div className="text-[8px] text-[#00f090]">UPTIME: 14:02:{i}0</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#2a2e3a]">
            <h2 className="font-['Oswald'] text-xs font-bold uppercase tracking-widest text-[#717182] mb-3">INTERCEPT_PREVIEW</h2>
            <div className="aspect-video border border-[#2a2e3a] relative group overflow-hidden">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1628582235908-b73cd85ceecc?q=80&w=500" 
                alt="Glitch Feed" 
                className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-[#00f090]/10 pointer-events-none"></div>
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#ff2e51] rounded-full animate-pulse"></div>
                <span className="text-[8px] font-bold text-white">REC</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#2a2e3a]">
            <div className="bg-[#ff2e51]/10 border border-[#ff2e51]/40 p-3 flex gap-3">
              <ShieldAlert className="text-[#ff2e51] shrink-0" size={16} />
              <div>
                <p className="text-[9px] font-bold text-[#ff2e51] uppercase">Security Warning</p>
                <p className="text-[8px] text-[#717182]">Unauthorized sharing of intel logs will result in immediate margin liquidation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
