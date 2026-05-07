import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Search } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { SearchBar } from '@/shared/components/SearchBar';
import type { SongSearchProps } from '../types';

export function SongSearch({
  searchQuery,
  setSearchQuery,
  searchLoading,
  searchResults,
  suggestions,
  onSelectSuggestion,
  handleAddSong,
  submittingId
}: SongSearchProps) {
  return (
    <section className="flex flex-col gap-8 w-full max-w-3xl mx-auto h-[700px]">
      <div className="text-center space-y-2">
          <h4 className="text-sm font-bold tracking-normal text-orange-500 uppercase">Track Discovery</h4>
          <p className="text-sm font-bold text-black/40 uppercase">Find and add tracks to the broadcast</p>
      </div>

      <div className="relative">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="TYPE SONG TITLE..."
          loading={searchLoading}
          autoFocus
        />

        {/* Suggestions Overlay */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-0 right-0 bg-white border border-black/5 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSelectSuggestion(s)}
                  className="w-full text-left px-8 py-5 text-[17px] font-bold text-black/60 hover:bg-[#f8f8f7] hover:text-orange-500 transition-all flex items-center gap-4 border-b border-black/2 last:border-0"
                >
                  <Search size={16} className="text-black/10" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Area — Independently Scrollable */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
        <AnimatePresence mode="popLayout">
          {searchResults.map((song) => (
            <motion.article 
              key={song.youtubeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card variant="premium-list" className="flex items-center gap-6 group">
                 <div className="relative w-28 h-20 shrink-0 overflow-hidden rounded-2xl shadow-md">
                    <img src={song.thumbnail} className="w-full h-full object-cover" alt="" />
                 </div>
                 
                  <div className="flex-1 min-w-0">
                    <p className="text-[19px] font-bold text-black tracking-tight truncate mb-1">{song.title}</p>
                    <p className="text-[11px] font-bold text-black/30 uppercase tracking-widest">{song.author || 'YouTube Audio'}</p>
                  </div>

                 <Button 
                   onClick={() => handleAddSong(song)}
                   disabled={submittingId === song.youtubeId}
                   variant="premium"
                   className="h-16 w-16 px-0"
                 >
                   {submittingId === song.youtubeId ? (
                     <div className="animate-spin">
                       <Loader2 size={20} />
                     </div>
                   ) : <Plus size={28} />}
                 </Button>
              </Card>
            </motion.article>
          ))}
        </AnimatePresence>

        {searchResults.length === 0 && searchQuery.length > 2 && !searchLoading && suggestions.length === 0 ? (
           <div className="py-20 text-center opacity-10">
              <Search size={48} className="mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No matching tracks</p>
           </div>
        ) : null}
      </div>
    </section>
  );
}
