import { Categories } from "@/components/categories";
import { SearchInput } from "@/components/searchinput";
import prisma from "@/lib/prismadb";

export default async function RootPage(){
    const categories = await prisma.category.findMany({
        orderBy:{
            name:'asc'
        }
    }
    ); 
    return <div className="h-full p-4 space-y-2">
        <SearchInput/>
        <Categories data={categories}/>
    </div>
}