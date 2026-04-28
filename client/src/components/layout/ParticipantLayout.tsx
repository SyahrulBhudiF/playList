import { useEffect } from 'react';
import { useParams, Outlet, Link } from '@tanstack/react-router';
import { socket } from '../../shared/lib/socket';
import { SecretDoor } from '../../shared/components/SecretDoor';
import { Home } from 'lucide-react';

export function ParticipantLayout() {
  const { roomId } = useParams({ from: '/r/$roomId' });

  useEffect(() => {
    socket.connect();
    socket.emit('join_room', { roomId, role: 'participant' });

    return () => {
      // Keep connection alive for transitions
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* Mobile Header / Room ID Badge REMOVED */}
      <div className="fixed top-0 left-0 right-0 z-100 p-6 flex justify-between items-center pointer-events-none">
         <div className="pointer-events-auto">
            <SecretDoor roomId={roomId} />
         </div>
         <div className="pointer-events-auto">
            <Link to="/" className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 hover:bg-orange-500 hover:border-orange-500/20 hover:text-white transition-all shadow-xl group">
               <Home size={20} />
            </Link>
         </div>
      </div>

      <main className="flex-1">
         <Outlet />
      </main>
    </div>
  );
}
