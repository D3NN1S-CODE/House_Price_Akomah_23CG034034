import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface WindowProps {
  delay: number;
  top: string;
  left: string;
}

export function Window({ delay, top, left }: WindowProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(prev => !prev);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute" style={{ top, left }}>
      <div className="relative w-24 h-32">
        {/* Window frame */}
        <div className="absolute inset-0 bg-[#5c3d2e] rounded-lg p-2">
          {/* Window glass background */}
          <div className="w-full h-full bg-gradient-to-br from-blue-200/40 to-blue-300/60 rounded overflow-hidden">
            {/* Window panes */}
            <div className="relative w-full h-full">
              {/* Left pane */}
              <motion.div
                className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-blue-300/50 to-blue-400/70 border-r-2 border-[#5c3d2e]"
                initial={{ scaleX: 1, originX: 0 }}
                animate={{ scaleX: isOpen ? 0.3 : 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {/* Right pane */}
              <motion.div
                className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-br from-blue-300/50 to-blue-400/70"
                initial={{ scaleX: 1, originX: 1 }}
                animate={{ scaleX: isOpen ? 0.3 : 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {/* Center divider */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#5c3d2e]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
