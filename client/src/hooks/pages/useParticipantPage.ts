import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useParticipant } from '../../features/participant/hooks/useParticipant';

export function useParticipantPage() {
  const { roomId } = useParams({ from: '/r/$roomId/request' }) as { roomId: string };
  const navigate = useNavigate();
  const [passkey, setPasskey] = useState('');
  const [isJoined, setIsJoined] = useState(!!sessionStorage.getItem(`room_${roomId}_key`));
  const [isRevealing, setIsRevealing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [activeTab, setActiveTab] = useState<'request' | 'music'>('request');
  
  const {
    query,
    setQuery,
    isConfirmed,
    setIsConfirmed,
    results,
    loading,
    submitting,
    nowPlaying,
    queue,
    statusMsg,
    suggestions,
    handleSelect,
    joinRoom,
    clearStatusMsg,
    resolveRoomByKey
  } = useParticipant(roomId);
  
  // Clear status on mount (Prevents sticky alerts on refresh)
  useEffect(() => {
    clearStatusMsg();
  }, []);

  const hasJoinedSocket = useRef(false);

  // Auto-join if key exists
  useEffect(() => {
    if (roomId === 'join') return;
    const savedKey = sessionStorage.getItem(`room_${roomId}_key`);
    if (savedKey && !hasJoinedSocket.current) {
      hasJoinedSocket.current = true;
      joinRoom(savedKey, (success) => {
        setIsJoined(success);
        if (!success) {
          sessionStorage.removeItem(`room_${roomId}_key`);
          hasJoinedSocket.current = false;
        }
      });
    }
  }, [roomId, joinRoom]);

  // Auto-redirect to join flow if unauthorized
  useEffect(() => {
    if (statusMsg?.text.toLowerCase().includes('room key') || 
        statusMsg?.text.toLowerCase().includes('passkey')) {
      setIsJoined(false);
      sessionStorage.removeItem(`room_${roomId}_key`);
    }
  }, [statusMsg, roomId]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey.length !== 5) return;

    if (roomId === 'join') {
      setIsResolving(true);
      resolveRoomByKey(passkey, (success, resolvedRoomId) => {
        setIsResolving(false);
        if (success && resolvedRoomId) {
          sessionStorage.setItem(`room_${resolvedRoomId}_key`, passkey);
          
          // 1. Save the passkey to sessionStorage for the new room
          sessionStorage.setItem(`room_${resolvedRoomId}_key`, passkey);
          
          // 2. Play transition overlay
          setIsRevealing(true);
          
          // 3. Navigate to the new room, allowing it to automatically connect to socket on mount
          setTimeout(() => {
            setIsRevealing(false);
            if (resolvedRoomId !== roomId) {
              navigate({ to: '/r/$roomId/request', params: { roomId: resolvedRoomId } });
            }
          }, 1800);
        }
      });
    } else {
      joinRoom(passkey, (success) => {
        if (success) {
          sessionStorage.setItem(`room_${roomId}_key`, passkey);
          setIsRevealing(true);
          setTimeout(() => {
            setIsJoined(true);
            setIsRevealing(false);
          }, 1800);
        }
      });
    }
  };

  const handlePasskeyChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setPasskey(clean);
    if (statusMsg) clearStatusMsg();
  };

  const vibes = ['Chill', 'Hype', 'Focus', 'Throwback', 'R&B', 'Lo-Fi'];

  return {
    roomId,
    passkey,
    handlePasskeyChange,
    isJoined,
    isRevealing,
    isResolving,
    query,
    setQuery,
    isConfirmed,
    setIsConfirmed,
    results,
    loading,
    submitting,
    nowPlaying,
    queue,
    statusMsg,
    suggestions,
    handleSelect,
    handleKeySubmit,
    vibes,
    activeTab,
    setActiveTab
  };
}
