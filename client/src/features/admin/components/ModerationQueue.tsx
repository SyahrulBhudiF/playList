import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { ListMusic, Pencil, X, Check, Loader2, Play } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Badge } from '@/shared/components/badge';

import type { ModerationQueueProps } from '../types';

export function ModerationQueue({
  pendingQueue,
  processingId,
  editingId,
  editValue,
  setEditValue,
  handleApprove,
  handleDelete,
  startEditing,
  handleSaveEdit,
}: ModerationQueueProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-10 w-full">
      <div className="flex items-center justify-between px-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold tracking-normal text-[#F57923] uppercase">Pending Requests</h4>
            <p className="text-xs font-bold text-[#39283f]/30 uppercase ">Review and approve new songs</p>
          </div>
          <Badge className="bg-[#39283f] text-white border-none px-5 py-2.5 rounded-full font-bold text-xs ">
            {pendingQueue.length} PENDING
          </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {pendingQueue.map((song) => (
              <motion.article 
                key={song.id} 
                layout 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <div className={`p-6 bg-white border-2 rounded-4xl flex items-center gap-6 transition-all shadow-sm ${previewId === song.youtubeId ? 'border-[#F57923] shadow-xl' : 'border-[#39283f]/5 hover:border-[#39283f]/10'}`}>
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-3xl shadow-lg">
                    <img src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover" alt="" />
                    <button 
                      onClick={() => setPreviewId(previewId === song.youtubeId ? null : song.youtubeId)}
                      className={`absolute inset-0 flex items-center justify-center bg-[#39283f]/80 backdrop-blur-sm transition-opacity ${previewId === song.youtubeId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      {previewId === song.youtubeId ? <X className="text-white" size={24} /> : <Play className="text-white fill-current translate-x-0.5" size={24} />}
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0 py-2">
                    {editingId === song.id ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          className="h-10 bg-[#39283f]/5 border-none rounded-xl text-sm font-bold text-[#39283f]"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(song.id)} className="h-10 w-10 text-green-600">
                          <Check size={20} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h5 className="text-[18px] font-bold text-[#39283f] truncate leading-tight">{song.title}</h5>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEditing(song)} 
                            className="opacity-0 group-hover:opacity-100 text-[#39283f]/20 hover:text-[#F57923] h-8 w-8"
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>
                        <p className="text-[11px] font-bold  text-[#F57923]/60 uppercase">Requested by {song.submittedBy.slice(0, 8)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 shrink-0">
                     <Button 
                       onClick={() => handleApprove(song.id)} 
                       disabled={processingId === song.id}
                       className="h-14 px-8 rounded-2xl bg-[#39283f] hover:bg-[#F57923] text-white font-bold text-xs tracking-normal shadow-lg transition-all active:scale-95"
                     >
                       {processingId === song.id ? (
                         <div className="animate-spin">
                           <Loader2 size={16} />
                         </div>
                       ) : "APPROVE"}
                     </Button>
                     <Button 
                       size="icon" 
                       variant="ghost" 
                       onClick={() => handleDelete(song.id)} 
                       className="h-14 w-14 rounded-2xl border-2 border-[#39283f]/5 text-[#39283f]/20 hover:text-red-500 hover:border-red-500/10 transition-all"
                     >
                       <X size={24} />
                     </Button>
                  </div>
                </div>

                {/* HIDDEN PREVIEW PLAYER */}
                {previewId === song.youtubeId ? (
                  <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                     <YouTube videoId={song.youtubeId} opts={{ playerVars: { autoplay: 1 } }} />
                  </div>
                ) : null}
              </motion.article>
            ))}
          </AnimatePresence>

          {pendingQueue.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center border-4 border-dashed border-[#39283f]/5 rounded-[3rem]">
              <ListMusic size={64} className="text-[#39283f]/10 mb-6" />
              <p className="text-sm font-bold tracking-normal text-[#39283f]/20 uppercase">Queue is empty</p>
            </div>
          ) : null}
      </div>
    </section>
  );
}
