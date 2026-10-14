import { motion } from 'framer-motion'

/**
 * Lightweight wrapper to animate page transitions.
 * Usage:
 * <PageTransition>
 *   <YourPage />
 * </PageTransition>
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
