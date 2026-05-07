import type { TrackMetadataProps } from '../types';

export const TrackMetadata = ({ track }: TrackMetadataProps) => {
    if (!track) return (
        <header className="mb-12">
            <h1 className="text-6xl xl:text-7xl font-bebas tracking-tight text-black/5 leading-none uppercase mb-4">
                Nothing playing
            </h1>
            <p className="text-sm font-bold tracking-widest text-black/10 uppercase font-poppins">
                Waiting for music
            </p>
        </header>
    );

    return (
        <header className="mb-12">
            <h1 className="text-6xl xl:text-7xl font-bebas tracking-tight text-neutral-800 leading-none uppercase mb-4 transition-all">
                {track.title}
            </h1>
            <div className="space-y-1">
                <p className="text-xl font-bold tracking-normal text-neutral-600 uppercase font-poppins leading-none">
                    {track.author}
                </p>
                <p className="text-sm font-bold tracking-widest text-black/30 uppercase font-poppins">
                    Playing now
                </p>
            </div>
        </header>
    );
};
