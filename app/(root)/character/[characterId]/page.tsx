import { authoptions } from "@/app/lib/authoptions";
import { CharacterForm } from "@/components/characterform";
import prisma from "@/lib/prismadb"
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";


interface CharacterIdPageProps {
   params:{
    characterId : string
   }
} 
export default async function CharacterIdPage ({params}:CharacterIdPageProps){
   const session = await getServerSession(authoptions)
   const userId =session.user.id
   if (!userId) {
    return signIn()
   
   }
    const character = await prisma.character.findUnique({
        where: {
            id: params.characterId,
            userId
        }
    })
    const categories = await prisma.category.findMany();
    return <div>
        <CharacterForm 
          initialData={character}
          categories={categories}
        
        />
    </div>
}