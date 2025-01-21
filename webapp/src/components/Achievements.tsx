import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

interface AchievementsProps {
  userId: string
}

const Achievements: React.FC<AchievementsProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/achievements/${userId}`)
        setAchievements(response.data)
      } catch (error) {
        console.error("Error fetching achievements:", error)
      }
    }

    fetchAchievements()
  }, [userId])

  return (
    <div className="achievements-grid">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"}`}
          whileHover={{ scale: 1.05 }}
        >
          <img src={achievement.icon || "/placeholder.svg"} alt={achievement.name} className="achievement-icon" />
          <h4>{achievement.name}</h4>
          <p>{achievement.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default Achievements

