import { authoptions } from "@/app/lib/authoptions"
import NextAuth from "next-auth"

const handler = NextAuth(authoptions)
// authoptions
export { handler as GET, handler as POST }