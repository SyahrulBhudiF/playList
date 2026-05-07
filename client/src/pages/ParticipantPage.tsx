import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CheckCircle2, AlertCircle } from "lucide-react";

// Shared Components
import { Badge } from "@/shared/components/badge";
import { SecretDoor } from "@/shared/components/SecretDoor";
import { TransitionOverlay } from "@/shared/components/TransitionOverlay";
import { MusicRoomView } from "../features/shared/components/MusicRoomView";

// Feature Components
import { JoinFlow } from "../features/participant/components/JoinFlow";
import { RequestFlow } from "../features/participant/components/RequestFlow";
import { NowPlayingBar } from "../features/participant/components/NowPlayingBar";

// Page Logic
import { useParticipantPage } from "../hooks/pages/useParticipantPage";

export function ParticipantPage() {
  const {
    roomId,
    passkey,
    handlePasskeyChange,
    isJoined,
    isRevealing,
    isResolving,
    query,
    setQuery,
    isConfirmed,
    setIsConfirmed,
    results,
    loading,
    submitting,
    nowPlaying,
    queue,
    statusMsg,
    suggestions,
    handleSelect,
    handleKeySubmit,
    vibes,
    activeTab,
    setActiveTab,
  } = useParticipantPage();

  // SEO
  useEffect(() => {
    document.title = isJoined
      ? `Station ${roomId.toUpperCase()} | PLAY LIST`
      : "Join Broadcast | PLAY LIST";
  }, [isJoined, roomId]);

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-[#1a101c] font-poppins overflow-x-hidden relative selection:bg-orange-500 selection:text-white">
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03]">
        <div className="w-[400px] h-[400px] border border-black rounded-full" />
        <div className="absolute w-[600px] h-[600px] border border-black rounded-full" />
        <div className="absolute w-[800px] h-[800px] border border-black rounded-full" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 flex justify-between items-center bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <SecretDoor size="xl" />
          <div className="flex flex-col">
            <span className="font-bebas text-4xl tracking-tighter text-black leading-none uppercase">
              PLAY LIST
            </span>
            <span className="text-[9px] text-black/20 font-bold uppercase tracking-[0.2em] leading-none mt-1">
              Room // {roomId?.toUpperCase() || "Music Room"}
            </span>
          </div>

          {isJoined && (
            <div className="hidden lg:flex items-center gap-6 ml-8">
              <button
                onClick={() => setActiveTab("request")}
                className={`text-[12px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === "request" ? "text-orange-500" : "text-black/20 hover:text-black"}`}
              >
                Request
              </button>
              <button
                onClick={() => setActiveTab("music")}
                className={`text-[12px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === "music" ? "text-orange-500" : "text-black/20 hover:text-black"}`}
              >
                Music Room
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isJoined && (
            <Badge
              variant="outline"
              className="hidden md:flex items-center gap-2 bg-white border-black/10 rounded-full px-6 py-3 h-auto text-sm font-bold tracking-widest text-black/40 uppercase"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Room: {roomId.toUpperCase()}
            </Badge>
          )}
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-black/40 hover:text-black transition-colors"
          >
            <Home size={18} />
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <AnimatePresence mode="wait">
        {!isJoined ? (
          <JoinFlow
            passkey={passkey}
            onPasskeyChange={handlePasskeyChange}
            onSubmit={handleKeySubmit}
            isResolving={isResolving}
          />
        ) : activeTab === "music" ? (
          <motion.div
            key="music-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative z-20 pt-32 px-6 w-full"
          >
            <MusicRoomView
              roomId={roomId}
              nowPlaying={nowPlaying}
              queue={queue}
              isPlaying={!!nowPlaying}
              progress={0}
              role="participant"
            />
          </motion.div>
        ) : (
          <RequestFlow
            query={query}
            setQuery={setQuery}
            isConfirmed={isConfirmed}
            setIsConfirmed={setIsConfirmed}
            suggestions={suggestions}
            results={results}
            loading={loading}
            submitting={submitting}
            onSelect={handleSelect}
            vibes={vibes}
          />
        )}
      </AnimatePresence>

      <NowPlayingBar
        nowPlaying={nowPlaying}
        roomId={roomId}
        isVisible={isJoined && !!nowPlaying && activeTab === "request"}
      />

      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-28 left-0 right-0 flex justify-center pointer-events-none z-100"
          >
            <div
              className={`pointer-events-auto flex items-center gap-6 px-8 py-6 rounded-[32px] border transition-all duration-500 min-w-[400px] ${
                statusMsg?.type === "success"
                  ? "bg-white border-green-500/20"
                  : "bg-white border-red-500/20"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  statusMsg?.type === "success"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {statusMsg?.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${
                    statusMsg?.type === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {statusMsg?.type === "success" ? "Confirmed" : "Attention"}
                </p>
                <p className="text-base font-bold text-black/80 leading-tight tracking-tight">
                  {statusMsg?.text}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJoined && activeTab === "music" && !nowPlaying && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-[#fdfdfc] flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="max-w-xl space-y-12">
              <div className="space-y-6">
                <h2 className="text-8xl font-bebas tracking-tighter text-black leading-none uppercase">
                  No music playing
                </h2>
                <p className="text-black/40 text-sm font-bold uppercase tracking-widest italic">
                  Waiting for the admin to play a song
                </p>
              </div>
              <button
                onClick={() => setActiveTab("request")}
                className="px-12 h-16 bg-black text-white rounded-3xl text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 flex items-center gap-2"
              >
                Add a song
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <TransitionOverlay isVisible={isRevealing} />
    </div>
  );
}
