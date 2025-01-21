import TelegramBot from "node-telegram-bot-api"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true })
const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI!)

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
})

const User = mongoose.model("User", UserSchema)

const MinerSchema = new mongoose.Schema({
  name: String,
  hashPower: Number,
  price: Number,
  image: String,
})

const Miner = mongoose.model("Miner", MinerSchema)

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  type: String,
  timestamp: { type: Date, default: Date.now },
})

const Transaction = mongoose.model("Transaction", TransactionSchema)

const AchievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  condition: Object,
})

const Achievement = mongoose.model("Achievement", AchievementSchema)

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  let user = await User.findOne({ telegramId: chatId.toString() })

  if (!user) {
    const referralCode = Math.random().toString(36).substring(7)
    user = new User({
      telegramId: chatId.toString(),
      name: msg.from?.first_name,
      referralCode,
    })
    await user.save()
  }

  bot.sendMessage(chatId, "Welcome to MarsMiner!", {
    reply_markup: {
      keyboard: [
        [{ text: "Open Dashboard", web_app: { url: `${process.env.WEBAPP_URL}` } }],
        ["Balance", "Miners"],
        ["Deposit", "Withdraw"],
        ["Referral", "Leaderboard"],
        ["Achievements"],
      ],
    },
  })
})

bot.onText(/Balance/, async (msg) => {
  const chatId = msg.chat.id
  const user = await User.findOne({ telegramId: chatId.toString() })

  if (user) {
    bot.sendMessage(chatId, `Your current balance: ₦${user.walletBalance.toFixed(2)}`)
  } else {
    bot.sendMessage(chatId, "User not found. Please start the bot with /start")
  }
})

bot.onText(/Miners/, async (msg) => {
  const chatId = msg.chat.id
  const user = await User.findOne({ telegramId: chatId.toString() }).populate("miners")

  if (user) {
    if (user.miners.length > 0) {
      const minersList = user.miners.map((miner: any) => `${miner.name} - Hash Power: ${miner.hashPower}`).join("\n")
      bot.sendMessage(chatId, `Your miners:\n${minersList}`)
    } else {
      bot.sendMessage(chatId, "You don't have any miners yet. Buy some from the dashboard!")
    }
  } else {
    bot.sendMessage(chatId, "User not found. Please start the bot with /start")
  }
})

bot.onText(/Referral/, async (msg) => {
  const chatId = msg.chat.id
  const user = await User.findOne({ telegramId: chatId.toString() })

  if (user) {
    bot.sendMessage(
      chatId,
      `Your referral code is: ${user.referralCode}\nShare this code with your friends and earn 5% of their deposits!`,
    )
  } else {
    bot.sendMessage(chatId, "User not found. Please start the bot with /start")
  }
})

bot.onText(/Leaderboard/, async (msg) => {
  const chatId = msg.chat.id
  const topUsers = await User.find().sort("-hashPower").limit(10)

  if (topUsers.length > 0) {
    const leaderboard = topUsers.map((user, index) => `${index + 1}. ${user.name} - ${user.hashPower} HP`).join("\n")
    bot.sendMessage(chatId, `Top 10 Miners:\n${leaderboard}`)
  } else {
    bot.sendMessage(chatId, "No users found in the leaderboard yet.")
  }
})

bot.onText(/Achievements/, async (msg) => {
  const chatId = msg.chat.id
  const user = await User.findOne({ telegramId: chatId.toString() }).populate("achievements")

  if (user) {
    if (user.achievements.length > 0) {
      const achievementsList = user.achievements
        .map((achievement: any) => `${achievement.name} - ${achievement.description}`)
        .join("\n")
      bot.sendMessage(chatId, `Your achievements:\n${achievementsList}`)
    } else {
      bot.sendMessage(chatId, "You haven't unlocked any achievements yet. Keep mining!")
    }
  } else {
    bot.sendMessage(chatId, "User not found. Please start the bot with /start")
  }
})

app.get("/api/user/:telegramId", async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId }).populate("miners").populate("achievements")
  res.json(user)
})

app.get("/api/miners", async (req, res) => {
  const miners = await Miner.find()
  res.json(miners)
})

app.post("/api/buy-miner", async (req, res) => {
  const { telegramId, minerId } = req.body
  const user = await User.findOne({ telegramId })
  const miner = await Miner.findById(minerId)

  if (user && miner && user.walletBalance >= miner.price) {
    user.walletBalance -= miner.price
    user.hashPower += miner.hashPower
    user.miners.push(miner._id)
    await user.save()

    const transaction = new Transaction({
      userId: user._id,
      amount: -miner.price,
      type: "purchase",
    })
    await transaction.save()

    // Check for achievements
    await checkAchievements(user._id)

    res.json({ success: true, message: "Miner purchased successfully" })
  } else {
    res.status(400).json({ success: false, message: "Unable to purchase miner" })
  }
})

app.get("/api/transactions/:telegramId", async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId })
  if (user) {
    const transactions = await Transaction.find({ userId: user._id }).sort({ timestamp: -1 }).limit(10)
    res.json(transactions)
  } else {
    res.status(404).json({ message: "User not found" })
  }
})

app.get("/api/leaderboard", async (req, res) => {
  const topUsers = await User.find().sort("-hashPower").limit(10)
  res.json(topUsers)
})

app.post("/api/update-bank-info", async (req, res) => {
  const { userId, bankName, accountNumber, accountName } = req.body
  const user = await User.findById(userId)

  if (user) {
    user.bankInfo = { bankName, accountNumber, accountName }
    await user.save()
    res.json({ success: true, message: "Bank information updated successfully" })
  } else {
    res.status(404).json({ success: false, message: "User not found" })
  }
})

app.get("/api/achievements/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).populate("achievements")
  if (user) {
    const allAchievements = await Achievement.find()
    const userAchievements = user.achievements.map((a: any) => a._id.toString())
    const achievements = allAchievements.map((achievement) => ({
      ...achievement.toObject(),
      unlocked: userAchievements.includes(achievement._id.toString()),
    }))
    res.json(achievements)
  } else {
    res.status(404).json({ message: "User not found" })
  }
})

async function checkAchievements(userId: string) {
  const user = await User.findById(userId)
  if (!user) return

  const achievements = await Achievement.find()
  for (const achievement of achievements) {
    if (!user.achievements.includes(achievement._id)) {
      const condition = achievement.condition as any
      if (condition.type === "minerCount" && user.miners.length >= condition.value) {
        user.achievements.push(achievement._id)
      } else if (condition.type === "hashPower" && user.hashPower >= condition.value) {
        user.achievements.push(achievement._id)
      }
    }
  }
  await user.save()
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

