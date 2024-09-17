"use client"

import axios from "axios";
import { Character, Message } from "@prisma/client"
import { Button } from "./ui/button";
import { ChevronLeft, Edit, MessageSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { BotAvatar } from "./bot-avatar";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ChatHeaderProps {
    character: Character & {
        messages: Message[];
        _count:{
            messages: number;
        }
    }
}
export const ChatHeader =({
    character
}:ChatHeaderProps)=>{
    const navigate = useRouter()
    const session = useSession()
    const user = session.data?.user
  
    const {toast} = useToast()

    const onDelete = async ()=>{
        try {
            await axios.delete(`/api/character/${character.id}`)
            toast({
                description: "Success"
            })
            navigate.refresh();
            navigate.push('/')
        } catch (error) {
            toast({
                description:"Something went wrong",
                variant:"destructive"
            })
        }
    }
    return <div className=" flex w-full  justify-between items-center border-b border-primary/10 pb-4">
        <div className="flex gap-x-2 items-center">
            <Button onClick={()=> navigate.back()} size={"icon"} variant={"ghost"}>
                <ChevronLeft className=" h-8 w-8" />
            </Button>
            <BotAvatar src={character.src}/>
            <div className="flex flex-col gap-y-1">
                <div className=" flex items-center gap-x-2">
                    <p className="font-bold">
                        {character.name}
                    </p>
                    <div className=" flex items-center text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3 mr-1"/>
                        {character._count.messages}
                    </div>
                </div>
                <p className=" text-xs text-muted-foreground">
                    Created by {character.userName}
                </p>
            </div>
        </div>
        {user?.id === character.userId && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"secondary"} size={"icon"}>
                        <MoreVertical/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={()=> navigate.push(`/character/${character.id}`)}>
                    <Edit className=" w-4 h-4 mr-2"/>
                    Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} >
                    <Trash className=" w-4 h-4 mr-2"/>
                    Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
    </div>
}