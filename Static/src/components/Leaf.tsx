import { motion } from 'motion/react';

interface LeafProps {
  delay: number;
  duration: number;
  startX: number;
}

export function Leaf({ delay, duration, startX }: LeafProps) {
  return (
    <motion.div
      className="absolute"
      initial={{
        top: -20,
        left: startX,
        rotate: 0,
        opacity: 0.7,
      }}
      animate={{
        top: '100vh',
        left: startX + Math.sin(delay) * 100,
        rotate: 360,
        opacity: [0.7, 0.9, 0.7, 0.5],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C12 2 7 7 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7 12 2 12 2Z"
          fill="#8b5a3c"
          opacity="0.8"
        />
        <path
          d="M12 2C12 2 8 6 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 6 12 2 12 2Z"
          fill="#c85347"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  );
}
