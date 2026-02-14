import React from 'react';
import { ALL_ASSETS } from '../data/market-data';
import { MarketCard } from './MarketCard';
import { Search, Filter, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface MarketSectionProps {
  assets: any[];
  onSelectAsset: (asset: any) => void;
  searchQuery: string;
}

export const MarketSection: React.FC<MarketSectionProps> = ({ assets, onSelectAsset, searchQuery }) => {
  const [filter, setFilter] = React.useState('ALL');
  
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.names.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'ALL' || asset.category.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0b0d] p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#2a2e3a] pb-4">
        <div>
          <h1 className="font-['Oswald'] text-2xl font-bold uppercase tracking-tight text-ghost-white italic">Global Asset Directory</h1>
          <p className="font-['Space_Mono'] text-[10px] text-[#717182]">TOTAL ASSETS: {ALL_ASSETS.length} | VOL: $14.82B</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PUBLIC', 'PRIVATE'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 border font-['Space_Mono'] text-[10px] font-bold transition-all ${
                filter === cat 
                  ? 'bg-[#00f090] border-[#00f090] text-[#0a0b0d]' 
                  : 'border-[#2a2e3a] text-[#717182] hover:border-[#00f090]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset, index) => (
            <MarketCard 
              key={`${asset.symbol}-${index}`} 
              {...asset} 
              hasProps={!!asset.propBets?.length}
              onClick={() => onSelectAsset(asset)} 
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-[#2a2e3a]">
            <p className="font-['Space_Mono'] text-[#717182] text-sm uppercase">No assets matching search criteria</p>
            <p className="text-[10px] text-[#ff2e51] mt-2">Try searching for celebrity symbols like $TAY or $BEN</p>
          </div>
        )}
      </div>
    </div>
  );
};
