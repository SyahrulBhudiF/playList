import React from 'react';
import { Hero } from '../features/landing/components/Hero';
import { LoadingOverlay } from '../shared/components/LoadingOverlay';
import logo from '../assets/logo.svg';
import { useLandingPage } from '../hooks/pages/useLandingPage';

export const LandingPage: React.FC = () => {
  const { isLoading } = useLandingPage();

  React.useEffect(() => {
    document.title = "PLAY // Sound Archive";
  }, []);

  return (
    <div className="min-h-screen bg-groovy-bg selection:bg-groovy-primary selection:text-groovy-deep">
      <LoadingOverlay isLoading={isLoading} />
      
      {/* Absolute Header for Logo Only */}
      <header className="absolute top-0 left-0 w-full z-50 px-8 py-6 flex justify-end">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Play Logo" className="h-10 w-10" />
          <span className="font-bebas text-4xl tracking-tighter text-groovy-deep">PLAY</span>
        </div>
      </header>

      <main>
        <Hero />
      </main>
    </div>
  );
};


