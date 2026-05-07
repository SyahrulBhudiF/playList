import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  isVisible?: boolean;
}

const alertStyles = {
  error: {
    bg: 'bg-red-50/80',
    text: 'text-red-600',
    icon: <XCircle className="text-red-500" size={16} strokeWidth={3} />
  },
  success: {
    bg: 'bg-green-50/80',
    text: 'text-green-600',
    icon: <CheckCircle className="text-green-500" size={16} strokeWidth={3} />
  },
  info: {
    bg: 'bg-white/80',
    text: 'text-black',
    icon: <Info className="text-black" size={16} strokeWidth={3} />
  },
  warning: {
    bg: 'bg-amber-50/80',
    text: 'text-amber-600',
    icon: <AlertCircle className="text-amber-500" size={16} strokeWidth={3} />
  }
};

export function Alert({ type = 'info', title, message, onClose, isVisible = true }: AlertProps) {
  const styles = alertStyles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full rounded-2xl ${styles.bg} p-4 backdrop-blur-xl flex items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">{styles.icon}</div>
            <div className="flex flex-col">
              {title && (
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30 leading-none mb-1">
                  {title}
                </span>
              )}
              <span className={`text-sm font-bold tracking-tight uppercase leading-none ${styles.text}`}>
                {message}
              </span>
            </div>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/5 transition-all text-black/10 hover:text-black"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
