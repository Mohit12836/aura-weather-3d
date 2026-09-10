import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(245, 158, 11, 0.15)',
  onClick,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 md:p-6 overflow-hidden shadow-lg shadow-black/40 ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </motion.div>
  );
};
