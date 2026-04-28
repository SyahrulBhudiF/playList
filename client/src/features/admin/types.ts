import type { YouTubeProps } from 'react-youtube';
import type { Track, PendingSong, SearchResult } from '../../shared/types';

export type { Track, PendingSong, SearchResult };

export interface PlaybackControllerProps {
  roomId: string;
  nowPlaying: Track | null;
  upNext: Track | null;
  activePlayer: 'A' | 'B';
  onPlayerReady: (id: 'A' | 'B') => YouTubeProps['onReady'];
  onPlayerEnd: () => void;
}

export interface ModerationQueueProps {
  pendingQueue: PendingSong[];
  processingId: string | null;
  editingId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  handleApprove: (id: string) => void;
  handleDelete: (id: string) => void;
  startEditing: (song: PendingSong) => void;
  handleSaveEdit: (id: string) => void;
  setEditingId: (id: string | null) => void;
}

export interface DashboardHeaderProps {
  roomId: string;
  connected: boolean;
}

export interface SongSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchLoading: boolean;
  searchResults: SearchResult[];
  handleAddSong: (song: SearchResult) => void;
  submittingId: string | null;
}
