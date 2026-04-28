import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Users, BarChart2, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: 'Home' },
    { icon: Search, label: 'Search', active: true },
    { icon: Users, label: 'Room' },
    { icon: BarChart2, label: 'Stats' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-20 md:w-24 border-r border-black/5 bg-playlist-sidebar flex flex-col items-center py-10 gap-10">
      {/* Mini Brand Logo */}
      <div className="w-8 h-8 md:w-10 md:h-10 bg-playlist-accent rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/20">
        <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {menuItems.map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.1 }}
            className={`cursor-pointer p-3 rounded-2xl transition-all duration-300 ${item.active ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:text-black/60 hover:bg-black/5'}`}
          >
            <item.icon size={22} strokeWidth={2.5} />
          </motion.div>
        ))}
      </nav>

      {/* User Avatar Mock */}
      <div className="w-10 h-10 rounded-full border-2 border-black/5 overflow-hidden">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
      </div>
    </aside>
  );
};
