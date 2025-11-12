import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, className = '', delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -2, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" } : undefined}
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}