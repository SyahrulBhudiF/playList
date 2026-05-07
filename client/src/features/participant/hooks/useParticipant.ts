import { useState, useEffect } from 'react';
import { socket, getUserId } from '../../../shared/lib/socket';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import type { Track, SearchResult } from '../../../shared/types';

export function useParticipant(roomId: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => {
        setStatusMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const debouncedQuery = useDebounce(query, 300);

  // Clear confirmation when query is cleared
  useEffect(() => {
    if (!query) setIsConfirmed(false);
  }, [query]);

  // Suggestions Effect
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || isConfirmed) {
      setSuggestions([]);
      return;
    }

    socket.emit('get_search_suggestions', { query: trimmed }, (res: any) => {
      // Prevents suggestions from re-appearing if the user already clicked one
      // or if they've cleared the query while this was in flight.
      if (res.success && !isConfirmed) {
        setSuggestions(res.suggestions);
      }
    });
  }, [query, isConfirmed]);

  useEffect(() => {
    if (!roomId) return;
    
    socket.connect();
    
    // Initial fetch
    socket.emit('get_now_playing', { roomId }, (res: any) => {
      if (res.nowPlaying) setNowPlaying(res.nowPlaying);
    });

    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });

    socket.on('queue_updated', (newQueue: any[]) => {
      // Filter for only approved songs for the public view
      setQueue(newQueue.filter(s => s.status === 'approved') as Track[]);
    });

    return () => {
      socket.off('now_playing_updated');
      socket.off('queue_updated');
    };
  }, [roomId]);

  const joinRoom = (passkey: string, callback?: (success: boolean, error?: string) => void) => {
    setStatusMsg(null); // Clear previous errors
    socket.emit('join_room', { roomId, role: 'participant', passkey }, (res: any) => {
      if (res?.success) {
        setStatusMsg({ type: 'success', text: "Access granted! Welcome to the room." });
        if (callback) callback(true);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || res?.error || "Failed to join" });
        if (callback) callback(false, res?.message || res?.error || "Failed to join");
      }
    });
  };



  // Live Search Effect
  useEffect(() => {
    let isCancelled = false;

    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 1) {
      if (trimmed.length === 0) setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Track this specific request
    const currentSearch = trimmed;

    socket.emit('search_songs', { query: currentSearch }, (res: any) => {
      // ONLY update if this request wasn't cancelled by a newer one
      if (!isCancelled) {
        setLoading(false);
        if (res.success) {
          setResults(res.results);
          setStatusMsg(null);
        }
      }
    });

    // Cleanup function cancels the previous request when debouncedQuery changes
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (song: SearchResult) => {
    const originalQuery = query;
    const originalResults = results;
    
    setSubmitting(song.youtubeId);
    setStatusMsg({ type: 'success', text: "Submitting request..." });

    socket.emit('submit_song', {
      roomId,
      youtubeId: song.youtubeId,
      title: song.title,
      author: song.author,
      userId: getUserId()
    }, (res: any) => {
      setSubmitting(null);
      if (res.success) {
        setStatusMsg({ type: 'success', text: "Song added to queue!" });
      } else {
        setResults(originalResults);
        setQuery(originalQuery);
        setStatusMsg({ type: 'error', text: res.error });
      }
    });
  };

  return {
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
    clearStatusMsg: () => setStatusMsg(null),
    resolveRoomByKey: (passkey: string, callback: (success: boolean, roomId?: string, error?: string) => void) => {
      setStatusMsg(null);
      socket.emit('join_by_passkey', { passkey }, (res: any) => {
        if (res.success) {
          setStatusMsg({ type: 'success', text: "Room found! Redirecting..." });
          callback(true, res.roomId);
        }
        else callback(false, undefined, res.error);
      });
    }
  };
}
