import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"

export const MobileSiderbar = ()=>{
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4">
                <Menu />
            </SheetTrigger>
            <SheetContent side={"left"} className="p-0 bg-secondary pt-10 w-32">
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}