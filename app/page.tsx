import Link from "next/link"

export default function Home() {
  return (
    <div>
      <h1>Welcome to MarsMiner</h1>
      <Link href="/register">Register</Link>
      <Link href="/login">Login</Link>
    </div>
  )
}

