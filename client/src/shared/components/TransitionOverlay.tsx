import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";

interface TransitionOverlayProps {
  isVisible: boolean;
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#fdfdfc]"
        >
          {/* DECORATIVE RINGS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{
                  width: ["0vw", "150vw"],
                  height: ["0vw", "150vw"],
                  opacity: [0, 0.05, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute border border-orange-500 rounded-full"
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* PULSING LOGO CONTAINER */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.1, 1],
                opacity: 1,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 bg-orange-500 rounded-2xl blur-xl"
                />
                <div className="relative w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                  <Radio size={40} className="text-orange-500" />
                </div>
              </div>
            </motion.div>

            {/* TEXT REVEAL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-6xl font-bebas tracking-widest text-black mb-2">
                SIGNAL ACQUIRED
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500 animate-pulse">
                  Establishing Link
                </span>
                <div className="w-8 h-px bg-orange-500" />
              </div>
            </motion.div>
          </div>

          {/* BOTTOM SCANLINE DECOR */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-black/5 origin-center"
          >
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
