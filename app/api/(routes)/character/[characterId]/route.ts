import { authoptions } from "@/app/lib/authoptions";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}: {params: {characterId: string}} ) {
   
    try {
        const body = await req.json();
        const session = await getServerSession(authoptions)
        const user= session.user
        const {src , name , description , instructions, seed , categoryId } =body
        
        if (!params.characterId) {
            return NextResponse.json("CharacterId is required",{status:400})
        }

        if (!session) {
            return NextResponse.json("Unauthorized access",{status:401})
        }
        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return NextResponse.json("Missing required fields",{status:400}) 
        }
       

        const character = await prisma.character.update({
            where:{
                id: params.characterId
            },
            data:{
                categoryId,
                userId:user.id,
                userName:user.name,
                src,
                name,
                description,
                instructions,
                seed
            }
        })
        return NextResponse.json(character)


    } catch (error) {
        console.log("[CHARACTER_UPDATE]", error)
        return new NextResponse("Internal Error" ,{status: 500})
    }
}