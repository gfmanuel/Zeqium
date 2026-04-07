"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileKey2,
  ScrollText,
  Settings2,
  User,
  Sun,
  Moon,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { clearToken } from "@/lib/api"

interface PoliceSidebarProps {
  activeItem?: string
  onItemChange?: (item: string) => void
  onLogout?: () => void
}

const menuItems = [
  { id: "panel-central", label: "Panel Central", icon: LayoutDashboard },
  { id: "emitir-credencial", label: "Emitir Credencial", icon: FileKey2 },
  { id: "registro-revocacion", label: "Registro y Revocación", icon: ScrollText },
  { id: "gestion-infraestructura", label: "Gestión Infraestructura (Schemas)", icon: Settings2 },
]

export function PoliceSidebar({ activeItem = "emitir-credencial", onItemChange, onLogout }: PoliceSidebarProps) {
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white">
          <Shield className="h-6 w-6" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Zeqium</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Policía Nacional</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemChange?.(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-700 dark:text-indigo-300" : "")} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-slate-200 p-2 dark:border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center text-slate-500"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Profile & Theme Toggle */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <User className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-white">Agente García</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Unidad Central</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            title={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { clearToken(); onLogout?.(); window.location.reload() }}
            className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
