"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, XCircle, ScanLine, RefreshCw, QrCode } from "lucide-react"
import { getAuthRequest, type AuthRequest } from "@/lib/api"

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
  const [lastCheckin, setLastCheckin] = useState<{ nombre: string; habitacion: string } | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  const loadAuthRequest = useCallback(async () => {
    setIsLoadingQR(true)
    setErrorMsg("")
    try {
      const data = await getAuthRequest()
      setAuthRequest(data)
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

  // Auto-reset to waiting after 8s from granted/denied
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
        {/* QR Code Display Area */}
        <div
          className={cn(
            "relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border-2 transition-all duration-300",
            config.borderColor,
            config.bgColor
          )}
        >
          {isLoadingQR ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : authRequest && state === "waiting" ? (
            <div className="flex flex-col items-center gap-4 p-4 text-center">
              <QrCode className="h-16 w-16 text-foreground/70" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Presentation Request</p>
                <p className="mt-1 font-mono text-[10px] break-all text-muted-foreground">
                  nonce: {authRequest.request.body.nonce.substring(0, 16)}...
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Schema: {authRequest.request.body.requirements[0]?.schema}
                </p>
              </div>
            </div>
          ) : (
            <StatusIcon
              className={cn("h-16 w-16", state === "connecting" && "animate-spin", config.textColor)}
            />
          )}

          {state === "waiting" && !isLoadingQR && (
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary/30" />
          )}
        </div>

        {/* Status Indicator */}
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

        {/* Error */}
        {errorMsg && (
          <p className="text-center text-xs text-destructive">{errorMsg}</p>
        )}

        {/* Last checkin result */}
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

        {/* Instructions */}
        {state === "waiting" && !isLoadingQR && authRequest && (
          <div className="mt-auto rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              El ciudadano debe presentar su DNI digital desde la Wallet App.
              El check-in se procesa automáticamente.
            </p>
            <p className="mt-1 text-[10px] font-mono text-muted-foreground/70">
              Goal: {authRequest.request.body.goal_code}
            </p>
          </div>
        )}

        {/* Expose state setter and authRequest for parent — via prop callbacks */}
        <div className="hidden" id="qr-terminal-state-api"
          data-state={state}
          data-nonce={authRequest?.request.body.nonce || ""}
          data-set-state=""
        />
      </CardContent>
    </Card>
  )
}

// Export types for parent usage
export type { TerminalState }
export { stateConfig }
