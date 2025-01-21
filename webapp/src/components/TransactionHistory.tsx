import type React from "react"
import { motion } from "framer-motion"

interface Transaction {
  _id: string
  amount: number
  type: string
  timestamp: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <ul className="transactions-list">
        {transactions.map((transaction) => (
          <motion.li
            key={transaction._id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`transaction-item ${transaction.amount >= 0 ? "positive" : "negative"}`}
          >
            <span>{transaction.type}</span>
            <span>₦{transaction.amount.toFixed(2)}</span>
            <span>{new Date(transaction.timestamp).toLocaleString()}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export default TransactionHistory

