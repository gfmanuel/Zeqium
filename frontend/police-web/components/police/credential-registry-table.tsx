"use client"

import { useState } from "react"
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
import { ScrollText, Search, AlertTriangle, Filter } from "lucide-react"

interface Credential {
  id: string
  didTitular: string
  dni: string
  nombreCompleto: string
  fechaEmision: string
  estado: "activa" | "revocada"
}

const mockCredentials: Credential[] = [
  {
    id: "1",
    didTitular: "did:zeqium:wallet:a1b2c3d4e5f6789012345",
    dni: "12345678Z",
    nombreCompleto: "Carlos García López",
    fechaEmision: "2024-01-15",
    estado: "activa",
  },
  {
    id: "2",
    didTitular: "did:zeqium:wallet:f9e8d7c6b5a4321098765",
    dni: "87654321X",
    nombreCompleto: "María Rodríguez Sánchez",
    fechaEmision: "2024-01-10",
    estado: "activa",
  },
  {
    id: "3",
    didTitular: "did:zeqium:wallet:1a2b3c4d5e6f789012345",
    dni: "11223344Y",
    nombreCompleto: "Antonio Martínez Ruiz",
    fechaEmision: "2023-12-20",
    estado: "revocada",
  },
]

export function CredentialRegistryTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials)

  const filteredCredentials = credentials.filter((credential) => {
    const matchesSearch =
      credential.dni.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.didTitular.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "todos" || credential.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  const truncateDid = (did: string) => {
    if (did.length <= 25) return did
    return `${did.slice(0, 15)}...${did.slice(-8)}`
  }

  const handleRevoke = (id: string) => {
    setCredentials((prev) =>
      prev.map((cred) =>
        cred.id === id ? { ...cred, estado: "revocada" as const } : cred
      )
    )
  }

  return (
    <Card className="flex-1 border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
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
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search and Filter Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por DNI, DID o nombre..."
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
        <div className="rounded-lg border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <TableHead className="text-slate-600 dark:text-slate-400">DID Titular</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">DNI</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Fecha Emisión</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Estado</TableHead>
                <TableHead className="text-right text-slate-600 dark:text-slate-400">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCredentials.map((credential) => (
                <TableRow
                  key={credential.id}
                  className="border-slate-200 dark:border-slate-700"
                >
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    <span title={credential.didTitular}>
                      {truncateDid(credential.didTitular)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-slate-900 dark:text-white">
                    {credential.dni}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {new Date(credential.fechaEmision).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {credential.estado === "activa" ? (
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
                    {credential.estado === "activa" ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(credential.id)}
                        className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                        Revocación Global
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">No disponible</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredCredentials.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                  >
                    No se encontraron credenciales con los filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total: <strong className="text-slate-700 dark:text-slate-300">{credentials.length}</strong> credenciales
          </span>
          <span>
            Activas:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {credentials.filter((c) => c.estado === "activa").length}
            </strong>
          </span>
          <span>
            Revocadas:{" "}
            <strong className="text-red-600 dark:text-red-400">
              {credentials.filter((c) => c.estado === "revocada").length}
            </strong>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
