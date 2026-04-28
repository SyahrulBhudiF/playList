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

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!roomId) return;
    
    socket.connect();
    socket.emit('join_room', { roomId, role: 'participant' });

    socket.on('now_playing_updated', (track: Track) => {
      setNowPlaying(track);
    });

    return () => {
      socket.off('now_playing_updated');
    };
  }, [roomId]);

  // Live Search Effect
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      if (debouncedQuery.trim().length === 0) setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    socket.emit('search_songs', { query: debouncedQuery }, (res: any) => {
      setLoading(false);
      if (res.success) {
        setResults(res.results);
        setStatusMsg(null);
      }
    });
  }, [debouncedQuery]);

  const handleSelect = (song: SearchResult) => {
    const originalQuery = query;
    const originalResults = results;
    
    setSubmitting(song.youtubeId);
    setStatusMsg({ type: 'success', text: "Submitting request..." });
    setResults([]);
    setQuery('');

    socket.emit('submit_song', {
      roomId,
      youtubeId: song.youtubeId,
      title: song.title,
      author: song.author,
      userId: getUserId()
    }, (res: any) => {
      setSubmitting(null);
      if (res.success) {
        setStatusMsg({ type: 'success', text: "Song added to queue! ✨" });
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
    results,
    loading,
    submitting,
    nowPlaying,
    statusMsg,
    handleSelect
  };
}
