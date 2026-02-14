import React from 'react';
import { Home, BarChart2, User, Settings, Database, Activity, ShieldAlert, Zap } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const links = [
    { id: 'dashboard', icon: Home, label: 'Terminal Home' },
    { id: 'market', icon: BarChart2, label: 'Global Markets' },
    { id: 'portfolio', icon: Activity, label: 'My Portfolio' },
    { id: 'insider', icon: Database, label: 'Insider Intel' },
    { id: 'profile', icon: User, label: 'User Profile' },
  ];

  return (
    <div className="w-16 md:w-56 border-r border-[#2a2e3a] bg-[#0a0b0d] flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-[#2a2e3a] hidden md:block">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#00f090]" />
          <span className="font-['Oswald'] text-[10px] tracking-widest text-[#717182] uppercase font-bold">Trading Desk</span>
        </div>
      </div>
      
      <nav className="flex-1 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`w-full flex items-center px-4 py-3 gap-3 transition-colors ${
                isActive 
                  ? 'bg-[#00f090]/10 border-r-2 border-[#00f090] text-[#00f090]' 
                  : 'text-[#717182] hover:bg-[#1e222d] hover:text-ghost-white'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:block font-['Oswald'] text-xs uppercase font-bold tracking-wider">
                {link.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2a2e3a] mt-auto">
        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center px-0 py-3 gap-3 transition-colors ${
            currentTab === 'settings' ? 'text-[#00f090]' : 'text-[#717182] hover:text-ghost-white'
          }`}
        >
          <Settings size={20} />
          <span className="hidden md:block font-['Oswald'] text-xs uppercase font-bold tracking-wider">Settings</span>
        </button>
      </div>
    </div>
  );
};
