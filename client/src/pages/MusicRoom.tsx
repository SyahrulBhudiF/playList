import { useParams, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicRoom } from '../features/participant/hooks/useMusicRoom';
import { usePlayback } from '../shared/hooks/usePlayback';
import { Music, Plus } from 'lucide-react';

// Shared Components
import { Turntable } from '../features/shared/components/Turntable';
import { Visualizer } from '../features/shared/components/Visualizer';

// Feature Components
import { TrackMetadata } from '../features/music-room/components/TrackMetadata';
import { LyricsDisplay } from '../features/music-room/components/LyricsDisplay';
import { StationSequence } from '../features/music-room/components/StationSequence';
import { Heart, Share2 } from 'lucide-react';

export function MusicRoom() {
  const { roomId } = useParams({ from: '/r/$roomId' }) as { roomId: string };
  const { nowPlaying, queue } = useMusicRoom(roomId);
  const { isPlaying, setIsPlaying, progress } = usePlayback(nowPlaying);

  return (
    <div className="h-screen w-screen bg-white text-black font-poppins overflow-hidden flex flex-col relative selection:bg-orange-500 selection:text-white">
        
        {/* Minimal Header */}
        <header className="absolute top-10 left-10 right-10 flex justify-between items-center z-50">
            <div className="flex items-center gap-4 px-6 py-3">
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
               <h2 className="text-xs font-bold  text-black/20 uppercase font-poppins italic">Room // {roomId.toUpperCase()}</h2>
            </div>
        </header>

        {/* MAIN COMPOSITION */}
        <div className="flex-1 flex items-center justify-center w-full px-12">
            <main className="w-full flex items-center justify-center gap-16 max-w-[1800px] h-[80vh]">
                
                {/* LEFT SECTION: Metadata & Lyrics */}
                <section className="flex-1 flex flex-col justify-center max-w-sm">
                    <TrackMetadata track={nowPlaying} />
                    <LyricsDisplay />
                </section>

                {/* CENTRAL TURNTABLE SECTION */}
                <section className="flex-[1.5] h-full flex flex-col items-center justify-center min-w-[600px]">
                    <figure className="w-[500px] h-[500px] flex items-center justify-center relative scale-125">
                        <Turntable 
                            isPlaying={isPlaying} 
                            onToggle={() => setIsPlaying(!isPlaying)} 
                            progress={progress} 
                        />
                    </figure>

                    {/* Turntable Specific Controls */}
                    <nav className="flex items-center gap-8 mt-24 bg-white/40 backdrop-blur-md px-10 py-5 rounded-full border border-black/3 shadow-sm">
                        <button className="text-black/20 hover:text-orange-500 transition-colors">
                            <Heart size={22} strokeWidth={1.5} />
                        </button>
                        <div className="h-4 w-px bg-black/10" />
                        <span className="text-[10px] font-bold  text-black/20 uppercase">Repeat // OFF</span>
                        <div className="h-4 w-px bg-black/10" />
                        <button className="text-black/20 hover:text-orange-500 transition-colors">
                            <Share2 size={22} strokeWidth={1.5} />
                        </button>
                    </nav>
                </section>

                {/* RIGHT SECTION: Sequence Queue */}
                <StationSequence queue={queue} roomId={roomId} />
            </main>
        </div>

        {/* BACKGROUND VISUALIZER */}
        <Visualizer isPlaying={isPlaying} />

        {/* EMPTY STATE OVERLAY (EDITORIAL FLAT STYLE) */}
        <AnimatePresence>
            {!nowPlaying && (
                <motion.section 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 bg-white flex flex-col items-center justify-between p-20 text-black"
                >
                    {/* Top Technical Metadata */}
                    <div className="w-full flex justify-between items-start opacity-40">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold  uppercase font-poppins transition-all">Room ID // {roomId.toUpperCase()}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold  uppercase font-poppins">Status // AWAITING</p>
                        </div>
                    </div>

                    {/* Central Minimal Composition */}
                    <div className="flex flex-col items-center space-y-12">
                        <div className="relative">
                            <motion.div 
                                initial={{ opacity: 0, rotate: 0 }}
                                animate={{ opacity: 1, rotate: 45 }}
                                className="absolute -inset-24 flex items-center justify-center pointer-events-none"
                            >
                                <div className="w-px h-[300px] bg-black/5 rotate-45" />
                                <div className="w-px h-[300px] bg-black/5 -rotate-45" />
                            </motion.div>
                            <div className="relative w-40 h-40 border border-black/10 flex items-center justify-center">
                                <Music size={40} strokeWidth={1} className="text-black/20" />
                            </div>
                        </div>

                        <div className="text-center space-y-6">
                            <h1 className="text-[10vw] font-bebas tracking-tight leading-none uppercase">
                                No Music Playing
                            </h1>
                            <div className="flex items-center justify-center gap-10">
                                <div className="h-[2px] w-20 bg-orange-500" />
                                <span className="text-[12px] font-bold  text-black/40 uppercase">Waiting for your request</span>
                                <div className="h-[2px] w-20 bg-orange-500" />
                            </div>
                        </div>

                        <Link 
                            to="/r/$roomId/request"
                            params={{ roomId }}
                            className="group flex flex-col items-center gap-4 py-8 px-12 border border-black/10 hover:border-black transition-all"
                        >
                            <span className="text-[11px] font-bold  text-black/40 group-hover:text-black uppercase transition-colors">Request a song</span>
                            <Plus size={20} strokeWidth={2} className="text-orange-500 group-hover:scale-125 transition-transform" />
                        </Link>
                    </div>

                    {/* Bottom Technical Grid */}
                    <div className="w-full flex justify-center opacity-20">
                        <div className="flex gap-20">
                            {['STEREO', '33_RPM', 'HI_FI', 'DIRECT_SIGNAL'].map((tag) => (
                                <span key={tag} className="text-[10px] font-bold  uppercase font-poppins">{tag}</span>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    </div>
  );
}


