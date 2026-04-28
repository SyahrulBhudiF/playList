import { useParams, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Play, Music, Radio } from 'lucide-react';
import { Input } from '@/shared/components/input';
import { Button } from '@/shared/components/button';
import { useParticipant } from '../features/participant/hooks/useParticipant';

export function ParticipantPage() {
  const { roomId } = useParams({ from: '/r/$roomId/request' }) as { roomId: string };
  
  const {
    query,
    setQuery,
    results,
    loading,
    submitting,
    statusMsg,
    handleSelect
  } = useParticipant(roomId);

  const vibes = ['Chill', 'Hype', 'Focus', 'Throwback', 'R&B', 'Lo-Fi'];
  const trending = ['Drake', 'SZA', 'The Weeknd', 'Frank Ocean', 'Kendrick Lamar'];

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-[#1a101c] font-poppins p-6 md:px-12 md:py-8 overflow-hidden relative">
      
      {/* Background Decor: Ripples */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03]">
          <div className="w-[400px] h-[400px] border border-black rounded-full" />
          <div className="absolute w-[600px] h-[600px] border border-black rounded-full" />
          <div className="absolute w-[800px] h-[800px] border border-black rounded-full" />
          <div className="absolute w-[1000px] h-[1000px] border border-black rounded-full" />
      </div>

      {/* Header Area REMOVED DUPLICATE LOGO (SecretDoor in ParticipantLayout covers it) */}
      <header className="flex justify-end items-center mb-16 relative z-20">
        <div className="hidden md:flex items-center gap-4 bg-white/50 backdrop-blur-sm border border-black/5 rounded-full px-5 py-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]" />
            <span className="text-[12px] font-bold tracking-normal text-black/60 uppercase">Room: {roomId.toUpperCase()}</span>
        </div>
      </header>

      {/* Wave Search Visualizer (Oscilloscope Style) */}
      <div className="absolute top-48 left-0 right-0 h-32 pointer-events-none z-10 overflow-hidden opacity-20">
          <svg viewBox="0 0 1440 120" className="w-full h-full">
              <motion.path 
                  d="M0 60 Q 360 10, 720 60 T 1440 60"
                  fill="none"
                  stroke="#F57923"
                  strokeWidth="1.5"
                  animate={{
                      d: [
                          "M0 60 Q 360 10, 720 60 T 1440 60",
                          "M0 60 Q 360 110, 720 60 T 1440 60",
                          "M0 60 Q 360 10, 720 60 T 1440 60"
                      ]
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
              <motion.path 
                  d="M0 60 Q 360 40, 720 60 T 1440 60"
                  fill="none"
                  stroke="#F57923"
                  strokeWidth="0.5"
                  animate={{
                      d: [
                          "M0 60 Q 360 80, 720 60 T 1440 60",
                          "M0 60 Q 360 40, 720 60 T 1440 60",
                          "M0 60 Q 360 80, 720 60 T 1440 60"
                      ]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
              />
          </svg>
      </div>

      <main className="max-w-6xl mx-auto w-full relative z-20 flex flex-col items-center">
        
        {/* Compact Editorial Header */}
        <div className="mb-20 text-center">
            <motion.h1 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-7xl font-bebas tracking-tight text-black mb-4 uppercase"
            >
                Search your vibe
            </motion.h1>
            <p className="text-black/40 text-[14px] font-bold tracking-widest uppercase font-poppins">Broadcast Sound Archive</p>
        </div>

        {/* Rounded Modern Search Bar */}
        <div className="w-full relative group mb-24 max-w-2xl mx-auto">
            <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tracks..."
                className="w-full bg-white/80 backdrop-blur-xl border border-black/5 rounded-full h-18 pl-10 pr-16 text-xl focus:ring-0 focus:border-orange-500/50 transition-all shadow-sm focus:shadow-2xl focus:shadow-orange-500/5 font-bold font-poppins placeholder:text-black/10"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {loading ? (
                  <div className="animate-spin text-orange-500">
                    <Loader2 size={24} />
                  </div>
                ) : <Search size={22} className="text-black/20 group-focus-within:text-orange-500 transition-colors" />}
            </div>
        </div>

        {/* CONDITIONAL SECTION: VIBES OR RESULTS */}
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!query ? (
                    <motion.section 
                        key="vibes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full space-y-10 mb-16"
                    >
                        <div className="flex flex-col items-center">
                            <h2 className="text-[12px] font-bold tracking-normal uppercase text-black/60 mb-6">Or pick a vibe</h2>
                            <div className="flex flex-wrap justify-center gap-4">
                                {vibes.map((v) => (
                                    <Button 
                                        key={v}
                                        variant="outline"
                                        onClick={() => setQuery(v)}
                                        className="px-8 py-3 bg-white border border-black/10 rounded-full text-[14px] font-bold text-black/60 hover:text-black hover:border-black hover:shadow-md transition-all uppercase font-poppins"
                                    >
                                        {v}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h2 className="text-[12px] font-bold tracking-normal uppercase text-black/60 mb-6">Popular here</h2>
                            <div className="flex flex-wrap justify-center gap-3">
                                {trending.map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setQuery(t)}
                                        className="px-8 py-3 bg-white border border-black/10 rounded-full text-[14px] font-bold text-black/60 hover:text-black hover:border-black hover:shadow-md transition-all uppercase "
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section 
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-2xl px-0"
                    >
                        <div className="flex flex-col border-t border-black/5 pb-32">
                            {results.map((song, index) => (
                                <motion.article
                                    key={song.youtubeId}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleSelect(song)}
                                    className="group relative flex items-center gap-5 py-4 border-b border-black/5 cursor-pointer transition-all hover:bg-black/5"
                                >
                                    {/* Small Thumbnail */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/5">
                                        <img src={song.thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" alt="" />
                                    </div>

                                    {/* Song Info (Stacked) */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-bold text-black tracking-tight leading-snug truncate font-poppins">
                                            {song.title}
                                        </h4>
                                        <p className="text-[11px] font-bold text-black/30 uppercase tracking-widest mt-0.5 font-poppins">
                                            {song.author}
                                        </p>
                                    </div>

                                    {/* Action Icon (Simple Arrow/Plus) */}
                                    <div className="shrink-0 pr-4">
                                        <div className="text-black/20 group-hover:text-orange-500 transition-colors">
                                            {submitting === song.youtubeId ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : <Play size={14} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {!loading && results.length === 0 && query.length > 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                                <Music size={48} className="mb-4" />
                                <p className="text-xs font-bold tracking-normal uppercase">No songs found</p>
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
      </main>

      {/* Modern Status Toast */}
      <AnimatePresence>
        {statusMsg ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] border font-bold text-[13px]  uppercase z-50 flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-[#1a101c] text-white border-white/10' : 'bg-red-500 text-white border-red-400'}`}
          >
              <Radio size={14} className="animate-pulse" />
              {statusMsg.text}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navigation Pivot - Music Room */}
      <div className="fixed bottom-8 right-8 z-30">
          <Link 
            to="/r/$roomId" 
            params={{ roomId }}
            className="flex items-center gap-3 bg-[#1a101c] text-white px-6 py-3 rounded-full hover:bg-orange-500 transition-all shadow-2xl group"
          >
              <Music size={18} />
              <span className="text-[12px] font-bold uppercase ">Live Room</span>
          </Link>
      </div>
    </div>
  );
}
