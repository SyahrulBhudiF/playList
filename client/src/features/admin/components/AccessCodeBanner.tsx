import { Button } from '@/shared/components/button';

interface AccessCodeBannerProps {
  roomKey: string | null;
  copied: boolean;
  onCopy: () => void;
  roomId: string;
}

export function AccessCodeBanner({ roomKey, copied, onCopy, roomId }: AccessCodeBannerProps) {
  return (
    <div className="bg-white border border-black/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center">
      <div className="mb-10">
        <p className="text-xs font-bold text-black/30 uppercase tracking-[0.3em] mb-6">Broadcast Room Code</p>
        <div className="relative group cursor-pointer" onClick={onCopy}>
          <p className="text-[120px] font-bebas tracking-[0.15em] text-black leading-none mb-4 transition-transform hover:scale-[1.01] active:scale-[0.99]">
            {roomKey ?? '——'}
          </p>
        </div>
        <p className="text-sm text-black/40 font-bold max-w-sm mx-auto mt-4 uppercase tracking-widest">
          Participants enter this at <span className="text-black font-bold">play.it</span>
        </p>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={onCopy}
          disabled={!roomKey}
          variant={copied ? "premium-success" : "premium"}
          size="premium-lg"
          className="w-56"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          {copied ? 'Copied' : 'Copy Code'}
        </Button>
        <a 
          href={`/r/${roomId}`}
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] font-bold text-black/30 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors mt-2 flex items-center gap-2"
        >
          Open Participant Room ↗
        </a>
      </div>
    </div>
  );
}
