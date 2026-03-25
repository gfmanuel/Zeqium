"use client"

import { useState } from "react"
import { PoliceSidebar } from "@/components/police/police-sidebar"
import { KycIssuanceForm } from "@/components/police/kyc-issuance-form"
import { CredentialRegistryTable } from "@/components/police/credential-registry-table"

export default function PoliceDashboard() {
  const [activeMenuItem, setActiveMenuItem] = useState("emitir-credencial")

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <PoliceSidebar
        activeItem={activeMenuItem}
        onItemChange={setActiveMenuItem}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Panel de Emisión y Gobernanza
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sistema de gestión de credenciales verificables SD-JWT para documentos nacionales de identidad
            </p>
          </header>

          {/* Two Column Layout */}
          <div className="flex flex-col gap-6 xl:flex-row">
            {/* Left Column - KYC Issuance Form */}
            <div className="w-full xl:w-1/2">
              <KycIssuanceForm />
            </div>

            {/* Right Column - Credential Registry */}
            <div className="w-full xl:w-1/2">
              <CredentialRegistryTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
