"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { FileKey2, QrCode, Hash, CheckCircle2 } from "lucide-react"

interface FormData {
  nombre: string
  apellidos: string
  fechaNacimiento: string
  numeroDni: string
  holderDid: string
}

export function KycIssuanceForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    fechaNacimiento: "",
    numeroDni: "",
    holderDid: "",
  })
  const [isGenerated, setIsGenerated] = useState(false)
  const [hash, setHash] = useState("")

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsGenerated(false)
  }

  const validateDni = (dni: string): boolean => {
    const dniRegex = /^[0-9]{8}[A-Z]$/i
    return dniRegex.test(dni)
  }

  const generateCredential = () => {
    // Simulate hash generation
    const simulatedHash = `SHA256:${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`
    setHash(simulatedHash)
    setIsGenerated(true)
  }

  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.apellidos.trim() !== "" &&
    formData.fechaNacimiento !== "" &&
    validateDni(formData.numeroDni) &&
    formData.holderDid.trim() !== ""

  return (
    <Card className="flex-1 border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <FileKey2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              Emisión de Credencial SD-JWT (DNI)
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Introduzca los datos del ciudadano para generar la credencial verificable
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup className="gap-5">
          {/* Nombre */}
          <Field>
            <FieldLabel htmlFor="nombre" className="text-slate-700 dark:text-slate-300">
              Nombre completo
            </FieldLabel>
            <Input
              id="nombre"
              placeholder="Ej: Carlos"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className="border-slate-200 bg-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>

          {/* Apellidos */}
          <Field>
            <FieldLabel htmlFor="apellidos" className="text-slate-700 dark:text-slate-300">
              Apellidos
            </FieldLabel>
            <Input
              id="apellidos"
              placeholder="Ej: García López"
              value={formData.apellidos}
              onChange={(e) => handleInputChange("apellidos", e.target.value)}
              className="border-slate-200 bg-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>

          {/* Fecha de Nacimiento */}
          <Field>
            <FieldLabel htmlFor="fechaNacimiento" className="text-slate-700 dark:text-slate-300">
              Fecha de Nacimiento
            </FieldLabel>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
              className="border-slate-200 bg-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>

          {/* Número DNI */}
          <Field>
            <FieldLabel htmlFor="numeroDni" className="text-slate-700 dark:text-slate-300">
              Número DNI
            </FieldLabel>
            <Input
              id="numeroDni"
              placeholder="Ej: 12345678Z"
              value={formData.numeroDni}
              onChange={(e) => handleInputChange("numeroDni", e.target.value.toUpperCase())}
              maxLength={9}
              className="border-slate-200 bg-white font-mono uppercase focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
            <FieldDescription>
              Formato: 8 dígitos + letra (ej: 12345678Z)
            </FieldDescription>
          </Field>

          {/* Holder DID */}
          <Field>
            <FieldLabel htmlFor="holderDid" className="text-slate-700 dark:text-slate-300">
              Holder DID
            </FieldLabel>
            <Input
              id="holderDid"
              placeholder="did:zeqium:wallet:..."
              value={formData.holderDid}
              onChange={(e) => handleInputChange("holderDid", e.target.value)}
              className="border-slate-200 bg-white font-mono text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
            <FieldDescription>
              Identificador de la Wallet App del ciudadano
            </FieldDescription>
          </Field>

          {/* Generate Button */}
          <Button
            onClick={generateCredential}
            disabled={!isFormValid}
            className="mt-2 w-full bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
          >
            <FileKey2 className="mr-2 h-4 w-4" />
            Generar Oferta y Firmar Credencial
          </Button>
        </FieldGroup>

        {/* Generated Credential Panel */}
        {isGenerated && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
            <div className="mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Credencial Generada Exitosamente</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* QR Code */}
              <div className="flex flex-col items-center rounded-lg bg-white p-4 dark:bg-slate-800">
                <span className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <QrCode className="h-3 w-3" />
                  Offer QR Code
                </span>
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  {/* Placeholder QR Pattern */}
                  <svg viewBox="0 0 100 100" className="h-24 w-24">
                    <rect x="10" y="10" width="25" height="25" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="65" y="10" width="25" height="25" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="10" y="65" width="25" height="25" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="15" y="15" width="15" height="15" fill="currentColor" className="text-white dark:text-slate-800" />
                    <rect x="70" y="15" width="15" height="15" fill="currentColor" className="text-white dark:text-slate-800" />
                    <rect x="15" y="70" width="15" height="15" fill="currentColor" className="text-white dark:text-slate-800" />
                    <rect x="18" y="18" width="9" height="9" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="73" y="18" width="9" height="9" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="18" y="73" width="9" height="9" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="40" y="10" width="5" height="5" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="50" y="10" width="5" height="5" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="40" y="20" width="5" height="5" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="45" y="25" width="5" height="5" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="40" y="40" width="20" height="20" fill="currentColor" className="text-slate-800 dark:text-white" />
                    <rect x="45" y="45" width="10" height="10" fill="currentColor" className="text-white dark:text-slate-800" />
                  </svg>
                </div>
              </div>

              {/* Hash */}
              <div className="flex flex-col rounded-lg bg-white p-4 dark:bg-slate-800">
                <span className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Hash className="h-3 w-3" />
                  Hash SHA-256
                </span>
                <code className="break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {hash}
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
