export interface Track {
  id: string;
  youtubeId: string;
  title: string;
  author: string;
}

export interface PendingSong {
  id: string;
  youtubeId: string;
  title: string;
  author: string;
  status: string;
  submittedBy: string;
  createdAt: string;
}

export interface SearchResult {
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
}
