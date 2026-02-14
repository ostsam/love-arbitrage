import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { apiFetch } from '../utils/api';

const data = [
  { time: '09:00', value: 4200 },
  { time: '10:00', value: 4150 },
  { time: '11:00', value: 3900 },
  { time: '12:00', value: 4050 },
  { time: '13:00', value: 3800 },
  { time: '14:00', value: 3650 },
  { time: '15:00', value: 3400 },
  { time: '16:00', value: 3250 },
  { time: '17:00', value: 3100 },
];

export const GlobalIndexChart: React.FC<{ accessToken: string, assets: any[] }> = ({ accessToken, assets }) => {
  const [history, setHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiFetch('/get-gli-history', {}, accessToken);
        const data = await response.json();
        if (data.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch GLI history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [accessToken, assets]); // Re-fetch when assets change (pulse)

  const currentValue = history.length > 0 ? history[history.length - 1].value : 0;
  const previousValue = history.length > 1 ? history[history.length - 2].value : currentValue;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(2) : '0.00';
  const isUp = change >= 0;

  return (
    <div className="h-56 w-full bg-[#0a0b0d] p-4 border border-[#2a2e3a] relative overflow-hidden group">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#2a2e3a 1px, transparent 1px), linear-gradient(90deg, #2a2e3a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-['Oswald'] text-[10px] uppercase tracking-[0.3em] text-[#717182] mb-1">GLOBAL_LOVE_INDEX // AGGREGATE_SENTIMENT</h3>
          <div className="flex items-baseline gap-3">
            <span className={`font-['Space_Mono'] text-3xl font-black tracking-tighter ${isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
              {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 font-['Space_Mono'] text-[10px] font-bold ${isUp ? 'text-[#00f090]' : 'text-[#ff2e51]'}`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{changePercent}%
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-2 py-0.5 text-[9px] font-black border tracking-widest ${
            isUp ? 'bg-[#00f090]/10 text-[#00f090] border-[#00f090]' : 'bg-[#ff2e51]/10 text-[#ff2e51] border-[#ff2e51]'
          }`}>
            {isUp ? 'BULLISH_SENTIMENT' : 'BEARISH_SENTIMENT'}
          </div>
          <div className="mt-2 font-['Space_Mono'] text-[8px] text-[#717182] uppercase">
            SAMPLES: {assets.length} NODES
          </div>
        </div>
      </div>
      
      <div className="h-28 w-full relative z-10">
        {isLoading && history.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-[#717182] text-[10px] animate-pulse">
            CALCULATING_ALGORITHMIC_SENTIMENT...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.length > 1 ? history : (history.length === 1 ? [
              { time: 'PREV', value: history[0].value * 0.98 },
              history[0]
            ] : [{time: '0', value: 0}])}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e222d" />
              <XAxis hide dataKey="time" />
              <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0b0d', border: '1px solid #2a2e3a', borderRadius: '0', padding: '8px' }}
                itemStyle={{ color: isUp ? '#00f090' : '#ff2e51', fontFamily: 'Space Mono', fontSize: '10px' }}
                labelStyle={{ color: '#717182', fontFamily: 'Space Mono', fontSize: '8px', marginBottom: '4px' }}
                cursor={{ stroke: '#2a2e3a', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isUp ? '#00f090' : '#ff2e51'}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorIndex${isUp ? 'Up' : 'Down'})`}
                animationDuration={1000}
              />
              <defs>
                <linearGradient id="colorIndexUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f090" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f090" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIndexDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2e51" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff2e51" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Scanline decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#2a2e3a] group-hover:bg-[#00f090]/30 transition-colors"></div>
    </div>
  );
};
