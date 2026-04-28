import React from 'react';
import { Hero } from '../features/landing/components/Hero';
import logo from '../assets/logo.svg';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-groovy-bg selection:bg-groovy-primary selection:text-groovy-deep">
      {/* Absolute Header for Logo Only */}
      <header className="absolute top-0 left-0 w-full z-50 px-8 py-6 flex justify-end">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Play Logo" className="h-8 w-8" />
          <span className="font-bebas text-2xl tracking-tighter text-groovy-deep">PLAY</span>
        </div>
      </header>

      <main>
        <Hero />
      </main>
    </div>
  );
};


