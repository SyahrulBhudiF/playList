import { useEffect } from 'react';
import { useParams, Outlet } from '@tanstack/react-router';
import { socket } from '../../shared/lib/socket';

export function ParticipantLayout() {
  const { roomId } = useParams({ from: '/r/$roomId' });

  useEffect(() => {
    socket.connect();

    return () => {
      // Keep connection alive for transitions
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      <main className="flex-1">
         <Outlet />
      </main>
    </div>
  );
}
