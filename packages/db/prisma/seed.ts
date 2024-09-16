import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
    try {
        await prisma.category.createMany({
            data:[
                {name: "Anime Character"},
                {name: "Manga Character"},
                {name: "Manhwa Character"},
                {name: "Light Novel Character"},
                {name: "Game"},
                {name: "Elon"},
            ]
        })
    } catch (error) {
        console.error("Error seeding default categories", error)
        await prisma.$disconnect()
    }
}

main();