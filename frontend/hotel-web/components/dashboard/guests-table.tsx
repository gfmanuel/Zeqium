"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface Guest {
  id: string
  name: string
  room: string
  did: string
  checkInTime: string
  status: "active" | "checked-out" | "pending"
}

interface GuestsTableProps {
  className?: string
}

const mockGuests: Guest[] = [
  {
    id: "1",
    name: "Carlos García López",
    room: "Hab-178",
    did: "did:ethr:0x1234...abcd",
    checkInTime: "09:15",
    status: "active",
  },
  {
    id: "2",
    name: "Ana Martínez Ruiz",
    room: "Hab-305",
    did: "did:ethr:0x5678...efgh",
    checkInTime: "11:42",
    status: "active",
  },
  {
    id: "3",
    name: "Miguel Torres Sánchez",
    room: "Hab-412",
    did: "did:ethr:0x9abc...ijkl",
    checkInTime: "14:30",
    status: "pending",
  },
]

const statusConfig = {
  active: {
    label: "Activo",
    variant: "default" as const,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950",
  },
  "checked-out": {
    label: "Finalizado",
    variant: "secondary" as const,
    className: "",
  },
  pending: {
    label: "Pendiente",
    variant: "outline" as const,
    className: "border-amber-500 text-amber-600 dark:text-amber-400",
  },
}

export function GuestsTable({ className }: GuestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [guests, setGuests] = useState(mockGuests)

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests
    const query = searchQuery.toLowerCase()
    return guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.room.toLowerCase().includes(query) ||
        guest.did.toLowerCase().includes(query)
    )
  }, [guests, searchQuery])

  const handleRevoke = (guestId: string) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest.id === guestId ? { ...guest, status: "checked-out" as const } : guest
      )
    )
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Ocupación en Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar huésped, habitación o DID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Huésped</TableHead>
                <TableHead>Habitación</TableHead>
                <TableHead className="hidden md:table-cell">DID</TableHead>
                <TableHead>Hora Entrada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron huéspedes
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => {
                  const status = statusConfig[guest.status]
                  return (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.room}</TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {guest.did}
                      </TableCell>
                      <TableCell>{guest.checkInTime}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className={status.className}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(guest.id)}
                          disabled={guest.status === "checked-out"}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Ban className="mr-1 size-3.5" />
                          Revocar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>
            {guests.filter((g) => g.status === "active").length} huéspedes activos
          </span>
          <span>
            Última actualización: {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
