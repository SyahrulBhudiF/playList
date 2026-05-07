import { useState, useEffect, useRef } from 'react';
import { socket, getUserId } from '../../../shared/lib/socket';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import type { YouTubeProps } from 'react-youtube';
import type { Track, PendingSong, SearchResult } from '../types';

export function useAdminDashboard(roomId: string) {
  // --- STATE: GLOBAL ---
  const [connected, setConnected] = useState(false);
  const [roomKey, setRoomKey] = useState<string | null>(null);
  
  // --- STATE: PLAYER (EO) ---
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [upNext, setUpNext] = useState<Track | null>(null);
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const playerARef = useRef<any>(null);
  const playerBRef = useRef<any>(null);

  // --- STATE: MODERATION (Admin) ---
  const [pendingQueue, setPendingQueue] = useState<PendingSong[]>([]);
  const [fullQueue, setFullQueue] = useState<Track[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');



  // --- SOCKET LIFECYCLE ---
  useEffect(() => {
    if (!roomId) return;
    
    console.log(`[DASHBOARD] Connecting to room: ${roomId}`);
    socket.connect();
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert("Unauthorized. Please log in.");
      window.location.href = '/admin/login';
      return;
    }

    socket.emit('join_room', { roomId, role: 'admin', adminToken }, (res: any) => {
      if (res && !res.success) {
        alert(res.error || "Failed to join room");
        window.location.href = '/admin';
      }
    });

    socket.on('connect', () => {
      console.log("[DASHBOARD] Socket connected");
      setConnected(true);
    });

    socket.on('eo_registered', () => {
      console.log("[DASHBOARD] EO Registered successfully");
    });

    socket.on('room_key_info', ({ passkey }: { passkey: string }) => {
      console.log(`[DASHBOARD] Room Key: ${passkey}`);
      setRoomKey(passkey);
    });

    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });

    socket.on('queue_updated', (queue: PendingSong[]) => {
      setPendingQueue(queue.filter(q => q.status === 'pending'));
      setFullQueue(queue.filter(q => q.status === 'approved') as Track[]);
      
      // If we're not playing anything, try to fetch the next song immediately
      if (!nowPlaying) {
        fetchNext();
      }
    });

    socket.on('new_pending_song', (song: PendingSong) => {
      console.log("[DASHBOARD] New pending song received:", song);
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
      socket.off('room_key_info');
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

  // --- STATE: SEARCH (Add Music) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 150);

  // --- SOCKET LIFECYCLE ---

  // --- LOGIC: SEARCH ---
  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    // As user types, get fast suggestions
    socket.emit('get_search_suggestions', { query: debouncedSearch }, (res: any) => {
      if (res.success) {
        setSuggestions(res.suggestions);
      }
    });
  }, [debouncedSearch]);

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setSearchLoading(true);
    
    // When a suggestion is picked, fetch the HIGH FIDELITY video result
    socket.emit('search_songs', { query: suggestion }, (res: any) => {
      setSearchLoading(false);
      if (res.success) {
        setSearchResults(res.results);
      }
    });
  };

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
        setSuggestions([]);
      }
    });
  };

  const togglePlayback = (playing: boolean) => {
    socket.emit('toggle_playback', { roomId, isPlaying: playing });
  };
  return {
    connected,
    roomKey,
    nowPlaying,
    upNext,
    activePlayer,
    pendingQueue,
    fullQueue,
    processingId,
    editingId,
    editValue,
    setEditValue,
    searchQuery,
    setSearchQuery,
    suggestions,
    onSelectSuggestion: handleSelectSuggestion,
    searchResults,
    searchLoading,
    submittingId,
    onPlayerReady,
    onPlayerEnd,
    togglePlayback,
    handleApprove,
    handleDelete,
    startEditing,
    handleSaveEdit,
    handleAddSong,
    setEditingId
  };
}
