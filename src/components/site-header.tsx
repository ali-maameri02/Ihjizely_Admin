import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BellIcon, SearchIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import logo from '../assets/ihjzlyapplogo.png'

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 h-16 shrink-0 w-full z-[9999] border-b bg-white flex items-center justify-between px-4">
      {/* Sidebar Trigger */}
    <div className="flex group-data-[collapsible=icon]:z-[9999999] flex items-center justify-end  gap-5  w-full">
    <div className="flex items-center gap-2 w-1/2 shadow-sm rounded-md p-2 py-0 bg-muted/20">
        <SearchIcon color="gray" />
        <Input
          placeholder="Search..."
          className="h-9 w-full rounded-md shadow-none border-none bg-transparent px-3 py-2 pl-8 text-sm 
            ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:w-full focus:outline-none focus:border-0"
        />
      </div>

      {/* Right Side Icons / User */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>

        {/* Avatar */}
        <Avatar>
          <AvatarImage src={logo} alt="User" />
          <AvatarFallback>
            <span>JD</span>
          </AvatarFallback>
        </Avatar>
      </div>
    </div>

      {/* Search Bar */}
   
    </header>
  )
}