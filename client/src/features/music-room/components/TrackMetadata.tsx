import React from 'react';

import type { TrackMetadataProps } from '../types';

export const TrackMetadata = ({ track }: TrackMetadataProps) => {
    return (
        <header className="mb-12">
            <h1 className="text-6xl xl:text-7xl font-bebas tracking-tight text-black leading-none uppercase mb-4">
                {track?.title || 'Die For You'}
            </h1>
            <div className="space-y-1">
                <p className="text-xl font-bold tracking-normal text-black/80 uppercase font-poppins leading-none">
                    {track?.author || 'THE WEEKND'}
                </p>
                <p className="text-sm font-bold tracking-normal text-black/50 uppercase font-poppins">
                    Album // STARBOY
                </p>
            </div>
        </header>
    );
};
