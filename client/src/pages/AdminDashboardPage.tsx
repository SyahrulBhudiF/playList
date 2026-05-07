import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminHeader } from '../shared/components/AdminHeader';
import { useAdminAuth } from '../features/admin/hooks/useAdminAuth';
import { PlaybackController } from '../features/admin/components/PlaybackController';
import { SongSearch } from '../features/admin/components/SongSearch';
import { ModerationQueue } from '../features/admin/components/ModerationQueue';
import { AccessCodeBanner } from '../features/admin/components/AccessCodeBanner';
import { useAdminDashboardPage } from '../hooks/pages/useAdminDashboardPage';

export function AdminDashboardPage() {
  const { logout, user } = useAdminAuth();
  const {
    roomId, activeTab, setActiveTab, copied, handleCopyKey, tabs, connected, roomKey, nowPlaying,
    upNext, fullQueue, activePlayer, pendingQueue, processingId, editingId, editValue, setEditValue,
    searchQuery, setSearchQuery, searchResults, searchLoading, submittingId, suggestions,
    onSelectSuggestion, onPlayerReady, onPlayerEnd, togglePlayback, handleApprove,
    handleDelete, startEditing, handleSaveEdit, handleAddSong, setEditingId
  } = useAdminDashboardPage();

  useEffect(() => {
    document.title = `Station ${roomId.toUpperCase()} | Admin Control`;
  }, [roomId]);

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#39283f] font-poppins pb-20">
      <AdminHeader 
        connected={connected} tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as any)}
        user={user || undefined} onLogout={logout} showBackToHub title={`Station: ${roomId.toUpperCase()}`}
      />

      <main className="max-w-[1600px] mx-auto h-full p-10 pt-32">
        <AnimatePresence mode="wait">
          {activeTab === 'room' && (
            <motion.div key="room" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex justify-center">
              <div className="w-full max-w-4xl"><AccessCodeBanner roomKey={roomKey} copied={copied} onCopy={handleCopyKey} roomId={roomId} /></div>
            </motion.div>
          )}
          {activeTab === 'music' && (
            <motion.div key="music" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex justify-center">
              <div className="w-full max-w-4xl"><PlaybackController roomId={roomId} nowPlaying={nowPlaying} upNext={upNext} fullQueue={fullQueue} activePlayer={activePlayer} onPlayerReady={onPlayerReady} onPlayerEnd={onPlayerEnd} togglePlayback={togglePlayback} /></div>
            </motion.div>
          )}
          {activeTab === 'review' && (
             <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex justify-center">
                <div className="w-full max-w-5xl"><ModerationQueue pendingQueue={pendingQueue} processingId={processingId} editingId={editingId} editValue={editValue} setEditValue={setEditValue} handleApprove={handleApprove} handleDelete={handleDelete} startEditing={startEditing} handleSaveEdit={handleSaveEdit} setEditingId={setEditingId} /></div>
             </motion.div>
          )}
          {activeTab === 'search' && (
             <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex justify-center">
                <div className="w-full max-w-4xl"><SongSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchLoading={searchLoading} searchResults={searchResults} suggestions={suggestions} onSelectSuggestion={onSelectSuggestion} handleAddSong={handleAddSong} submittingId={submittingId} /></div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
