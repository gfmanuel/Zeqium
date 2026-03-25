"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { QRTerminal } from "@/components/dashboard/qr-terminal"
import { GuestsTable } from "@/components/dashboard/guests-table"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("checkin")

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar activeItem={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b border-border bg-card px-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Dashboard de Recepción
            </h2>
            <p className="text-sm text-muted-foreground">
              Sistema de Check-in con Identidad Digital
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid h-full gap-6 lg:grid-cols-2">
            {/* QR Terminal Card */}
            <QRTerminal className="h-full min-h-[500px]" />

            {/* Guests Table Card */}
            <GuestsTable className="h-full min-h-[500px]" />
          </div>
        </div>
      </main>
    </div>
  )
}
