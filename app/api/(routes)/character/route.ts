import { authoptions } from "@/app/lib/authoptions";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const body = await req.json();
        const session = await getServerSession(authoptions)
        const user= session.user
        const {src , name , description , instructions, seed , categoryId } =body
   
        if (!session) {
            return NextResponse.json("Unauthorized access",{status:401})
        }
        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return NextResponse.json("Missing required fields",{status:400}) 
        }
       

        const character = await prisma.character.create({
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
        console.log("[CHARACTER_CREATION]", error)
        return new NextResponse("Internal Error" ,{status: 500})
    }
}

