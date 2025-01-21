import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  telegramId: String,
  name: String,
  walletBalance: { type: Number, default: 0 },
  hashPower: { type: Number, default: 0 },
  miners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Miner" }],
  referralCode: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
  },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achievement" }],
  isActive: { type: Boolean, default: true },
  lastDailyBonus: Date,
  lastMiningReward: Date,
})

const MinerSchema = new mongoose.Schema({
  name: String,
  hashPower: Number,
  price: Number,
  image: String,
})

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  type: String,
  timestamp: { type: Date, default: Date.now },
})

const AchievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  condition: Object,
})

export const User = mongoose.models.User || mongoose.model("User", UserSchema)
export const Miner = mongoose.models.Miner || mongoose.model("Miner", MinerSchema)
export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema)
export const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema)

