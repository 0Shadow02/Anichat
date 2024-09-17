import { authoptions } from "@/app/lib/authoptions"
import { ChatClient } from "@/components/client"
import prisma from "@/lib/prismadb"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

interface ChatIdPageProps {
   params: {
    chatId: string
   }
}
export default async function ChatIdPage({params}:ChatIdPageProps){
    const session = await getServerSession(authoptions)
    const userId = session.user.id
   const character = await prisma.character.findUnique({
      where:{
        id: params.chatId
      },
      include:{
        messages:{
            orderBy:{
                createdAt:"asc",

            },
            where:{
                userId: userId,
            }
        },
        _count:{
            select:{
                messages:true
            }
        }
      }
   })
   if (!character) {
    return redirect("/")
   }
    return (
        <ChatClient character={character} />
    )
}                                                         