import { useEffect } from "react";
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home } from 'lucide-react';
import { Button } from '../shared/components/button';
import { SecretDoor } from '../shared/components/SecretDoor';
import { MusicRoomView } from '../features/shared/components/MusicRoomView';
import { useMusicRoomPage } from '../hooks/pages/useMusicRoomPage';

export function MusicRoom() {
  const { roomId, nowPlaying, queue, isPlaying, progress } = useMusicRoomPage();

  useEffect(() => {
    document.title = `${roomId.toUpperCase()} // Active Broadcast`;
  }, [roomId]);

  return (
    <div className="h-screen bg-white text-black font-poppins overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <header className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
            <div className="flex items-center gap-6">
               <SecretDoor size="xl" />
               <div className="flex flex-col">
                  <span className="font-bebas text-4xl tracking-tighter text-black leading-none uppercase">PLAY LIST</span>
                  <span className="text-[9px] text-black/20 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                    Room // {roomId.toUpperCase()}
                  </span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-4 bg-black/5 backdrop-blur-sm px-6 py-2.5 rounded-full border border-black/5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">Live</h2>
               </div>
               <Link to="/" className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-black/40 hover:text-black transition-colors">
                  <Home size={18} />
               </Link>
            </div>
        </header>

        <main className="flex-1 flex items-center justify-center w-full px-6 pt-12 overflow-hidden">
            <MusicRoomView 
              roomId={roomId}
              nowPlaying={nowPlaying}
              queue={queue}
              isPlaying={isPlaying}
              progress={progress}
              role="participant"
            />
        </main>

        {/* Empty State Overlay */}
        <AnimatePresence>
            {!nowPlaying && (
                <motion.section 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center p-12 text-center"
                >
                    <div className="max-w-xl space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-8xl font-bebas tracking-tighter text-black leading-none uppercase">No music playing</h2>
                            <p className="text-black/40 text-sm font-bold uppercase tracking-widest italic">Waiting for the admin to play a song</p>
                        </div>
                        <Button asChild variant="premium" className="px-12 h-16 rounded-3xl">
                            <Link to="/r/$roomId/request" params={{ roomId }}>
                                Add a song <Plus size={20} className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    </div>
  );
}
