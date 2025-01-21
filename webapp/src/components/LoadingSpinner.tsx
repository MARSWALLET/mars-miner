import type React from "react"
import { motion } from "framer-motion"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <motion.div
        className="loading-spinner"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
}

export default LoadingSpinner

