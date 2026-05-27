"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Search, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getActiveGuests, clearToken, type Guest } from "@/lib/api"

interface GuestsTableProps {
  className?: string
  refreshTrigger?: number
}

export function GuestsTable({ className, refreshTrigger }: GuestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [error, setError] = useState<string | null>(null)

  const loadGuests = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getActiveGuests(signal)   // pasa el signal a tu fetch
      if (signal?.aborted) return                  // ignorar si ya fue cancelado
      setGuests(data.guests || [])
      setLastUpdated(new Date())
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      // Si es 401, token caducado → forzar re-login
      if (err instanceof Error && err.message.includes("401")) {
        clearToken()
        window.location.reload()
        return
      }
      setError(err instanceof Error ? err.message : "Error al cargar huéspedes")
      setTimeout(() => setError(null), 10000)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  // Mount + refreshTrigger
  useEffect(() => {
    const controller = new AbortController()
    loadGuests(controller.signal)
    return () => controller.abort()
  }, [loadGuests, refreshTrigger])

  // Auto-refresh cada 30s
  // Sustituye el useEffect del auto-refresh
  useEffect(() => {
    let retryCount = 0
    const MAX_RETRIES = 3

    const attempt = () => {
      const controller = new AbortController()
      loadGuests(controller.signal).catch(() => {
        if (retryCount < MAX_RETRIES) {
          retryCount++
          // Backoff exponencial: 2s, 4s, 8s
          setTimeout(attempt, 1000 * Math.pow(2, retryCount))
        }
      })
      return controller
    }

    const interval = setInterval(() => {
      retryCount = 0  // reset contador en cada ciclo de 30s
      attempt()
    }, 30000)

    return () => clearInterval(interval)
  }, [loadGuests])

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests
    const q = searchQuery.toLowerCase()
    return guests.filter(g =>
      g.nombre.toLowerCase().includes(q) ||
      g.apellidos.toLowerCase().includes(q) ||
      g.habitacion.toLowerCase().includes(q) ||
      g.did_huesped.toLowerCase().includes(q)
    )
  }, [guests, searchQuery])

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Ocupación en Tiempo Real
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => loadGuests()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar huésped, habitación o DID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-red-500">
              <span className="font-semibold">Fallo de conexión</span>
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Huésped</TableHead>
                  <TableHead>Habitación</TableHead>
                  <TableHead className="hidden md:table-cell">DID</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {guests.length === 0 ? "No hay huéspedes activos actualmente." : "No se encontraron resultados."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        {guest.nombre} {guest.apellidos}
                      </TableCell>
                      <TableCell>{guest.habitacion}</TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell max-w-[120px] truncate">
                        <span title={guest.did_huesped}>
                          {guest.did_huesped.length > 20
                            ? `${guest.did_huesped.slice(0, 12)}...${guest.did_huesped.slice(-6)}`
                            : guest.did_huesped}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(guest.fecha_entrada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950">
                          Activo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{guests.length}</strong> huéspedes activos</span>
          {lastUpdated && (
            <span>
              Actualizado: {lastUpdated.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
