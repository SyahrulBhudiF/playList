import { useParams } from '@tanstack/react-router';
import { useMusicRoom } from '../../features/participant/hooks/useMusicRoom';
import { usePlayback } from '../../shared/hooks/usePlayback';

export function useMusicRoomPage() {
  const { roomId } = useParams({ from: '/r/$roomId' }) as { roomId: string };
  const musicRoom = useMusicRoom(roomId);
  const playback = usePlayback(musicRoom.nowPlaying);

  return {
    roomId,
    ...musicRoom,
    ...playback
  };
}
