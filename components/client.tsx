"use client"
import { useCompletion } from "ai/react"
import { FormEvent, useState } from "react";
import { Character, Message } from "@prisma/client"
import { ChatHeader } from "./chat-header";
import { useRouter } from "next/navigation";
import { ChatForm } from "./chat-form";
import { ChatMessages } from "./chat-messages";
import { ChatMessageProps } from "./chat-message";

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
    const [messages, setMessages] = useState<ChatMessageProps[]>(character.messages)
    const navigate = useRouter()
    const {
        input,
        isLoading,
        handleInputChange,
        handleSubmit,
        setInput,
    } = useCompletion({
        api: `/api/chat/${character.id}}`,
        onFinish(prompt ,completion){
            const systemMessage:ChatMessageProps = {
                role : "system",
                content: completion,
            }
            setMessages((current)=>[... current,systemMessage])
            setInput("")
            navigate.refresh();
        }
    })

    const onSubmit = (e: FormEvent <HTMLFormElement>) =>{
        const userMessage:ChatMessageProps ={
            role: "user",
            content : input,
        }
        setMessages((current)=>[... current,userMessage])

        handleSubmit(e)
    }

    return <div className=" flex flex-col h-full p-4 space-y-2">
        <ChatHeader character={character} />
       <ChatMessages
       character={character}
       isLoading={isLoading}
       messages={messages}
       />
        <ChatForm
            isLoading={isLoading}
            input={input}
            handleInputChange={handleInputChange}
            onSubmit={onSubmit}
        />
    </div>
}