"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { FileText, RefreshCw, Download, Loader2, Database, Link } from "lucide-react"
import { getAuditLogs, getAuditLedger, exportStaysCSV, type StayLog } from "@/lib/api"

export function AuditView() {
    const [logs, setLogs] = useState<StayLog[]>([])
    const [ledger, setLedger] = useState<unknown[]>([])
    const [isLoadingLogs, setIsLoadingLogs] = useState(true)
    const [isLoadingLedger, setIsLoadingLedger] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    const loadLogs = useCallback(async () => {
        setIsLoadingLogs(true)
        try {
            const data = await getAuditLogs()
            setLogs(data.logs || [])
        } catch { /* silent */ } finally { setIsLoadingLogs(false) }
    }, [])

    const loadLedger = useCallback(async () => {
        setIsLoadingLedger(true)
        try {
            const data = await getAuditLedger()
            setLedger(data.ledger || [])
        } catch { /* silent */ } finally { setIsLoadingLedger(false) }
    }, [])

    useEffect(() => {
        loadLogs()
        loadLedger()
    }, [loadLogs, loadLedger])

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const data = await exportStaysCSV()
            const blob = new Blob([data.csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'zeqium_hotel_stays.csv'
            a.click()
            URL.revokeObjectURL(url)
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Error al exportar')
        } finally { setIsExporting(false) }
    }

    const statusBadge = (estado: string) => {
        if (estado === 'Checked-in') return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100">Activo</Badge>
        return <Badge variant="secondary">Finalizado</Badge>
    }

    return (
        <div className="space-y-6">
            {/* Off-chain audit — PostgreSQL */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Database className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Registro de Estancias (Off-chain)</CardTitle>
                                <CardDescription className="text-xs">Base de datos PostgreSQL del hotel</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoadingLogs}>
                                <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingLogs ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-auto">
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
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Sin registros.</TableCell>
                                        </TableRow>
                                    ) : logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.nombre} {log.apellidos}</TableCell>
                                            <TableCell>{log.habitacion}</TableCell>
                                            <TableCell className="hidden font-mono text-xs md:table-cell max-w-[100px]">
                                                <span title={log.did_huesped}>
                                                    {log.did_huesped.slice(0, 12)}...{log.did_huesped.slice(-6)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(log.fecha_entrada).toLocaleDateString("es-ES")}
                                            </TableCell>
                                            <TableCell>{statusBadge(log.estado)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        {logs.length} registros totales · {logs.filter(l => l.estado === 'Checked-in').length} activos
                    </p>
                </CardContent>
            </Card>

            {/* On-chain audit — Blockchain */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Link className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Registros de Verificación (On-chain)</CardTitle>
                                <CardDescription className="text-xs">Hyperledger Fabric — CouchDB Rich Query</CardDescription>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadLedger} disabled={isLoadingLedger}>
                            <RefreshCw className={`h-4 w-4 ${isLoadingLedger ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingLedger ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : ledger.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Sin registros en blockchain.</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-auto">
                            {ledger.map((entry, i) => (
                                <div key={i} className="rounded-lg border bg-muted/30 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="text-xs font-semibold text-foreground">Registro #{i + 1}</span>
                                    </div>
                                    <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
                                        {JSON.stringify(entry, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        {ledger.length} verificaciones registradas en blockchain
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
