import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Turntable } from '../../shared/components/Turntable';
import { usePlayback } from '@/shared/hooks/usePlayback';
import type { PlaybackControllerProps } from '../types';

export function PlaybackController({ 
  roomId, nowPlaying, upNext, activePlayer, onPlayerReady, onPlayerEnd 
}: PlaybackControllerProps) {
  const { isPlaying, setIsPlaying, progress } = usePlayback(nowPlaying);

  return (
    <section className="flex flex-col items-center gap-12 w-full">
      {/* Visual Turntable Section */}
      <div className="relative w-full flex justify-center py-12">
          {/* THE HIDDEN ACTUAL PLAYERS */}
          <div className="absolute opacity-0 pointer-events-none w-0 h-0">
             <div key="A" className={activePlayer === 'A' ? 'block' : 'hidden'}>
               {nowPlaying && activePlayer === 'A' ? (
                 <YouTube 
                    videoId={nowPlaying.youtubeId} 
                    opts={{ playerVars: { autoplay: 1, controls: 0 } }} 
                    onReady={onPlayerReady('A')} 
                    onEnd={onPlayerEnd} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                 />
               ) : null}
             </div>
             <div key="B" className={activePlayer === 'B' ? 'block' : 'hidden'}>
               {nowPlaying && activePlayer === 'B' ? (
                 <YouTube 
                    videoId={nowPlaying.youtubeId} 
                    opts={{ playerVars: { autoplay: 1, controls: 0 } }} 
                    onReady={onPlayerReady('B')} 
                    onEnd={onPlayerEnd} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                 />
               ) : null}
             </div>
             {upNext ? (
               <YouTube 
                  videoId={upNext.youtubeId} 
                  opts={{ playerVars: { autoplay: 0 } }} 
                  onReady={onPlayerReady(activePlayer === 'A' ? 'B' : 'A')} 
               />
             ) : null}
          </div>

          <Turntable isPlaying={isPlaying} progress={progress} />
      </div>

      {/* Info & Controls */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-normal text-[#F57923] uppercase">Room // {roomId}</span>
              <h3 className="text-7xl font-bebas text-[#39283f] leading-none uppercase tracking-tight">
                  {nowPlaying ? nowPlaying.title : "No songs playing"}
              </h3>
              <p className="text-xl font-bold text-[#39283f]/40 uppercase ">
                  {nowPlaying ? (nowPlaying.author || "Now playing") : "Queue empty"}
              </p>
          </div>

          <div className="flex items-center gap-8 mt-4">
              <Button 
                variant="outline"
                size="icon"
                onClick={onPlayerEnd}
                className="w-16 h-16 rounded-full border-2 border-[#39283f]/5 text-[#39283f]/30 hover:text-[#F57923] hover:border-[#F57923]/20 transition-all hover:scale-105"
              >
                  <SkipForward size={28} />
              </Button>
              <div className="px-6 py-2 bg-[#39283f] text-white text-[10px] font-bold tracking-normal uppercase rounded-full shadow-xl">
                  Live
              </div>
          </div>
      </div>
      
      {/* Up Next Preview */}
      <div className="w-full border-t border-[#39283f]/5 pt-8 mt-4">
          <div className="flex justify-between items-center px-4">
              <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold  text-[#39283f]/20 uppercase">Coming Up Next</span>
                  <p className="text-sm font-bold text-[#39283f] truncate max-w-[300px]">
                      {upNext?.title || "No sequence following..."}
                  </p>
              </div>
              <Badge className="bg-[#39283f] text-white border-none py-1.5 px-4 rounded-full font-bold text-[10px]  uppercase">
                  High Quality
              </Badge>
          </div>
      </div>

      <AnimatePresence>
        {!nowPlaying ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-3xl"
          >
            <div className="animate-spin mb-6">
              <Loader2 size={64} className="text-[#F57923]" />
            </div>
            <p className="text-[#39283f]/30 font-bold uppercase tracking-normal text-xs">Waiting for songs</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
