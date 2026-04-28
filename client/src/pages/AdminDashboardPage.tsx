import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard';
import { DashboardHeader } from '../features/admin/components/DashboardHeader';
import { PlaybackController } from '../features/admin/components/PlaybackController';
import { SongSearch } from '../features/admin/components/SongSearch';
import { ModerationQueue } from '../features/admin/components/ModerationQueue';

export function AdminDashboardPage() {
  const { roomId } = useParams({ from: '/admin/$roomId' }) as { roomId: string };
  const [activeTab, setActiveTab] = useState<'review' | 'music' | 'search'>('review');
  
  const {
    connected,
    nowPlaying,
    upNext,
    activePlayer,
    pendingQueue,
    processingId,
    editingId,
    editValue,
    setEditValue,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    submittingId,
    onPlayerReady,
    onPlayerEnd,
    handleApprove,
    handleDelete,
    startEditing,
    handleSaveEdit,
    handleAddSong,
    setEditingId
  } = useAdminDashboard(roomId);

  const tabs = [
    { id: 'review', label: 'REVIEW QUEUE', icon: '⚖️' },
    { id: 'music', label: 'MUSIC ROOM', icon: '🎧' },
    { id: 'search', label: 'FIND TRACKS', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#39283f] font-poppins selection:bg-[#F57923] selection:text-white pb-20">
      <DashboardHeader roomId={roomId} connected={connected} />

      {/* Admin Tab Navigation */}
      <nav className="fixed top-20 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#39283f]/5 px-6">
         <div className="max-w-[1600px] mx-auto flex justify-center gap-12 py-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[11px] font-bold tracking-normal uppercase py-2 transition-all relative ${activeTab === tab.id ? 'text-[#F57923]' : 'text-[#39283f]/30 hover:text-[#39283f]'}`}
              >
                {tab.label}
                {activeTab === tab.id ? (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#F57923] to-[#FDB017]" 
                  />
                ) : null}
              </button>
            ))}
         </div>
      </nav>

      <main className="max-w-[1600px] mx-auto h-full p-6 pt-44">
        
        <AnimatePresence mode="wait">
          {activeTab === 'music' ? (
            <motion.div 
               key="music"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="w-full flex justify-center"
            >
              <div className="w-full max-w-4xl">
                 <PlaybackController 
                    roomId={roomId}
                    nowPlaying={nowPlaying}
                    upNext={upNext}
                    activePlayer={activePlayer}
                    onPlayerReady={onPlayerReady}
                    onPlayerEnd={onPlayerEnd}
                  />
              </div>
            </motion.div>
          ) : null}

          {activeTab === 'review' ? (
             <motion.div 
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex justify-center"
             >
                <div className="w-full max-w-5xl">
                   <ModerationQueue 
                      pendingQueue={pendingQueue}
                      processingId={processingId}
                      editingId={editingId}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      handleApprove={handleApprove}
                      handleDelete={handleDelete}
                      startEditing={startEditing}
                      handleSaveEdit={handleSaveEdit}
                      setEditingId={setEditingId}
                    />
                </div>
             </motion.div>
          ) : null}

          {activeTab === 'search' ? (
             <motion.div 
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex justify-center"
             >
                <div className="w-full max-w-4xl">
                   <SongSearch 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      searchLoading={searchLoading}
                      searchResults={searchResults}
                      handleAddSong={handleAddSong}
                      submittingId={submittingId}
                    />
                </div>
             </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
