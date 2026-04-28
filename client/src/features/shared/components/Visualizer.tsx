import { motion } from 'framer-motion';

interface VisualizerProps {
    isPlaying: boolean;
    barCount?: number;
    color?: string;
    opacity?: number;
}

export const Visualizer = ({ 
    isPlaying, 
    barCount = 100, 
    color = "bg-orange-500", 
    opacity = 0.5 
}: VisualizerProps) => {
    return (
        <section 
            aria-label="Audio Visualizer"
            className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center gap-2 px-12 pointer-events-none overflow-hidden"
            style={{ opacity }}
        >
            {Array.from({ length: barCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-1.5 ${color} rounded-t-full`}
                    animate={{ 
                        height: isPlaying ? [
                            Math.random() * 50 + 10,
                            Math.random() * 120 + 20,
                            Math.random() * 50 + 10
                        ] : 6 
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: Math.random() * 0.4 + 0.3,
                        ease: "easeInOut" 
                    }}
                />
            ))}
        </section>
    );
};
