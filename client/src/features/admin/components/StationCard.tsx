import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/shared/components/card';

interface Station {
  id: string;
  passkey: string;
}

interface StationCardProps {
  station: Station;
  onClick: () => void;
}

export function StationCard({ station, onClick }: StationCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      key={station.id}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card variant="premium" className="flex items-center justify-between group hover:border-orange-500/30 transition-all duration-500">
        <div>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
            <h3 className="font-bebas text-6xl tracking-widest leading-none">{station.id.toUpperCase()}</h3>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-black/30">
            Secure Access Channel: <span className="text-black font-mono ml-4 text-xl tracking-tighter">{station.passkey}</span>
          </p>
        </div>
        <div className="w-20 h-20 rounded-full bg-[#f8f8f6] flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-45 transition-all duration-500">
          <ArrowRight size={32} />
        </div>
      </Card>
    </motion.div>
  );
}
