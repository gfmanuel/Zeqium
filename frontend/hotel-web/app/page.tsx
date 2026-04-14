"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { LoginForm } from "@/components/dashboard/login-form"
import { QRTerminal } from "@/components/dashboard/qr-terminal"
import { GuestsTable } from "@/components/dashboard/guests-table"
import { AuditView } from "@/components/dashboard/audit-view"
import { getToken } from "@/lib/api"

const VIEW_TITLES: Record<string, { title: string; description: string }> = {
  checkin: {
    title: "Check-in en Vivo",
    description: "Terminal de verificación criptográfica de DNIs digitales (SD-JWT / DIF PE v2.0)",
  },
  guests: {
    title: "Huéspedes Activos",
    description: "Ocupación en tiempo real — actualización automática cada 30 segundos",
  },
  audit: {
    title: "Auditoría en Blockchain",
    description: "Trazabilidad completa: registros off-chain (PostgreSQL) y on-chain (Hyperledger Fabric)",
  },
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("checkin")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [guestRefreshTrigger, setGuestRefreshTrigger] = useState(0)

  useEffect(() => {
    setIsLoggedIn(!!getToken())
    setIsCheckingAuth(false)
  }, [])

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true)
  }, [])

  const handleCheckinSuccess = useCallback(() => {
    setGuestRefreshTrigger(t => t + 1)
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  const view = VIEW_TITLES[activeSection] ?? VIEW_TITLES.checkin

  const renderContent = () => {
    switch (activeSection) {
      case "checkin":
        return (
          <div className="grid h-full gap-6 lg:grid-cols-2">
            <QRTerminal className="h-full min-h-[500px]" onCheckinSuccess={handleCheckinSuccess} />
            <GuestsTable className="h-full min-h-[500px]" refreshTrigger={guestRefreshTrigger} />
          </div>
        )
      case "guests":
        return (
          <GuestsTable className="min-h-[600px]" refreshTrigger={guestRefreshTrigger} />
        )
      case "audit":
        return <AuditView />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeItem={activeSection} onNavigate={setActiveSection} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border bg-card px-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{view.title}</h2>
            <p className="text-sm text-muted-foreground">{view.description}</p>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
