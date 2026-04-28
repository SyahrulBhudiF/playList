import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

// Singleton socket instance
export const socket = io("http://localhost:3001", {
  autoConnect: false, // Connect manually when room is joined
});

// User Identity Persistence
export const getUserId = () => {
  let userId = localStorage.getItem('music_queue_user_id');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('music_queue_user_id', userId);
  }
  return userId;
};
