import { useRef } from 'react';
import YouTube from 'react-youtube';
import { usePlayback } from '@/shared/hooks/usePlayback';
import { MusicRoomView } from '../../shared/components/MusicRoomView';

export function PlaybackController({ 
  roomId, nowPlaying, upNext, fullQueue, activePlayer, onPlayerReady, onPlayerEnd, togglePlayback 
}: any) {
  const { isPlaying, setIsPlaying, progress } = usePlayback(nowPlaying);
  const playerRefA = useRef<any>(null);
  const playerRefB = useRef<any>(null);

  function handleTogglePlay() {
    const ref = activePlayer === 'A' ? playerRefA : playerRefB;
    if (!ref.current) return;
    if (isPlaying) {
      ref.current.pauseVideo();
    } else {
      ref.current.playVideo();
    }
  }

  return (
    <section className="w-full">
      {/* THE HIDDEN ACTUAL PLAYERS */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0">
         <div key="A" className={activePlayer === 'A' ? 'block' : 'hidden'}>
           {nowPlaying && activePlayer === 'A' ? (
             <YouTube 
                videoId={nowPlaying.youtubeId} 
                opts={{ playerVars: { autoplay: 1, controls: 0 } }} 
                onReady={(e) => { playerRefA.current = e.target; onPlayerReady('A')(e); }} 
                onEnd={onPlayerEnd} 
                onPlay={() => { setIsPlaying(true); togglePlayback(true); }}
                onPause={() => { setIsPlaying(false); togglePlayback(false); }}
             />
           ) : null}
         </div>
         <div key="B" className={activePlayer === 'B' ? 'block' : 'hidden'}>
           {nowPlaying && activePlayer === 'B' ? (
             <YouTube 
                videoId={nowPlaying.youtubeId} 
                opts={{ playerVars: { autoplay: 1, controls: 0 } }} 
                onReady={(e) => { playerRefB.current = e.target; onPlayerReady('B')(e); }} 
                onEnd={onPlayerEnd} 
                onPlay={() => { setIsPlaying(true); togglePlayback(true); }}
                onPause={() => { setIsPlaying(false); togglePlayback(false); }}
             />
           ) : null}
         </div>
         {upNext ? (
           <YouTube 
              videoId={upNext.youtubeId} 
              opts={{ playerVars: { autoplay: 0 } }} 
              onReady={onPlayerReady(activePlayer === 'A' ? 'B' : 'A')} 
           />
         ) : null}
      </div>

      <MusicRoomView 
        roomId={roomId}
        nowPlaying={nowPlaying}
        queue={fullQueue || []}
        isPlaying={isPlaying}
        progress={progress}
        role="admin"
        onSkip={onPlayerEnd}
        onTogglePlay={handleTogglePlay}
      />

      {/* Removed restrictive spinner overlay to allow interaction with dashboard tabs */}
    </section>
  );
}
