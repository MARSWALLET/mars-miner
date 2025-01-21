import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { motion } from "framer-motion"

interface DailyBonusProps {
  userId: string
}

const DailyBonus: React.FC<DailyBonusProps> = ({ userId }) => {
  const [lastClaimed, setLastClaimed] = useState<Date | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyBonusStatus()
  }, [userId])

  const fetchDailyBonusStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/daily-bonus/${userId}`)
      setLastClaimed(new Date(response.data.lastClaimed))
      setCanClaim(response.data.canClaim)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching daily bonus status:", error)
      setLoading(false)
    }
  }

  const claimBonus = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/claim-daily-bonus`, { userId })
      setLastClaimed(new Date())
      setCanClaim(false)
      ;(window as any).Telegram.WebApp.showAlert(`You've claimed your daily bonus of ₦${response.data.bonusAmount}!`)
    } catch (error) {
      console.error("Error claiming daily bonus:", error)
      ;(window as any).Telegram.WebApp.showAlert("Failed to claim daily bonus. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="daily-bonus">
      {canClaim ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={claimBonus}
          className="claim-button"
        >
          Claim Daily Bonus
        </motion.button>
      ) : (
        <p>
          You've already claimed your daily bonus. Next bonus available in{" "}
          {lastClaimed && (
            <span className="countdown">
              {Math.max(0, 24 - Math.floor((new Date().getTime() - lastClaimed.getTime()) / (1000 * 60 * 60)))} hours
            </span>
          )}
        </p>
      )}
    </div>
  )
}

export default DailyBonus

