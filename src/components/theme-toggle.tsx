import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="glass-elite h-10 w-10 border-white/10 dark:border-white/5 rounded-elite-lg text-foreground hover:bg-muted/50 transition-all">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-elite border-white/10 dark:border-white/5 shadow-premium-lg rounded-elite-xl mt-2 min-w-[150px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer font-medium hover:bg-primary/10 hover:text-primary transition-colors py-2.5 px-3">
          <Sun className="mr-2 h-4 w-4" /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer font-medium hover:bg-primary/10 hover:text-primary transition-colors py-2.5 px-3">
          <Moon className="mr-2 h-4 w-4" /> Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer font-medium hover:bg-primary/10 hover:text-primary transition-colors py-2.5 px-3">
          <span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs">S</span> Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
