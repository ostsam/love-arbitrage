import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Check, X, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { apiFetch } from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const FriendsSearch: React.FC<{ accessToken: string, onAdd?: () => void }> = ({ accessToken, onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const fetchFriends = async () => {
    try {
      const response = await apiFetch('/friends', {}, accessToken);
      const data = await response.json();
      if (Array.isArray(data)) {
        setFriends(data.map((f: any) => f.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (accessToken) fetchFriends();
  }, [accessToken]);

  const handleSearch = (val: string) => {
    setQuery(val);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (val.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await apiFetch(`/search-users?q=${val}`, {}, accessToken);
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const addFriend = async (friendId: string) => {
    try {
      const response = await apiFetch('/add-friend', {
        method: 'POST',
        body: JSON.stringify({ friendId })
      }, accessToken);
      const data = await response.json();
      if (data.success) {
        setFriends([...friends, friendId]);
        toast.success('NETWORK_EXPANDED: FRIEND ADDED');
        if (onAdd) onAdd();
      }
    } catch (err) {
      toast.error('CONNECTION_FAILED');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" size={16} />
        <input 
          type="text"
          placeholder="SEARCH_BY_HANDLE_OR_EMAIL..."
          className="w-full bg-[#050505] border border-[#2a2e3a] p-3 pl-10 text-[11px] font-['Space_Mono'] text-ghost-white focus:outline-none focus:border-[#00ff41] transition-colors"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-[#00ff41] border-t-transparent animate-spin rounded-full" />
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {results.length > 0 ? (
          results.map((user) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={user.id}
              className="flex items-center justify-between p-3 bg-[#1e222d] border border-[#2a2e3a] hover:border-[#00ff41]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-none border border-[#2a2e3a]" />
                <div>
                  <p className="text-[11px] font-black text-ghost-white uppercase tracking-tight">{user.name}</p>
                  <p className="text-[9px] text-[#717182] lowercase">{user.email}</p>
                </div>
              </div>
              
              {friends.includes(user.id) ? (
                <div className="p-2 text-[#00ff41]">
                  <Check size={16} />
                </div>
              ) : (
                <button 
                  onClick={() => addFriend(user.id)}
                  className="p-2 text-[#717182] hover:text-[#00ff41] transition-colors"
                >
                  <UserPlus size={16} />
                </button>
              )}
            </motion.div>
          ))
        ) : query.length >= 1 && !loading ? (
          <div className="text-center py-8 text-[#717182]">
            <X size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-[10px] uppercase font-bold tracking-widest">NO_MATCHES_FOUND</p>
          </div>
        ) : (
          <div className="text-center py-8 text-[#717182]">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-[10px] uppercase font-bold tracking-widest">AWAITING_INPUT...</p>
          </div>
        )}
      </div>

      <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 p-3 flex gap-3 items-center">
        <Zap size={14} className="text-[#00ff41]" />
        <p className="text-[9px] text-[#00ff41] leading-tight uppercase font-bold">
          Note: Connections are public. Insider info sharing is strictly prohibited by terminal guidelines.
        </p>
      </div>
    </div>
  );
};
