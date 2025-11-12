import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: ReactNode
  bgColor: string
  iconColor: string
  delay?: number
  tooltip: string
  detailedInfo?: ReactNode
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  iconColor,
  delay = 0,
  tooltip,
  detailedInfo,
  onClick
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleCardClick = () => {
    if (detailedInfo) {
      setShowModal(true)
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        onClick={handleCardClick}
        className={`bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all ${
          detailedInfo ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{value}</span>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTooltip(!showTooltip)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
              {showTooltip && (
                <div className="absolute z-50 right-0 top-8 w-72 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl animate-in fade-in duration-200">
                  <div className="whitespace-pre-line">{tooltip}</div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900" />
                </div>
              )}
            </div>
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </motion.div>

      <AnimatePresence>
        {showModal && detailedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">{detailedInfo}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
