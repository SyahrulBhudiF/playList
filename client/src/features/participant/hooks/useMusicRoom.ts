import { useState, useEffect } from 'react';
import { socket } from '../../../shared/lib/socket';
import type { Track, PendingSong } from '../../../shared/types';

export function useMusicRoom(roomId: string) {
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();
    socket.emit('join_room', { roomId, role: 'participant' });

    // Initial fetch
    socket.emit('get_now_playing', { roomId }, (res: any) => {
      if (res.nowPlaying) setNowPlaying(res.nowPlaying);
    });

    // Listen for updates
    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });
 
    socket.on('queue_updated', (newQueue: PendingSong[]) => {
      // Filter for only approved songs for the public view
      setQueue(newQueue.filter(s => s.status === 'approved') as Track[]);
    });

    // Cleanup
    return () => {
      socket.off('now_playing_updated');
      socket.off('queue_updated');
    };
  }, [roomId]);

  return {
    nowPlaying,
    queue
  };
}
