"use client"

import { useState } from "react"
import axios from "axios"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post("/api/auth/register", { email, password, name })
      alert("Registration successful! Please check your email for verification.")
    } catch (error) {
      alert("Registration failed. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <button type="submit">Register</button>
    </form>
  )
}

