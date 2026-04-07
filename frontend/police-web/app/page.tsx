"use client"

import { useState, useEffect } from "react"
import { PoliceSidebar } from "@/components/police/police-sidebar"
import { LoginForm } from "@/components/police/login-form"
import { KycIssuanceForm } from "@/components/police/kyc-issuance-form"
import { CredentialRegistryTable } from "@/components/police/credential-registry-table"
import { DashboardOverview } from "@/components/police/dashboard-overview"
import { SchemaManagement } from "@/components/police/schema-management"
import { getToken } from "@/lib/api"

export default function PoliceDashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState("panel-central")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = getToken()
    setIsLoggedIn(!!token)
    setIsCheckingAuth(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  // Show nothing while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  // Render the selected view
  const renderContent = () => {
    switch (activeMenuItem) {
      case "panel-central":
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Panel Central
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Resumen del estado de las credenciales emitidas en la red Zeqium
              </p>
            </header>
            <DashboardOverview />
          </>
        )

      case "emitir-credencial":
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Panel de Emisión y Gobernanza
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sistema de gestión de credenciales verificables SD-JWT para documentos nacionales de identidad
              </p>
            </header>
            <div className="flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <KycIssuanceForm />
              </div>
              <div className="w-full xl:w-1/2">
                <CredentialRegistryTable />
              </div>
            </div>
          </>
        )

      case "registro-revocacion":
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Registro y Revocación
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gestión completa del ciclo de vida de las credenciales emitidas
              </p>
            </header>
            <CredentialRegistryTable fullWidth />
          </>
        )

      case "gestion-infraestructura":
        return (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Gestión de Infraestructura
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Registrar y consultar Schemas y Credential Definitions en la blockchain
              </p>
            </header>
            <SchemaManagement />
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <PoliceSidebar
        activeItem={activeMenuItem}
        onItemChange={setActiveMenuItem}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
