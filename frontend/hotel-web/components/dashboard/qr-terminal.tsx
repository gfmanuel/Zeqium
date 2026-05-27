"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, XCircle, ScanLine, Play, Clock, Info } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { io, type Socket } from "socket.io-client"
import { getAuthRequest, type AuthRequest, type QRPayload } from "@/lib/api"

type TerminalState = "idle" | "waiting" | "connecting" | "granted" | "denied"

interface QRTerminalProps {
  className?: string
  onCheckinSuccess?: () => void
}

const stateConfig = {
  idle: {
    label: "Recepción lista",
    icon: ScanLine,
    borderColor: "border-muted-foreground/20",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted/10",
  },
  waiting: {
    label: "Esperando escaneo...",
    icon: Clock,
    borderColor: "border-indigo-400",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  connecting: {
    label: "Procesando credencial...",
    icon: Loader2,
    borderColor: "border-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  granted: {
    label: "Check-in completado con éxito.",
    icon: CheckCircle2,
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  denied: {
    label: "Acceso denegado. Credencial inválida.",
    icon: XCircle,
    borderColor: "border-destructive",
    textColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function QRTerminal({ className, onCheckinSuccess }: QRTerminalProps) {
  const [state, setState] = useState<TerminalState>("idle")
  const [authRequest, setAuthRequest] = useState<AuthRequest | null>(null)
  const [qrPayload, setQrPayload] = useState<QRPayload | null>(null)
  const [lastCheckin, setLastCheckin] = useState<{ nombre: string; habitacion: string } | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const activeNonceRef = useRef<string>("")
  const socketRef = useRef<Socket | null>(null)

  const handleStartCheckin = useCallback(async () => {
    setIsLoadingQR(true)
    setErrorMsg("")
    setState("connecting")
    try {
      const data = await getAuthRequest()
      setAuthRequest(data)
      setQrPayload(data.qrPayload ?? null)
      activeNonceRef.current = data.request.body.nonce
      setState("waiting")
      setTimeLeft(60) // 60 segundos de validez
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error iniciando check-in")
      setState("idle")
    } finally {
      setIsLoadingQR(false)
    }
  }, [])

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4001"
    const socket = io(backendUrl, { transports: ["websocket"] })
    socketRef.current = socket

    socket.on("new-checkin", (payload: { nombre?: string; apellidos?: string; habitacion?: string }) => {
      setState("granted")
      setLastCheckin({
        nombre: [payload.nombre, payload.apellidos].filter(Boolean).join(" ") || "Huésped",
        habitacion: payload.habitacion || "—",
      })
      onCheckinSuccess?.()
    })

    socket.on("checkin-error", (payload: { error: string }) => {
      setState("denied")
      setErrorMsg(payload.error || "Credencial rechazada")
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [onCheckinSuccess])

  // Temporizador para el QR
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (state === "waiting" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (state === "waiting" && timeLeft === 0) {
      setState("idle")
      setQrPayload(null)
      setErrorMsg("El tiempo para escanear ha caducado. Vuelve a iniciar el proceso.")
    }
    return () => clearInterval(timer)
  }, [state, timeLeft])

  // Reset a idle tras unos segundos de error o exito
  useEffect(() => {
    if (state === "granted" || state === "denied") {
      const t = setTimeout(() => {
        setState("idle")
        setQrPayload(null)
        setErrorMsg("")
      }, 8000)
      return () => clearTimeout(t)
    }
  }, [state])

  const config = stateConfig[state]
  const StatusIcon = config.icon
  const qrValue = qrPayload ? JSON.stringify(qrPayload) : ""

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Terminal de Acceso Seguro</CardTitle>
            <p className="text-sm text-muted-foreground">Check-in asistido sin contacto</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-6">
        {state === "idle" ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-indigo-50 p-6 dark:bg-indigo-950/30">
              <ScanLine className="h-16 w-16 text-indigo-500" />
            </div>
            <div className="text-center space-y-2 max-w-[280px]">
              <h3 className="font-semibold text-lg">Modo Asistido</h3>
              <p className="text-sm text-muted-foreground">Haga clic en Iniciar cuando el huésped esté listo con su Wallet.</p>
            </div>
            <Button size="lg" className="w-[280px]" onClick={handleStartCheckin}>
              <Play className="mr-2 h-4 w-4" /> Iniciar Check-in Seguro
            </Button>
            {errorMsg && (
              <p className="text-center text-xs text-destructive max-w-[280px] mt-2">{errorMsg}</p>
            )}
          </div>
        ) : (
          <>
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
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-lg bg-white p-3 dark:bg-slate-900 border shadow-sm">
                    <QRCodeSVG value={qrValue} size={200} level="L" includeMargin={false} />
                  </div>
                  <div className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Caduca en {timeLeft}s</span>
                  </div>
                </div>
              ) : (
                <StatusIcon
                  className={cn("h-16 w-16", state === "connecting" && "animate-spin", config.textColor)}
                />
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

            {state === "waiting" && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setState("idle")}>
                  Cancelar
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export type { TerminalState }
