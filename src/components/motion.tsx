import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';

// ─── Page transition variants ───────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── Stagger container ─────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// ─── Fade up item ───────────────────────────────────────────────────────────
export const fadeUpItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Scale in item ──────────────────────────────────────────────────────────
export const scaleInItem: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Slide in from left ─────────────────────────────────────────────────────
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Modal overlay & content ────────────────────────────────────────────────
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.15 },
  },
};

// ─── Reusable wrapper components ────────────────────────────────────────────

/**
 * AnimatedPage — wraps each tab/page for consistent enter/exit transitions
 */
export const AnimatedPage: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * StaggerList — stagger-animates its children
 */
export const StaggerList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * FadeUp — a single stagger child that fades up
 */
export const FadeUp: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay,
}) => (
  <motion.div
    variants={fadeUpItem}
    initial="initial"
    animate="animate"
    className={className}
    transition={delay !== undefined ? { delay } : undefined}
  >
    {children}
  </motion.div>
);

/**
 * AnimatedCard — card with hover lift + subtle scale
 */
export const AnimatedCard: React.FC<
  HTMLMotionProps<'div'> & { children: React.ReactNode }
> = ({ children, className = '', ...props }) => (
  <motion.div
    variants={fadeUpItem}
    whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * AnimatedNumber — animates a number changing with a subtle spring
 */
export const AnimatedNumber: React.FC<{
  value: number;
  format?: (n: number) => string;
  className?: string;
}> = ({ value, format, className = '' }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.4, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {format ? format(value) : value}
    </motion.span>
  );
};

/**
 * AnimatedModal — modal with backdrop animation + content spring
 */
export const AnimatedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, children, maxWidth = 'max-w-lg' }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          variants={modalVariants}
          className={`relative ${maxWidth} w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden`}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * AnimatedBadge — pulse-on-mount badge component
 */
export const AnimatedBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }}
    className={className}
  >
    {children}
  </motion.span>
);

export { AnimatePresence, motion };
