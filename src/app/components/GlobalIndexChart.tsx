import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

export const GlobalIndexChart: React.FC = () => {
  return (
    <div className="h-48 w-full bg-[#0a0b0d] p-4 border border-[#2a2e3a]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-['Oswald'] text-xs uppercase tracking-widest text-[#717182]">Global Love Index</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-['Space_Mono'] text-2xl font-bold text-[#ff2e51]">3,100.42</span>
            <span className="font-['Space_Mono'] text-xs text-[#ff2e51]">-8.4% TODAY</span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 bg-[#ff2e51]/20 text-[#ff2e51] text-[10px] font-bold border border-[#ff2e51]">BEARISH SENTIMENT</span>
        </div>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e222d" />
            <XAxis hide dataKey="time" />
            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e222d', border: '1px solid #2a2e3a', borderRadius: '0' }}
              itemStyle={{ color: '#00f090', fontFamily: 'Space Mono' }}
              labelStyle={{ color: '#e1e3e6', fontFamily: 'Space Mono' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ff2e51"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff2e51" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff2e51" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
