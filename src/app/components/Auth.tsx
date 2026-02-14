import React, { useState, useEffect } from 'react';
import { supabase } from '/src/utils/supabase/client';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Zap, ShieldCheck, Mail, Lock, User, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export const Auth: React.FC<{ onAuth: (session: any) => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [pendingSession, setPendingSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        // Show calibration before proceeding
        setPendingSession(data.session);
        setShowCalibration(true);
      } else {
        // Use our server route for admin signup (auto-confirm)
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c0ec1358/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        // After signup, automatically log them in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        // Show calibration before proceeding
        setPendingSession(data.session);
        setShowCalibration(true);
      }
    } catch (err: any) {
      toast.error(`ERROR: ${err.message}`);
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCalibration) {
      const interval = setInterval(() => {
        setCalibrationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onAuth(pendingSession);
              toast.success(isLogin ? 'DECRYPTED: ACCESS GRANTED' : 'TERMINAL_ID_CREATED: WELCOME TO THE ARBITRAGE');
            }, 800);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showCalibration, pendingSession, onAuth, isLogin]);

  if (showCalibration) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center p-4 font-['Space_Mono'] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="h-full w-full bg-[radial-gradient(#00ff41_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8 text-center relative z-10"
        >
          <div className="relative w-32 h-32 mx-auto">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-[#00ff41]/30 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-[#00ff41]/50 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu size={40} className="text-[#00ff41] animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-['Oswald'] text-2xl font-black text-[#00ff41] uppercase italic tracking-tighter">Calibrating Intercepts</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-48 h-1 bg-[#1e222d] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calibrationProgress}%` }}
                  className="h-full bg-[#00ff41]"
                />
              </div>
              <span className="text-[10px] font-bold text-[#00ff41] min-w-[30px]">{calibrationProgress}%</span>
            </div>
            <p className="text-[8px] text-[#717182] uppercase tracking-[0.4em] mt-4">Syncing with Gossip Order Book...</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
            <div className="text-[8px] border border-[#2a2e3a] p-1 text-[#717182] text-left">
              [OK] SSL_SECURE_LINK
            </div>
            <div className="text-[8px] border border-[#2a2e3a] p-1 text-[#717182] text-left">
              [OK] VIBE_INDEX_BOOT
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505] font-['Space_Mono'] p-4">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="h-full w-full bg-[radial-gradient(#00ff41_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] bg-[#0a0b0d] border border-[#2a2e3a] relative z-10"
      >
        <div className="border-b border-[#2a2e3a] p-6 bg-[#1e222d]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#00ff41] flex items-center justify-center">
              <Zap size={24} color="#050505" />
            </div>
            <div>
              <h1 className="font-['Oswald'] text-2xl font-black text-ghost-white tracking-tighter leading-none">
                LOVE ARBITRAGE
              </h1>
              <p className="text-[10px] text-[#00ff41] font-bold tracking-[0.3em]">RELATIONSHIP_TERMINAL_v4.0</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] text-[#717182] uppercase font-bold">Terminal Handle</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" size={16} />
                <input 
                  required
                  type="text"
                  placeholder="USERNAME_ID"
                  className="w-full bg-[#050505] border border-[#2a2e3a] p-3 pl-10 text-ghost-white focus:outline-none focus:border-[#00ff41] transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] text-[#717182] uppercase font-bold">Secure Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" size={16} />
              <input 
                required
                type="email"
                placeholder="USER@NETWORK.INT"
                className="w-full bg-[#050505] border border-[#2a2e3a] p-3 pl-10 text-ghost-white focus:outline-none focus:border-[#00ff41] transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#717182] uppercase font-bold">Passkey</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" size={16} />
              <input 
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-[#2a2e3a] p-3 pl-10 text-ghost-white focus:outline-none focus:border-[#00ff41] transition-colors"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-[#00ff41] text-[#050505] font-['Oswald'] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              <>
                {isLogin ? 'INITIALIZE_SESSION' : 'REGISTER_NODE'}
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-[10px] text-[#717182] uppercase hover:text-white transition-colors"
          >
            {isLogin ? "DON'T HAVE AN ACCESS KEY? REGISTER HERE" : "ALREADY REGISTERED? LOGIN TO TERMINAL"}
          </button>
        </form>

        <div className="border-t border-[#2a2e3a] p-4 bg-[#1e222d] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#00ff41]" />
            <span className="text-[8px] text-[#717182] font-bold">ENCRYPTED_ENDPOINT: v1.0.42</span>
          </div>
          <span className="text-[8px] text-[#00ff41] font-black italic">BY_LOVE_ARBITRAGE_LABS</span>
        </div>
      </motion.div>
    </div>
  );
};
