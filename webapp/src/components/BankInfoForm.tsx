import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"

interface BankInfoFormProps {
  userId: string
}

const BankInfoForm: React.FC<BankInfoFormProps> = ({ userId }) => {
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/update-bank-info`, {
        userId,
        bankName,
        accountNumber,
        accountName,
      })
      ;(window as any).Telegram.WebApp.showAlert("Bank information updated successfully!")
    } catch (error) {
      console.error("Error updating bank information:", error)
      ;(window as any).Telegram.WebApp.showAlert("Failed to update bank information. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bank-info-form">
      <div className="form-group">
        <label htmlFor="bankName">Bank Name</label>
        <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="accountNumber">Account Number</label>
        <input
          type="text"
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="accountName">Account Name</label>
        <input
          type="text"
          id="accountName"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
        />
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="submit-button">
        Update Bank Information
      </motion.button>
    </form>
  )
}

export default BankInfoForm

