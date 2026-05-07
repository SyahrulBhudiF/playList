import { motion } from "framer-motion";
import playIcon from "@/assets/PLay.svg";
import pauseIcon from "@/assets/Pause.svg";
import logo from "@/assets/logo.svg";

interface TurntableProps {
  isPlaying: boolean;
  onToggle?: () => void;
  progress: number;
  thumbnail?: string | null;
}

export const Turntable = ({
  isPlaying,
  onToggle,
  progress,
  thumbnail,
}: TurntableProps) => {
  const accentColor = isPlaying ? "rgba(249,115,22,1)" : "rgba(0,0,0,0.2)";
  const glowColor = isPlaying ? "rgba(249,115,22,0.1)" : "rgba(0,0,0,0.03)";

  return (
    <figure className="relative w-full aspect-square max-w-[1200px] flex items-center justify-center p-0">
      {/* ATMOSPHERIC RADIANCE */}
      <div
        className="absolute inset-0 transition-colors duration-1000 blur-[100px]"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 75%)`,
        }}
      />

      {/* PROGRESS RING (OUTER) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="49%"
            fill="none"
            stroke="rgba(0,0,0,0.02)"
            strokeWidth="1"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="49%"
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>

      {/* MINIMAL SKETCH OUTLINES */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 15, 30].map((inset) => (
          <div
            key={inset}
            className={`absolute rounded-full border transition-all duration-1000 ${isPlaying ? "scale-105 border-orange-500/20" : "scale-100 border-black/5"}`}
            style={{ inset: `${inset}%` }}
          />
        ))}
      </div>

      {/* THE SCHEMATIC VINYL DISC (SPINNING LAYER) */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          duration: 4,
          repeat: isPlaying ? Infinity : 0,
          ease: "linear",
        }}
        className={`relative w-[98%] h-[98%] rounded-full flex items-center justify-center bg-white border transition-colors duration-1000 ${isPlaying ? "border-orange-500/30 shadow-orange-500/10" : "border-black/10 shadow-black/5"} overflow-hidden shadow-2xl will-change-transform`}
      >
        {/* THUMBNAIL INTEGRATION */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt="Disc Art"
            className={`absolute inset-0 w-full h-full object-cover opacity-10 transition-opacity duration-1000 ${isPlaying ? "opacity-20" : "opacity-5 grayscale"}`}
          />
        )}

        {/* GROOVE TEXTURES */}
        <svg className="absolute inset-0 w-full h-full opacity-60">
          {Array.from({ length: 45 }).map((_, i) => (
            <circle
              key={i}
              cx="50%"
              cy="50%"
              r={`${4 + i * 1.05}%`}
              fill="none"
              stroke={isPlaying ? "rgba(249,115,22,0.3)" : "rgba(0,0,0,0.05)"}
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* TECHNICAL REFRACTION */}
        <div
          className={`absolute inset-0 transition-colors duration-1000 ${isPlaying ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(249,115,22,0.05)_25%,transparent_50%,rgba(249,115,22,0.05)_75%,transparent_100%)]" : "bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,0,0,0.02)_25%,transparent_50%,rgba(0,0,0,0.02)_75%,transparent_100%)]"}`}
        />
      </motion.div>

      {/* CENTER LABEL HUB (STATIONARY) - clickable for play/pause */}
      <button
        onClick={onToggle}
        disabled={!onToggle}
        className={`absolute z-20 w-[28%] h-[28%] rounded-full flex items-center justify-center bg-white border transition-colors duration-1000 ${isPlaying ? "border-orange-500/30" : "border-black/10"} shadow-xl shadow-black/5 ${onToggle ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"} transition-transform`}
      >
        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          {isPlaying ? (
            <img
              src={pauseIcon}
              alt="Pause"
              className="relative w-8 h-8 opacity-40 transition-all duration-1000"
            />
          ) : (
            <img
              src={playIcon}
              alt="Play"
              className="relative w-8 h-8 opacity-40 translate-x-1 grayscale transition-all duration-1000"
            />
          )}
        </div>

        <div
          className={`absolute -top-10 w-5 h-5 z-40 transition-opacity duration-1000 ${isPlaying ? "opacity-40" : "opacity-10"}`}
        >
          <img
            src={logo}
            alt="Logo"
            className="relative w-full h-full grayscale"
          />
        </div>
      </button>

      {/* NEEDLE ASSEMBLY */}
      <div className="absolute -top-20 right-[-280px] w-1/2 h-full pointer-events-none z-30 flex justify-end p-24 origin-top-right">
        <div
          className={`relative w-14 h-14 rounded-full border bg-white flex items-center justify-center z-50 shadow-sm transition-colors duration-1000 ${isPlaying ? "border-orange-500/30" : "border-black/10"}`}
        >
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-1000 ${isPlaying ? "bg-orange-500/40" : "bg-black/20"}`}
          />
          <motion.div
            initial={false}
            animate={{ rotate: isPlaying ? -15 : -35 }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className={`absolute top-1/2 left-1/2 w-px h-[320px] transition-colors duration-1000 origin-top ${isPlaying ? "bg-orange-500/30" : "bg-black/10"}`}
          >
            <div
              className={`w-10 h-10 border rounded-sm absolute -bottom-10 -left-5 bg-white flex items-center justify-center shadow-md transition-colors duration-1000 ${isPlaying ? "border-orange-500/30" : "border-black/10"}`}
            >
              <div
                className={`w-px h-8 rounded-full transition-colors duration-1000 ${isPlaying ? "bg-orange-500/40" : "bg-black/20"}`}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </figure>
  );
};
