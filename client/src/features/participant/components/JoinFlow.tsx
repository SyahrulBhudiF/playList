import { motion } from 'framer-motion';
import { Radio, Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/input';
import { Button } from '@/shared/components/button';

interface JoinFlowProps {
  passkey: string;
  onPasskeyChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isResolving: boolean;
}

export function JoinFlow({ passkey, onPasskeyChange, onSubmit, isResolving }: JoinFlowProps) {
  return (
    <motion.div 
      key="join-flow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6"
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-orange-500/10">
            <Radio size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black tracking-tight mb-2">Enter Room Code</h1>
          <p className="text-sm text-black/40 font-bold">Enter the 5-digit number to join the broadcast.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="relative group">
            <Input 
              type="text" 
              maxLength={5}
              value={passkey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasskeyChange(e.target.value)}
              placeholder="00000"
              variant="premium-code"
              autoFocus
            />
          </div>
          
          <Button 
            disabled={passkey.length !== 5 || isResolving}
            variant="premium"
            className="w-full h-20 text-base"
          >
            {isResolving ? <Loader2 className="animate-spin" /> : "Access Broadcast"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
