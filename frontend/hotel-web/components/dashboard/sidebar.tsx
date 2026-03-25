"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  QrCode,
  Users,
  FileText,
  Sun,
  Moon,
  Building2,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  activeItem?: string
  onNavigate?: (item: string) => void
}

const menuItems = [
  { id: "checkin", label: "Check-in en vivo", icon: QrCode },
  { id: "guests", label: "Huéspedes Activos", icon: Users },
  { id: "audit", label: "Auditoría en Blockchain", icon: FileText },
]

export function DashboardSidebar({ activeItem = "checkin", onNavigate }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <Building2 className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">Zeqium</h1>
          <p className="text-xs text-muted-foreground">Hotel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Profile & Theme Toggle */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Recepcionista" />
            <AvatarFallback className="bg-muted text-muted-foreground">MR</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              María Rodríguez
            </p>
            <p className="truncate text-xs text-muted-foreground">Recepcionista</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="shrink-0"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start gap-2 text-muted-foreground"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
