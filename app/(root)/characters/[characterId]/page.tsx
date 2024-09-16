import { CharacterForm } from "@/components/characterform";
import prisma from "@/lib/prismadb"

interface CharacterIdPageProps {
   params:{
    characterId : string
   }
} 
export default async function CharacterIdPage ({params}:CharacterIdPageProps){
    const character = await prisma.character.findUnique({
        where: {
            id: params.characterId
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