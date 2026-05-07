import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white border border-black/5 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden`}
          >
            {/* Header */}
            <div className="p-8 pb-0 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-black/30">
                {title}
              </h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Content */}
            <div className="p-10 pt-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
