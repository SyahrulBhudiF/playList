import { Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import type { StationSequenceProps } from '../types';

export const StationSequence = ({ queue, roomId }: StationSequenceProps) => {
    return (
        <aside className="flex-1 flex flex-col justify-center border-l border-black/10 pl-16 max-w-sm">
            <h3 className="text-xs font-bold tracking-normal text-black/60 uppercase font-poppins mb-12">Up Next</h3>
            <div className="space-y-10 mb-16">
                {queue.slice(0, 3).map((song, i) => (
                    <div key={i} className="group cursor-default opacity-60 hover:opacity-100 transition-opacity">
                        <p className="text-xl font-bold text-black transition-colors leading-tight font-poppins uppercase tracking-tight">
                            {song.title}
                        </p>
                        <p className="text-xs font-bold text-black/50 uppercase tracking-normal mt-2 font-poppins">{song.author || 'UNKNOWN'}</p>
                    </div>
                ))}
            </div>
            
            <Link to="/r/$roomId/request" params={{ roomId }} className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full border border-black/10 bg-white flex items-center justify-center text-black/60 shadow-sm group-hover:border-orange-500/40 group-hover:bg-orange-500/5 group-hover:text-orange-500 transition-all">
                    <Plus size={20} />
                </div>
                <span className="text-xs font-bold tracking-normal text-black/50 group-hover:text-black transition-colors uppercase font-poppins">Add to queue</span>
            </Link>
        </aside>
    );
};
