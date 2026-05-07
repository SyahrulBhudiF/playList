import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { ListMusic, Pencil, X, Check, Loader2, Play } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { Input } from '@/shared/components/input';

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
      <div className="flex items-center justify-between px-8 py-2">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-lg font-bold text-black tracking-tight">Pending Requests</h4>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500/80 rounded-full" />
              <p className="text-[11px] font-medium text-black/40 uppercase tracking-widest leading-none">Songs to approve</p>
            </div>
          </div>
          <div className="bg-black/5 text-black/50 px-5 py-2 rounded-full font-bold text-[12px] tracking-widest border border-black/5">
            {pendingQueue.length.toString().padStart(2, '0')} WAITING
          </div>
      </div>

      <div className="flex flex-col space-y-4 overflow-y-auto max-h-[700px] no-scrollbar py-4 px-2">
          <AnimatePresence mode="popLayout">
            {pendingQueue.map((song, index) => (
              <motion.article 
                key={song.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                <Card variant="premium-list" className="p-6 flex items-center gap-6">
                  {/* index */}
                  <span className="text-[10px] font-bold text-black/10 w-4 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>

                  {/* thumb */}
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-black/5 rounded-xl group">
                    <img src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setPreviewId(previewId === song.youtubeId ? null : song.youtubeId)}
                        className="text-white hover:bg-white/20"
                      >
                        {previewId === song.youtubeId ? <X size={20} /> : <Play className="fill-current" size={20} />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* info */}
                  <div className="flex-1 min-w-0">
                    {editingId === song.id ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          className="h-10 bg-black/5 border-none rounded-lg text-sm font-bold text-black"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(song.id)} className="h-10 w-10 text-green-600">
                          <Check size={20} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h5 className="text-[15px] font-bold text-black tracking-normal truncate leading-tight font-poppins">{song.title}</h5>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEditing(song)} 
                            className="opacity-0 group-hover:opacity-100 text-black/20 hover:text-orange-500 h-6 w-6"
                          >
                            <Pencil size={12} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{song.author}</span>
                           <div className="w-1 h-1 rounded-full bg-black/10" />
                           <span className="text-[10px] font-medium text-orange-500/50 uppercase">requested by {song.submittedBy.slice(0, 8)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                     <Button 
                       size="icon"
                       onClick={() => handleApprove(song.id)} 
                       disabled={processingId === song.id}
                       variant="premium-success"
                       className="h-12 w-12 rounded-2xl hover:scale-110 transition-transform active:scale-90"
                     >
                       {processingId === song.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={22} strokeWidth={3} />}
                     </Button>
                     <Button 
                       size="icon" 
                       variant="premium-danger" 
                       onClick={() => handleDelete(song.id)} 
                       className="h-12 w-12 rounded-2xl hover:scale-110 transition-transform active:scale-90"
                     >
                       <X size={22} strokeWidth={3} />
                     </Button>
                  </div>
                </Card>

                {/* VISIBLE PREVIEW PLAYER */}
                <AnimatePresence>
                  {previewId === song.youtubeId && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/5 rounded-2xl mt-2 p-4"
                    >
                      <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
                        <YouTube 
                          videoId={song.youtubeId} 
                          opts={{ 
                            width: '100%', 
                            height: '100%', 
                            playerVars: { autoplay: 1 } 
                          }} 
                        />
                      </div>
                      <p className="text-[10px] font-bold text-center mt-3 text-black/30 uppercase tracking-widest">
                        Previewing track (Private to admin)
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </AnimatePresence>

          {pendingQueue.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center bg-black/1 border-2 border-dashed border-black/5 rounded-4xl m-4">
              <ListMusic size={40} className="text-black/5 mb-4" />
              <p className="text-[11px] font-bold tracking-widest text-black/20 uppercase">Your queue is empty</p>
            </div>
          ) : null}
      </div>
    </section>
  );
}
