export const LyricsDisplay = () => {
    return (
        <article className="h-48 flex flex-col gap-6 overflow-hidden mask-fade-edges mt-8 relative">
            <div className="space-y-6">
                <p className="text-lg font-bold text-black/10 leading-relaxed uppercase tracking-tighter">Awaiting Signal Feed</p>
                <p className="text-xl font-bold text-black/30 leading-relaxed uppercase tracking-tight">Syncing Live Metadata...</p>
                <p className="text-lg font-bold text-black/10 leading-relaxed uppercase tracking-tighter">Broadcast Sound Archive</p>
            </div>
        </article>
    );
};
