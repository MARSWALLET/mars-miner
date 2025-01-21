import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationCode,
      },
    })

    // TODO: Send verification email with code

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

