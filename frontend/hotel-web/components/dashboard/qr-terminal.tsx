"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, XCircle, ScanLine, RefreshCw } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { io, type Socket } from "socket.io-client"
import { getAuthRequest, type AuthRequest, type QRPayload } from "@/lib/api"

type TerminalState = "waiting" | "connecting" | "granted" | "denied"

interface QRTerminalProps {
  className?: string
  onCheckinSuccess?: () => void
}

const stateConfig = {
  waiting: {
    label: "Esperando escaneo del ciudadano...",
    icon: ScanLine,
    borderColor: "border-muted-foreground/30",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  connecting: {
    label: "Procesando credencial...",
    icon: Loader2,
    borderColor: "border-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  granted: {
    label: "¡Acceso concedido! Firma criptográfica válida.",
    icon: CheckCircle2,
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  denied: {
    label: "Acceso denegado. Credencial inválida o revocada.",
    icon: XCircle,
    borderColor: "border-destructive",
    textColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function QRTerminal({ className, onCheckinSuccess }: QRTerminalProps) {
  const [state, setState] = useState<TerminalState>("waiting")
  const [authRequest, setAuthRequest] = useState<AuthRequest | null>(null)
  const [qrPayload, setQrPayload] = useState<QRPayload | null>(null)
  const [lastCheckin, setLastCheckin] = useState<{ nombre: string; habitacion: string } | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const activeNonceRef = useRef<string>("")
  const socketRef = useRef<Socket | null>(null)

  const loadAuthRequest = useCallback(async () => {
    setIsLoadingQR(true)
    setErrorMsg("")
    try {
      const data = await getAuthRequest()
      setAuthRequest(data)
      setQrPayload(data.qrPayload ?? null)
      activeNonceRef.current = data.request.body.nonce
      setState("waiting")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error obteniendo nonce del hotel")
    } finally {
      setIsLoadingQR(false)
    }
  }, [])

  useEffect(() => {
    loadAuthRequest()
  }, [loadAuthRequest])

  useEffect(() => {
    const socket = io({ path: "/socket.io/", transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("new-checkin", (payload: { nombre?: string; apellidos?: string; habitacion?: string }) => {
      setState("granted")
      setLastCheckin({
        nombre: [payload.nombre, payload.apellidos].filter(Boolean).join(" ") || "Huésped",
        habitacion: payload.habitacion || "—",
      })
      onCheckinSuccess?.()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [onCheckinSuccess])

  useEffect(() => {
    if (state === "granted" || state === "denied") {
      const t = setTimeout(() => {
        loadAuthRequest()
      }, 8000)
      return () => clearTimeout(t)
    }
  }, [state, loadAuthRequest])

  const config = stateConfig[state]
  const StatusIcon = config.icon
  const qrValue = qrPayload ? JSON.stringify(qrPayload) : ""

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Terminal de Acceso Seguro</CardTitle>
          <button
            onClick={loadAuthRequest}
            disabled={isLoadingQR}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Renovar nonce"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingQR && "animate-spin")} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div
          className={cn(
            "relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border-2 transition-all duration-300",
            config.borderColor,
            config.bgColor
          )}
        >
          {isLoadingQR ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : state === "waiting" && qrValue ? (
            <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
              <QRCodeSVG value={qrValue} size={220} level="L" includeMargin />
            </div>
          ) : (
            <StatusIcon
              className={cn("h-16 w-16", state === "connecting" && "animate-spin", config.textColor)}
            />
          )}

          {state === "waiting" && !isLoadingQR && (
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary/30 pointer-events-none" />
          )}
        </div>

        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
            config.bgColor,
            config.textColor
          )}
        >
          <StatusIcon className={cn("h-5 w-5 shrink-0", state === "connecting" && "animate-spin")} />
          <span>{config.label}</span>
        </div>

        {errorMsg && (
          <p className="text-center text-xs text-destructive">{errorMsg}</p>
        )}

        {lastCheckin && state === "granted" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-950/50">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {lastCheckin.nombre}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Asignada: {lastCheckin.habitacion}
            </p>
          </div>
        )}

        {state === "waiting" && !isLoadingQR && authRequest && (
          <div className="mt-auto rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              El ciudadano escanea este QR con Zeqium Wallet, elige qué datos compartir
              y el check-in se procesa automáticamente.
            </p>
            <p className="mt-2 text-[10px] font-mono text-muted-foreground/70">
              nonce: {authRequest.request.body.nonce.substring(0, 16)}...
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/70">
              Datos mínimos: nombre, apellidos, DNI y fecha de nacimiento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { TerminalState }
