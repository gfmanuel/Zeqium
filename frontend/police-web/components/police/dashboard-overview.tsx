"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getHistory, type CredentialHistoryItem } from "@/lib/api"
import { FileKey2, ShieldCheck, ShieldX, Clock, Loader2 } from "lucide-react"

export function DashboardOverview() {
    const [history, setHistory] = useState<CredentialHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        try {
            const data = await getHistory()
            setHistory(data.history || [])
        } catch {
            // silently fail — will show empty state
        } finally {
            setIsLoading(false)
        }
    }

    const total = history.length
    const activas = history.filter(h => h.estado === 'ACTIVE').length
    const revocadas = history.filter(h => h.estado === 'REVOKED').length

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <FileKey2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Emitidas</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Activas</p>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activas}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            <ShieldX className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Revocadas</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{revocadas}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        Últimas Emisiones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">No hay credenciales emitidas aún.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.slice(0, 8).map((item, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                                            {item.did_holder}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {new Date(item.fecha_emision).toLocaleString('es-ES')}
                                        </p>
                                    </div>
                                    <Badge className={
                                        item.estado === 'ACTIVE'
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                    }>
                                        {item.estado === 'ACTIVE' ? 'Activa' : 'Revocada'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
