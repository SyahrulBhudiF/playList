import { useState, useEffect } from 'react';
import { socket } from '../../../shared/lib/socket';
import type { Track, PendingSong } from '../../../shared/types';

export function useMusicRoom(roomId: string) {
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roomKey, setRoomKey] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();
    
    const passkey = sessionStorage.getItem(`room_${roomId}_key`);
    if (passkey) {
      socket.emit('join_room', { roomId, role: 'participant', passkey }, (res: any) => {
        if (!res.success && res.code === 'WRONG_PASSKEY') {
          console.warn(`[AUTH] Stale key found for room ${roomId}, clearing...`);
          sessionStorage.removeItem(`room_${roomId}_key`);
        }
      });
    }

    // Listen for room info
    socket.on('room_key_info', ({ passkey }: { passkey: string }) => {
      setRoomKey(passkey);
    });

    // Initial fetch
    socket.emit('get_now_playing', { roomId }, (res: any) => {
      if (res.nowPlaying) setNowPlaying(res.nowPlaying);
    });

    // Listen for updates
    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });

    socket.on('playback_updated', (state: { isPlaying: boolean }) => {
      setIsPlaying(state.isPlaying);
    });
 
    socket.on('queue_updated', (newQueue: PendingSong[]) => {
      // Filter for only approved songs for the public view
      setQueue(newQueue.filter(s => s.status === 'approved') as Track[]);
    });

    // Cleanup
    return () => {
      socket.off('now_playing_updated');
      socket.off('playback_updated');
      socket.off('queue_updated');
    };
  }, [roomId]);

  return {
    nowPlaying,
    queue,
    isPlaying,
    roomKey
  };
}
