import { SecretDoor } from '@/shared/components/SecretDoor';
import { Link } from '@tanstack/react-router';
import logoUrl from '@/assets/logo.svg';

import type { DashboardHeaderProps } from '../types';

export function DashboardHeader({ roomId, connected }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-black/3 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="relative z-10 flex items-center gap-3 group transition-transform hover:scale-105 pointer-events-auto">
              <img src={logoUrl} alt="Logo" className="h-8 w-8 drop-shadow-lg" />
              <div className="flex flex-col">
                <span className="text-black font-bold tracking-tighter text-lg leading-none">PLAYMUSIC</span>
                <span className="text-[8px] text-orange-500 font-bold uppercase tracking-normal">Dashboard</span>
              </div>
            </Link>
            <div className="h-8 w-px bg-black/10 mx-2" />
            <SecretDoor roomId={roomId} />
            <span className="text-white px-3 py-1 bg-orange-500 rounded-lg text-[10px] uppercase tracking-normal font-bold">Live Control</span>
          </div>

         <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[11px] font-bold text-black/60 uppercase ">
                {connected ? 'Connected' : 'Reconnecting...'}
              </span>
           </div>
           
           <div className="h-6 w-px bg-black/5" />

           <Link 
             to="/"
             className="px-5 py-2 bg-black hover:bg-orange-500 text-white text-[10px] tracking-normal uppercase rounded-lg transition-all active:scale-95 shadow-lg shadow-black/10 font-bold"
           >
             EXIT
           </Link>
         </div>
      </div>
    </header>
  );
}
