import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface MiningSimulationProps {
  user: any
}

const MiningSimulation: React.FC<MiningSimulationProps> = ({ user }) => {
  const [miningReward, setMiningReward] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMiningReward((prevReward) => {
        const newReward = prevReward + user.hashPower / 3600 // Simulating mining rewards per second
        return Number.parseFloat(newReward.toFixed(8))
      })

      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1
        }
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [user.hashPower])

  const claimRewards = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/claim-mining-rewards`, {
        userId: user.id,
        reward: miningReward,
      })
      ;(window as any).Telegram.WebApp.showAlert(`You've claimed ₦${miningReward.toFixed(2)} in mining rewards!`)
      setMiningReward(0)
      setTimeLeft(3600) // Set cooldown to 1 hour
    } catch (error) {
      console.error("Error claiming mining rewards:", error)
      ;(window as any).Telegram.WebApp.showAlert("Failed to claim mining rewards. Please try again.")
    }
  }

  return (
    <div className="mining-simulation">
      <h3>Mining Simulation</h3>
      <p>Current Mining Reward: ₦{miningReward.toFixed(2)}</p>
      {timeLeft > 0 ? (
        <p>
          Next claim available in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={claimRewards}
          className="claim-button"
        >
          Claim Mining Rewards
        </motion.button>
      )}
    </div>
  )
}

export default MiningSimulation

