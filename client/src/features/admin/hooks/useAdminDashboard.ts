import { useState, useEffect, useRef } from 'react';
import { socket, getUserId } from '../../../shared/lib/socket';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import type { YouTubeProps } from 'react-youtube';
import type { Track, PendingSong, SearchResult } from '../types';

export function useAdminDashboard(roomId: string) {
  // --- STATE: GLOBAL ---
  const [connected, setConnected] = useState(false);
  
  // --- STATE: PLAYER (EO) ---
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [upNext, setUpNext] = useState<Track | null>(null);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const playerARef = useRef<any>(null);
  const playerBRef = useRef<any>(null);

  // --- STATE: MODERATION (Admin) ---
  const [pendingQueue, setPendingQueue] = useState<PendingSong[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // --- STATE: SEARCH (Add Music) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 150);

  // --- SOCKET LIFECYCLE ---
  useEffect(() => {
    if (!roomId) return;
    
    console.log(`[DASHBOARD] Connecting to room: ${roomId}`);
    socket.connect();
    socket.emit('join_room', { roomId, role: 'admin' });

    socket.on('eo_registered', () => {
      console.log("[DASHBOARD] EO Registered successfully");
      setConnected(true);
      socket.emit('eo_track_ended', { roomId }, (res: any) => {
        if (res.success) {
          setNowPlaying(res.nextTrack);
          setUpNext(res.upNext);
        }
      });
    });

    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });

    socket.on('queue_updated', (queue: PendingSong[]) => {
      setPendingQueue(queue.filter(q => q.status === 'pending'));
    });

    socket.on('new_pending_song', (song: PendingSong) => {
      setPendingQueue(prev => [...prev, song]);
    });

    socket.on('song_deleted', ({ songId }: { songId: string }) => {
      setPendingQueue(prev => prev.filter(s => s.id !== songId));
    });

    socket.on('song_approved', (song: PendingSong) => {
      setPendingQueue(prev => prev.filter(s => s.id !== song.id));
    });

    socket.on('song_updated', (updated: { id: string; title: string }) => {
      setPendingQueue(prev => prev.map(s => s.id === updated.id ? { ...s, title: updated.title } : s));
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('eo_registered');
      socket.off('now_playing_updated');
      socket.off('queue_updated');
      socket.off('new_pending_song');
      socket.off('song_deleted');
      socket.off('song_approved');
      socket.off('song_updated');
      socket.off('disconnect');
    };
  }, [roomId]);

  useEffect(() => {
    if (connected && !nowPlaying) {
      fetchNext();
    }
  }, [connected, nowPlaying]);

  // --- LOGIC: PLAYER (EO) ---
  const fetchNext = () => {
    socket.emit('eo_track_ended', { roomId }, (res: any) => {
      if (res.success) {
        setNowPlaying(res.nextTrack);
        setUpNext(res.upNext);
      }
    });
  };

  const onPlayerReady: (id: 'A' | 'B') => YouTubeProps['onReady'] = (id) => (event) => {
    if (id === 'A') playerARef.current = event.target;
    else playerBRef.current = event.target;
    event.target.mute();
  };

  const onPlayerEnd = () => {
    setNowPlaying(upNext);
    const nextPlayer = activePlayer === 'A' ? 'B' : 'A';
    setActivePlayer(nextPlayer);
    const newPlayer = nextPlayer === 'A' ? playerARef.current : playerBRef.current;
    if (newPlayer) {
      newPlayer.unMute();
      newPlayer.playVideo();
    }
    socket.emit('eo_track_ended', { roomId }, (res: any) => {
      if (res.success) setUpNext(res.upNext);
    });
  };

  // --- LOGIC: MODERATION ---
  const handleApprove = (songId: string) => {
    const original = [...pendingQueue];
    setPendingQueue(prev => prev.filter(s => s.id !== songId));
    setProcessingId(songId);
    socket.emit('approve_song', { roomId, songId }, (res: any) => {
      setProcessingId(null);
      if (!res.success) {
        setPendingQueue(original);
        alert(res.error);
      }
    });
  };

  const handleDelete = (songId: string) => {
    const original = [...pendingQueue];
    setPendingQueue(prev => prev.filter(s => s.id !== songId));
    setProcessingId(songId);
    socket.emit('delete_song', { roomId, songId }, (res: any) => {
      setProcessingId(null);
      if (!res.success) {
        setPendingQueue(original);
        alert(res.error);
      }
    });
  };

  const startEditing = (song: PendingSong) => {
    setEditingId(song.id);
    setEditValue(song.title);
  };

  const handleSaveEdit = (songId: string) => {
    socket.emit('edit_song', { roomId, songId, newTitle: editValue }, (res: any) => {
      if (res.success) setEditingId(null);
      else alert(res.error);
    });
  };

  // --- LOGIC: SEARCH ---
  useEffect(() => {
    if (debouncedSearch.trim().length < 3) {
      if (debouncedSearch.trim().length === 0) setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    socket.emit('search_songs', { query: debouncedSearch }, (res: any) => {
      setSearchLoading(false);
      if (res.success) setSearchResults(res.results);
    });
  }, [debouncedSearch]);

  const handleAddSong = (song: SearchResult) => {
    setSubmittingId(song.youtubeId);
    socket.emit('submit_song', {
      roomId,
      youtubeId: song.youtubeId,
      title: song.title,
      userId: getUserId()
    }, (res: any) => {
      setSubmittingId(null);
      if (res.success) {
        setSearchQuery('');
        setSearchResults([]);
      }
    });
  };

  return {
    connected,
    nowPlaying,
    upNext,
    activePlayer,
    pendingQueue,
    processingId,
    editingId,
    editValue,
    setEditValue,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    submittingId,
    onPlayerReady,
    onPlayerEnd,
    handleApprove,
    handleDelete,
    startEditing,
    handleSaveEdit,
    handleAddSong,
    setEditingId
  };
}
