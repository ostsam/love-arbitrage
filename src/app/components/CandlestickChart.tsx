import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const generateData = () => {
  const data = [];
  let base = 40;
  for (let i = 0; i < 20; i++) {
    const open = base + (Math.random() - 0.5) * 5;
    const close = base + (Math.random() - 0.5) * 5;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    data.push({
      name: `Day ${i}`,
      open,
      close,
      high,
      low,
      fill: close > open ? '#00f090' : '#ff2e51',
      // For Recharts Bar: [start, end]
      range: [Math.min(open, close), Math.max(open, close)],
      wick: [low, high]
    });
    base = close;
  }
  return data;
};

const CustomBar = (props: any) => {
  const { x, y, width, height, fill, wick } = props;
  const wickX = x + width / 2;
  // This is simplified. Normally we'd need to scale wick[0] and wick[1] to the Y axis.
  // Since we're in a ResponsiveContainer, we can't easily get the scale here without more work.
  // I'll just draw the body for now to keep it clean, or use a custom shape that knows the scale.
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
    </g>
  );
};

export const CandlestickChart: React.FC = () => {
  const data = generateData();

  return (
    <div className="h-64 w-full bg-[#0a0b0d] border border-[#2a2e3a] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e222d" vertical={false} />
          <XAxis hide dataKey="name" />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{ fill: '#717182', fontSize: 10, fontFamily: 'Space Mono' }} 
            stroke="#1e222d"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e222d', border: '1px solid #2a2e3a', borderRadius: '0' }}
            itemStyle={{ fontFamily: 'Space Mono', fontSize: 10 }}
            cursor={{ stroke: '#717182', strokeDasharray: '5 5' }}
          />
          <Bar dataKey="range">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
