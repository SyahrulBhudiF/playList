import { motion } from 'framer-motion';
import { SkipBack, SkipForward } from 'lucide-react';

// Assets
import playIcon from '@/assets/PLay.svg';
import pauseIcon from '@/assets/Pause.svg';
import logo from '@/assets/logo.svg';

interface TurntableProps {
    isPlaying: boolean;
    onToggle?: () => void;
    progress: number;
    scale?: number;
    accentColor?: string;
}

export const Turntable = ({ 
    isPlaying, 
    onToggle, 
    progress 
}: TurntableProps) => {
    return (
        <figure className="relative w-full aspect-square max-w-[550px] flex items-center justify-center p-10">
            
            {/* ATMOSPHERIC RADIANCE */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,transparent_75%)] blur-[100px]`} />

            {/* PROGRESS RING (OUTER) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-[90%] h-[90%] -rotate-90">
                    <circle cx="50%" cy="50%" r="49%" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    <motion.circle
                        cx="50%" cy="50%" r="49%" fill="none"
                        stroke="rgba(249,115,22,1)"
                        strokeWidth="2"
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
                        className={`absolute rounded-full border border-orange-500/50 transition-all duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                        style={{ inset: `${inset}%` }} 
                    />
                ))}
            </div>
            
            {/* THE SCHEMATIC VINYL DISC (SPINNING LAYER) */}
            <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 40, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                className="relative w-[82%] h-[82%] rounded-full flex items-center justify-center bg-white border-2 border-orange-500/50 overflow-hidden shadow-xl shadow-orange-500/10 will-change-transform"
            >
                {/* GROOVE TEXTURES */}
                <svg className="absolute inset-0 w-full h-full opacity-100">
                    {Array.from({ length: 45 }).map((_, i) => (
                        <circle 
                            key={i} 
                            cx="50%" cy="50%" 
                            r={`${4 + i * 1.05}%`} 
                            fill="none" 
                            stroke="rgba(249,115,22,0.5)" 
                            strokeWidth="1.2" 
                        />
                    ))}
                </svg>
                
                {/* TECHNICAL ORANGE REFRACTION */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(249,115,22,0.1)_25%,transparent_50%,rgba(249,115,22,0.1)_75%,transparent_100%)]" />
            </motion.div>

            {/* CENTER LABEL HUB (STATIONARY) */}
            <div className="absolute z-20 w-[28%] h-[28%] rounded-full flex items-center justify-center bg-white border-2 border-orange-500/50 shadow-2xl shadow-orange-500/10">
                {onToggle ? (
                    <button 
                        onClick={onToggle}
                        className="relative z-30 w-full h-full flex items-center justify-center active:scale-95 transition-transform group"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                            {isPlaying ? (
                                <img src={pauseIcon} alt="Pause" className="relative w-full h-full opacity-100 transition-opacity contrast-125" />
                            ) : (
                                <img src={playIcon} alt="Play" className="relative w-full h-full opacity-100 translate-x-1.5 transition-opacity contrast-125" />
                            )}
                        </div>
                    </button>
                ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                         {isPlaying ? (
                            <img src={pauseIcon} alt="Pause" className="relative w-full h-full opacity-100 contrast-125" />
                        ) : (
                            <img src={playIcon} alt="Play" className="relative w-full h-full opacity-100 translate-x-1.5 contrast-125" />
                        )}
                    </div>
                )}
                
                <div className="absolute -top-10 w-5 h-5 z-40 opacity-80">
                    <img src={logo} alt="Logo" className="relative w-full h-full" />
                </div>
            </div>

            {/* NEEDLE ASSEMBLY */}
            <div className="absolute -top-20 right-[-80px] w-1/2 h-full pointer-events-none z-30 flex justify-end p-24 origin-top-right">
                <div className="relative w-14 h-14 rounded-full border border-orange-500/50 bg-white flex items-center justify-center z-50 shadow-sm shadow-orange-500/20">
                    <div className="w-2 h-2 bg-orange-500/60 rounded-full" />
                    <motion.div 
                        initial={false}
                        animate={{ rotate: isPlaying ? 5 : -25 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-1/2 left-1/2 w-px h-[320px] bg-orange-500/60 origin-top"
                    >
                        <div className="w-10 h-10 border border-orange-500/60 rounded-sm absolute -bottom-10 -left-5 bg-white flex items-center justify-center shadow-md">
                            <div className="w-px h-8 bg-orange-500/90 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* TRANSPORT CONTROLS */}
            <div className="absolute -left-36 top-1/2 -translate-y-1/2 z-40">
                <button className="w-16 h-16 flex items-center justify-center text-black/80 hover:text-black transition-all">
                    <SkipBack size={48} strokeWidth={1} />
                </button>
            </div>
            <div className="absolute -right-36 top-1/2 -translate-y-1/2 z-40">
                <button className="w-16 h-16 flex items-center justify-center text-black/80 hover:text-black transition-all">
                    <SkipForward size={48} strokeWidth={1} />
                </button>
            </div>
        </figure>
    );
};
