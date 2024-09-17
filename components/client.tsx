"use client"

import { Character, Message } from "@prisma/client"
import { ChatHeader } from "./chat-header";

interface ChatClientProps {
    character: Character & {
        messages: Message[];
        _count:{
            messages: number;
        }
    }
}
export const ChatClient =({
    character
}:ChatClientProps)=>{
    return <div className=" flex flex-col h-full p-4 space-y-2">
        <ChatHeader character={character} />
    </div>
}