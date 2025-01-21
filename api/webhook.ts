import type { NextApiRequest, NextApiResponse } from "next"
import TelegramBot from "node-telegram-bot-api"
import mongoose from "mongoose"
import { User, Miner, Transaction, Achievement } from "../models/schemas"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { webHook: true })

mongoose.connect(process.env.MONGODB_URI!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { body } = req
    await bot.processUpdate(body)
    res.status(200).json({ message: "OK" })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  let user = await User.findOne({ telegramId: chatId.toString() })

  if (!user) {
    const referralCode = Math.random().toString(36).substring(7)
    user = new User({
      telegramId: chatId.toString(),
      name: msg.from?.first_name,
      referralCode,
      isActive: true,
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
        ["Achievements", "Daily Bonus"],
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
  const topUsers = await User.find({ isActive: true }).sort("-hashPower").limit(10)

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

bot.onText(/Daily Bonus/, async (msg) => {
  const chatId = msg.chat.id
  const user = await User.findOne({ telegramId: chatId.toString() })

  if (user) {
    const now = new Date()
    const lastBonusDate = user.lastDailyBonus || new Date(0)

    if (
      now.getDate() !== lastBonusDate.getDate() ||
      now.getMonth() !== lastBonusDate.getMonth() ||
      now.getFullYear() !== lastBonusDate.getFullYear()
    ) {
      const bonusAmount = 10 // ₦10 daily bonus
      user.walletBalance += bonusAmount
      user.lastDailyBonus = now
      await user.save()

      const transaction = new Transaction({
        userId: user._id,
        amount: bonusAmount,
        type: "daily_bonus",
      })
      await transaction.save()

      bot.sendMessage(
        chatId,
        `You've claimed your daily bonus of ₦${bonusAmount}! Your new balance is ₦${user.walletBalance.toFixed(2)}`,
      )
    } else {
      bot.sendMessage(chatId, "You've already claimed your daily bonus today. Come back tomorrow!")
    }
  } else {
    bot.sendMessage(chatId, "User not found. Please start the bot with /start")
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

export { bot }

