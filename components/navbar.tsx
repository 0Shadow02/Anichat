import {Sparkles} from 'lucide-react'
import {Poppins} from 'next/font/google'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import { MobileSiderbar } from '@/components/mobile-sidebar'
const font = Poppins({
    weight: "600",
    subsets: ["latin"]
})
export const Navbar = () =>{
    return (
        <div className='fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16'>
            <div className='flex items-center'>
                <MobileSiderbar/>
                <Link href="/">
                    <div className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary",font.className)}>
                        AiChat
                    </div>
                </Link>
            </div>
            <div className='flex items-center gap-x-3'>
            <Button variant={"premium"} size={'sm'}>
                Upgrade 
                <Sparkles className='h-4 w-4 fill-white gap-x-3' />
            </Button>
            <ModeToggle/>
            <img className="w-10 h-10 rounded-full" src="https://cdn.pixabay.com/photo/2023/08/24/08/21/anime-8210121_1280.jpg" alt="Rounded avatar" />
            </div>
        </div>
    )
}