import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import logoUrl from '@/assets/logo.svg';
import { KeyRound, ArrowRight, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

export function SecretDoor({ roomId }: { roomId: string }) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPortal, setShowPortal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(false);
  
  const timerRef = useRef<any>(null);
  const navigate = useNavigate();

  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    if (isHolding) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(elapsed / HOLD_DURATION, 1);
        setProgress(newProgress);

        if (newProgress >= 1) {
          clearInterval(timerRef.current);
          setIsHolding(false);
          setShowPortal(true);
        }
      }, 50);
    } else {
      clearInterval(timerRef.current);
      setProgress(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isHolding]);

  const handleVerify = () => {
    if (passcode.toUpperCase() === 'PLAY') {
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <>
      {/* The Secret Logo Trigger */}
      <section className="relative group cursor-pointer">
        <motion.div
          onPointerDown={() => setIsHolding(true)}
          onPointerUp={() => setIsHolding(false)}
          onPointerLeave={() => setIsHolding(false)}
          animate={isHolding ? { scale: 0.95 } : { scale: 1 }}
          className="relative z-10"
        >
          <img src={logoUrl} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 drop-shadow-2xl" />
        </motion.div>

        {/* Charging Ring */}
      <AnimatePresence>
        {isHolding ? (
          <svg className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-20 h-20 md:w-24 md:h-24 pointer-events-none overflow-visible">
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-orange-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="100"
              strokeDashoffset={100 - (progress * 100)}
              className="text-orange-500"
              style={{ pathLength: progress }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="50%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-orange-500/20"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </svg>
        ) : null}
      </AnimatePresence>
    </section>

    {/* Secret Portal Modal */}
    <AnimatePresence mode="wait">
      {showPortal ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-groovy-deep/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPortal(false)}
            className="absolute inset-0 bg-[#39283f]/60 backdrop-blur-2xl"
          />
          
          <motion.article
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-linear-to-tr from-[#39283f] via-[#4a2e4d] to-[#39283f] rounded-[3rem] p-10 shadow-2xl border border-white/5 overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 p-8 opacity-[0.05] rotate-12">
               <ShieldAlert size={200} className="text-[#39283f]" />
            </div>

             {!isAuthorized ? (
              <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-linear-to-tr from-[#F57923] to-[#FDB017] rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(245,121,35,0.3)]">
                     <KeyRound className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Admin Access</h2>
                    <p className="text-white/40 text-xs font-bold uppercase  mt-1">Enter your passcode</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      autoFocus
                      type="text"
                      placeholder="Enter Key"
                      value={passcode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasscode(e.target.value.toUpperCase())}
                      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleVerify()}
                      className={`h-16 bg-white/5 border-2 border-transparent rounded-2xl text-center text-xl font-bold  focus-visible:ring-0 focus-visible:border-[#F57923] transition-all placeholder:text-white/20 text-white ${error ? 'animate-shake border-red-500' : ''}`}
                    />
                  </div>
                  <Button 
                    onClick={handleVerify}
                    className="w-full h-16 bg-white hover:bg-white/90 text-[#39283f] font-bold text-sm tracking-wide rounded-2xl group transition-all shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
                  >
                    Authenticate <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 relative z-10">
                 <div className="space-y-4">
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(34,197,94,0.2)]">
                     <ShieldAlert className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Access Granted</h2>
                    <p className="text-white/40 text-xs font-bold uppercase  mt-1">Admin features enabled</p>
                  </div>
                </div>

                 <div className="space-y-4">
                  <Button 
                     onClick={() => { setShowPortal(false); navigate({ to: `/admin/${roomId}` }); }}
                     className="w-full h-24 bg-white/5 border-2 border-white/5 hover:border-white/10 hover:bg-white/10 justify-start px-8 rounded-2xl gap-6 group transition-all"
                  >
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:bg-groovy-secondary hover:text-white transition-all active:scale-90">
                        <LayoutDashboard size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-[15px] font-bold text-white leading-none mb-1.5">Admin Dashboard</p>
                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-tight">Manage room and tracks</p>
                     </div>
                  </Button>
                </div>
              </div>
            )}
          </motion.article>
        </div>
      ) : null}
    </AnimatePresence>
    </>
  );
}
