import { Music, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import type { SearchResult } from '@/shared/types';

interface ResultCardProps {
  song: SearchResult;
  onSelect: (song: SearchResult) => void;
  isSubmitting: boolean;
}

export function ResultCard({ song, onSelect, isSubmitting }: ResultCardProps) {
  return (
    <Card variant="premium-list" className="p-4 flex items-center justify-between group rounded-2xl border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden">
          {song.thumbnail ? (
            <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music size={20} className="text-black/20" />
          )}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm text-black line-clamp-1">{song.title}</h4>
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">{song.author}</p>
        </div>
      </div>
      <Button 
        onClick={() => onSelect(song)}
        disabled={isSubmitting}
        variant="outline"
        className="rounded-full h-10 w-10 p-0 border-black/10 hover:bg-black hover:text-white transition-colors"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Plus size={18} />
        )}
      </Button>
    </Card>
  );
}
