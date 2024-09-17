import { Categories } from "@/components/categories";
import { Characters } from "@/components/characters";
import { SearchInput } from "@/components/searchinput";
import prisma from "@/lib/prismadb";

interface RootPageProps {
    searchParams:{
        categoryId: string,
        name: string
    }
}

export default async function RootPage({searchParams}:RootPageProps){
    const data = await prisma.character.findMany({
        where:{
            categoryId: searchParams.categoryId,
            name: {
                search: searchParams.name
            }
        },
        orderBy:{
            createdAt: "desc"
        },

        include: {
            _count:{
                select:{
                    messages:true
                }
            }
        }

    })
    const categories = await prisma.category.findMany({
        orderBy:{
            name:'asc'
        }
    }
    ); 
    return <div className="h-full p-4 space-y-2">
        <SearchInput/>
        <Categories data={categories}/>
        <Characters data={data} />
    </div>
}