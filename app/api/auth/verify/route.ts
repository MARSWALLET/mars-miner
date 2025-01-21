import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationCode: null },
    })

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

