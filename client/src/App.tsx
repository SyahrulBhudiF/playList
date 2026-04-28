import { LandingPage } from './pages/LandingPage';
import { MusicRoom } from './pages/MusicRoom';

export function App() {
  const hasVisited = localStorage.getItem('has_visited_play_music') === 'true';

  if (hasVisited) {
    return <MusicRoom />;
  }

  return <LandingPage />;
}
