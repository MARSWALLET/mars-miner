"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      fetchUserData(token)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user data", error)
      router.push("/login")
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Wallet Balance: ₦{user.walletBalance}</p>
      <p>Hash Power: {user.hashPower} HP</p>
      {/* Add more dashboard components here */}
    </div>
  )
}

