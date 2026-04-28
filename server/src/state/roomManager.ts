export type SongBasic = {
  id: string;
  youtubeId: string;
  title: string;
};

export type RoomState = {
  playbackControllerSocketId: string | null;
  nowPlaying: SongBasic | null;
  nextTrack: SongBasic | null;
};

class RoomManager {
  private rooms = new Map<string, RoomState>();

  private getOrInitRoom(roomId: string): RoomState {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        playbackControllerSocketId: null,
        nowPlaying: null,
        nextTrack: null,
      });
    }
    return this.rooms.get(roomId)!;
  }

  // --- PLAYBACK CONTROLLER ---
  
  public getPlaybackController(roomId: string): string | null {
    return this.getOrInitRoom(roomId).playbackControllerSocketId;
  }

  public registerPlaybackController(roomId: string, socketId: string): boolean {
    const room = this.getOrInitRoom(roomId);
    if (room.playbackControllerSocketId && room.playbackControllerSocketId !== socketId) {
      return false; // Already taken
    }
    room.playbackControllerSocketId = socketId;
    return true;
  }

  public unregisterPlaybackController(roomId: string, socketId: string): void {
    const room = this.getOrInitRoom(roomId);
    if (room.playbackControllerSocketId === socketId) {
      room.playbackControllerSocketId = null;
    }
  }

  public unregisterControllerIfAny(socketId: string): string | null {
    // If a socket disconnects, find if it was an EO and clean it up. Returns roomId.
    for (const [roomId, state] of this.rooms.entries()) {
      if (state.playbackControllerSocketId === socketId) {
        state.playbackControllerSocketId = null;
        return roomId;
      }
    }
    return null;
  }

  // --- PLAYBACK STATE ---

  public getNowPlaying(roomId: string): SongBasic | null {
    return this.getOrInitRoom(roomId).nowPlaying;
  }

  public setNowPlaying(roomId: string, song: SongBasic | null): void {
    const room = this.getOrInitRoom(roomId);
    room.nowPlaying = song;
  }
}

export const roomManager = new RoomManager();
