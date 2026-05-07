import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2 } from 'lucide-react';
import { Turntable } from './Turntable';
import { TrackMetadata } from '@/features/music-room/components/TrackMetadata';
import { StationSequence } from '@/features/music-room/components/StationSequence';
import type { Track } from '@/shared/types';

interface MusicRoomViewProps {
  roomId: string;
  nowPlaying: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  role: 'admin' | 'participant';
  onSkip?: () => void;
  onTogglePlay?: () => void;
}

export function MusicRoomView({
  roomId,
  nowPlaying,
  queue,
  isPlaying,
  progress,
  role,
  onSkip,
  onTogglePlay
}: MusicRoomViewProps) {
  const isAdmin = role === 'admin';

  return (
    <div className="w-full h-full flex items-center justify-center gap-8 px-8 overflow-hidden">
      
      {/* LEFT SECTION: Metadata & Lyrics */}
      <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center w-[350px] xl:w-[450px] shrink-0 h-full"
      >
          <div className="flex flex-col justify-center space-y-8 h-full">
            <TrackMetadata track={nowPlaying} />
            
            <div className="overflow-hidden">
               <AnimatePresence mode="wait">
                  {nowPlaying ? (
                    <motion.div
                      key={nowPlaying.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <p className="text-xl font-bold text-black/10 leading-relaxed uppercase tracking-tighter transition-colors">
                        {nowPlaying.author}
                      </p>
                      <p className="text-2xl font-bold text-black/40 leading-relaxed uppercase tracking-tight">
                        Currently Playing: {nowPlaying.title.toUpperCase()}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="h-6 w-48 bg-black/5 rounded animate-pulse" />
                      <p className="text-2xl font-bold text-black/20 uppercase tracking-tighter">
                        The queue is empty.
                      </p>
                    </div>
                  )}
               </AnimatePresence>
            </div>
          </div>
      </motion.section>

      {/* CENTRAL TURNTABLE SECTION */}
      <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex-1 h-full flex flex-col items-center justify-center min-w-[500px] max-w-[800px]"
      >
          <div className="flex items-center justify-center w-full gap-32">
            {/* Left skip arrow */}
            <button 
              onClick={isAdmin ? onTogglePlay : undefined}
              className={`text-black/20 transition-colors shrink-0 ${isAdmin ? 'hover:text-black cursor-pointer' : 'opacity-0 pointer-events-none'}`}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="4" x2="5" y2="20"/>
              </svg>
            </button>

            <figure className="w-[800px] h-[800px] flex items-center justify-center relative">
                <Turntable 
                    isPlaying={isPlaying} 
                    progress={progress} 
                    thumbnail={nowPlaying?.thumbnail}
                    onToggle={onTogglePlay}
                />
            </figure>

            {/* Right skip arrow */}
            <button 
              onClick={isAdmin ? onSkip : undefined}
              className={`text-black/20 transition-colors shrink-0 ${isAdmin ? 'hover:text-black cursor-pointer' : 'opacity-0 pointer-events-none'}`}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20"/>
              </svg>
            </button>
          </div>

          {/* Status row below turntable */}
          <div className="flex items-center gap-10 mt-10">
              {isAdmin ? (
                <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">Status // {isPlaying ? 'Live' : 'Idle'}</span>
              ) : (
                <nav className="flex items-center gap-10">
                    <button className="text-black/20 hover:text-orange-500 transition-colors">
                        <Heart size={24} strokeWidth={1.5} />
                    </button>
                    <div className="h-6 w-px bg-black/10" />
                    <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">Status // {isPlaying ? 'Live' : 'Idle'}</span>
                    <div className="h-6 w-px bg-black/10" />
                    <button className="text-black/20 hover:text-orange-500 transition-colors">
                        <Share2 size={24} strokeWidth={1.5} />
                    </button>
                </nav>
              )}
          </div>
      </motion.section>

      {/* RIGHT SECTION: Sequence Queue */}
      <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex shrink-0 flex-col justify-center h-full w-[350px] xl:w-[450px]"
      >
          <StationSequence queue={queue} roomId={roomId} />
      </motion.div>

    </div>
  );
}
