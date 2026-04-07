"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { FileKey2, Hash, CheckCircle2, Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { getAuthRequest, issueCredential } from "@/lib/api"

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
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [hash, setHash] = useState("")
  const [sdJwt, setSdJwt] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsGenerated(false)
    setError("")
  }

  const validateDni = (dni: string): boolean => {
    const dniRegex = /^[0-9]{8}[A-Z]$/i
    return dniRegex.test(dni)
  }

  const generateCredential = async () => {
    setIsLoading(true)
    setError("")
    setIsGenerated(false)

    try {
      // 1. Get nonce from backend
      const authData = await getAuthRequest()
      const nonce = authData.nonce

      // 2. Issue credential
      const result = await issueCredential({
        schemaID: 'schema:zeqium:gov:dni:v1',
        holderDID: formData.holderDid,
        nonce,
        userData: {
          given_name: formData.nombre,
          family_name: formData.apellidos,
          birth_date: formData.fechaNacimiento,
          national_id: formData.numeroDni,
          nacionalidad: 'Española'
        }
      })

      setHash(result.statusHash)
      setSdJwt(result.credential)
      setIsGenerated(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido al emitir credencial')
    } finally {
      setIsLoading(false)
    }
  }

  const copyHash = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            disabled={!isFormValid || isLoading}
            className="mt-2 w-full bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileKey2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Emitiendo credencial...' : 'Generar Oferta y Firmar Credencial'}
          </Button>
        </FieldGroup>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Generated Credential Panel */}
        {isGenerated && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
            <div className="mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Credencial Emitida y Anclada en Blockchain</span>
            </div>

            <div className="space-y-4">
              {/* Hash */}
              <div className="rounded-lg bg-white p-4 dark:bg-slate-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Hash className="h-3 w-3" />
                    Hash SHA-256 (Estado On-Chain)
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyHash} className="h-7 px-2 text-xs">
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <code className="block break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {hash}
                </code>
              </div>

              {/* SD-JWT */}
              <div className="rounded-lg bg-white p-4 dark:bg-slate-800">
                <span className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <FileKey2 className="h-3 w-3" />
                  SD-JWT (Credencial Firmada)
                </span>
                <code className="block max-h-24 overflow-auto break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {sdJwt}
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
