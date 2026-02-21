import { useState, useEffect } from "react";
import { differenceInSeconds, parseISO } from "date-fns";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const target = new Date(targetDate);
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);
      
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onComplete?.();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex gap-4 justify-center py-8">
      <TimeUnit value={days} label="HARI" />
      <TimeUnit value={hours} label="JAM" />
      <TimeUnit value={minutes} label="MENIT" />
      <TimeUnit value={seconds} label="DETIK" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-2xl mb-2"
      >
        <span className="text-2xl md:text-4xl font-bold text-primary font-display">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-xs md:text-sm font-medium text-muted-foreground tracking-widest">
        {label}
      </span>
    </div>
  );
}
