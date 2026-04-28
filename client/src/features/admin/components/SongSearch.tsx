import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import type { SongSearchProps } from '../types';

export function SongSearch({
  searchQuery,
  setSearchQuery,
  searchLoading,
  searchResults,
  handleAddSong,
  submittingId
}: SongSearchProps) {
  return (
    <section className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-2">
          <h4 className="text-sm font-bold tracking-normal text-[#F57923] uppercase">Find Tracks</h4>
          <p className="text-sm font-bold text-[#39283f]/60 uppercase ">Add songs to the music room</p>
      </div>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#39283f]/40 group-focus-within:text-[#F57923] transition-colors">
          {searchLoading ? (
            <div className="animate-spin">
              <Loader2 size={24} />
            </div>
          ) : <Search size={24} />}
        </div>
        <Input 
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="SEARCH SONGS"
          className="bg-white border-2 border-[#39283f]/10 rounded-4xl h-20 pl-16 pr-8 focus-visible:ring-0 focus-visible:border-[#F57923] text-black font-bold  shadow-sm transition-all text-lg placeholder:text-[#39283f]/40"
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {searchResults.map((song) => (
            <motion.article 
              key={song.youtubeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-6 p-4 bg-white border-2 border-[#39283f]/5 rounded-4xl hover:border-[#F57923]/30 hover:shadow-xl transition-all group">
                 <div className="relative w-24 h-16 shrink-0 overflow-hidden rounded-2xl shadow-md">
                    <img src={song.thumbnail} className="w-full h-full object-cover" alt="" />
                 </div>
                 
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-[#39283f] truncate mb-1">{song.title}</p>
                    <p className="text-[11px] font-bold  text-[#39283f]/40 uppercase">Source: YouTube</p>
                  </div>

                 <Button 
                   onClick={() => handleAddSong(song)}
                   disabled={submittingId === song.youtubeId}
                   className="h-14 w-14 rounded-2xl bg-[#39283f] text-white hover:bg-[#F57923] shadow-lg transition-all active:scale-95"
                 >
                   {submittingId === song.youtubeId ? (
                     <div className="animate-spin">
                       <Loader2 size={18} />
                     </div>
                   ) : <Plus size={24} />}
                 </Button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {searchResults.length === 0 && searchQuery.length > 2 && !searchLoading ? (
           <div className="py-20 text-center opacity-10">
              <Search size={48} className="mx-auto mb-4" />
              <p className="text-xs font-bold  uppercase">No results found</p>
           </div>
        ) : null}
      </div>
    </section>
  );
}
