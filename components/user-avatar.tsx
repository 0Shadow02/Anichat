"use client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useSession } from "next-auth/react"

export function UserAvatar(){
    const session = useSession()
    const userImage = session.data?.user?.image
    return <div>
            <Avatar className=" h-12 w-12">
                <AvatarImage src={userImage ||""} />
            </Avatar>
    </div>
}