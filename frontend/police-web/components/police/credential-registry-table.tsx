"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollText, Search, AlertTriangle, Filter, Loader2, RefreshCw, Download } from "lucide-react"
import { getHistory, revokeCredential, exportAuditCSV, type CredentialHistoryItem } from "@/lib/api"

interface CredentialRegistryTableProps {
  fullWidth?: boolean
}

export function CredentialRegistryTable({ fullWidth = false }: CredentialRegistryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [credentials, setCredentials] = useState<CredentialHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revokingHash, setRevokingHash] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const loadCredentials = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getHistory()
      setCredentials(data.history || [])
    } catch {
      // will show empty state
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCredentials()
  }, [loadCredentials])

  const filteredCredentials = credentials.filter((credential) => {
    const matchesSearch =
      credential.did_holder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.credential_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (credential.national_id && credential.national_id.toLowerCase().includes(searchQuery.toLowerCase()))
    const estadoNormalized = credential.estado === 'ACTIVE' ? 'activa' : 'revocada'
    const matchesStatus = statusFilter === "todos" || estadoNormalized === statusFilter

    return matchesSearch && matchesStatus
  })

  const truncateStr = (str: string, maxLen = 25) => {
    if (str.length <= maxLen) return str
    return `${str.slice(0, 12)}...${str.slice(-8)}`
  }

  const handleRevoke = async (hash: string) => {
    if (!confirm('¿Seguro que deseas revocar esta credencial? Esta acción es irreversible.')) return
    setRevokingHash(hash)
    try {
      await revokeCredential(hash, 'ADMIN_REVOCATION')
      await loadCredentials()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al revocar')
    } finally {
      setRevokingHash(null)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const data = await exportAuditCSV()
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'zeqium_police_audit.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setIsExporting(false)
    }
  }

  const activas = credentials.filter(c => c.estado === 'ACTIVE').length
  const revocadas = credentials.filter(c => c.estado === 'REVOKED').length

  return (
    <Card className={`border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${fullWidth ? 'w-full' : 'flex-1'}`}>
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ScrollText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Registro Global de Credenciales
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Consulte y gestione el estado de las credenciales emitidas
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting} title="Exportar CSV">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={loadCredentials} disabled={isLoading} title="Refrescar">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search and Filter Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por DNI, DID o hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-slate-200 bg-white pl-9 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="revocada">Revocada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Credentials Table */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <TableHead className="text-slate-600 dark:text-slate-400">DID Titular</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">DNI</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Hash</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Fecha Emisión</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Estado</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredentials.map((credential, idx) => (
                  <TableRow key={idx} className="border-slate-200 dark:border-slate-700">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      <span title={credential.did_holder}>
                        {truncateStr(credential.did_holder)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {credential.national_id || <span className="text-slate-400 italic">N/A</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      <span title={credential.credential_hash}>
                        {truncateStr(credential.credential_hash)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {new Date(credential.fecha_emision).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {credential.estado === "ACTIVE" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300">
                          Activa
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300">
                          Revocada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {credential.estado === "ACTIVE" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(credential.credential_hash)}
                          disabled={revokingHash === credential.credential_hash}
                          className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                          {revokingHash === credential.credential_hash ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Revocar
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {credential.fecha_revocacion
                            ? new Date(credential.fecha_revocacion).toLocaleDateString("es-ES")
                            : "Revocada"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCredentials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500 dark:text-slate-400">
                      {credentials.length === 0
                        ? "No hay credenciales emitidas aún."
                        : "No se encontraron credenciales con los filtros aplicados."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total: <strong className="text-slate-700 dark:text-slate-300">{credentials.length}</strong>
          </span>
          <span>
            Activas: <strong className="text-emerald-600 dark:text-emerald-400">{activas}</strong>
          </span>
          <span>
            Revocadas: <strong className="text-red-600 dark:text-red-400">{revocadas}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
