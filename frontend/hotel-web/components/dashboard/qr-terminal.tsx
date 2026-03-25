"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, XCircle, ScanLine } from "lucide-react"

type TerminalState = "waiting" | "connecting" | "granted" | "denied"

interface QRTerminalProps {
  className?: string
}

const stateConfig = {
  waiting: {
    label: "Esperando escaneo del cliente...",
    icon: ScanLine,
    borderColor: "border-muted-foreground/30",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  connecting: {
    label: "Conectando con Wallet...",
    icon: Loader2,
    borderColor: "border-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  granted: {
    label: "¡Acceso concedido! Firma válida.",
    icon: CheckCircle2,
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  denied: {
    label: "Acceso denegado.",
    icon: XCircle,
    borderColor: "border-destructive",
    textColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function QRTerminal({ className }: QRTerminalProps) {
  const [state, setState] = useState<TerminalState>("waiting")

  const config = stateConfig[state]
  const StatusIcon = config.icon

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Terminal de Acceso Seguro</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        {/* QR Code Display */}
        <div
          className={cn(
            "relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border-2 transition-all duration-300",
            config.borderColor,
            config.bgColor
          )}
        >
          {/* Simulated QR Code */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {Array.from({ length: 49 }).map((_, i) => {
              const isCorner =
                (i < 3 && i % 7 < 3) ||
                (i < 3 && i % 7 >= 4) ||
                (i >= 42 && i % 7 < 3)
              const shouldFill = isCorner || Math.random() > 0.5
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square w-5 rounded-sm transition-opacity",
                    shouldFill ? "bg-foreground" : "bg-transparent"
                  )}
                />
              )
            })}
          </div>

          {/* Scan Line Animation for waiting state */}
          {state === "waiting" && (
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary/50" />
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
          <StatusIcon
            className={cn(
              "size-5",
              state === "connecting" && "animate-spin"
            )}
          />
          {config.label}
        </div>

        {/* Debug Tabs */}
        <div className="mt-auto">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Debug: Simular estado
          </p>
          <Tabs
            value={state}
            onValueChange={(v) => setState(v as TerminalState)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="waiting" className="flex-1 text-xs">
                1. Espera
              </TabsTrigger>
              <TabsTrigger value="connecting" className="flex-1 text-xs">
                2. Conectando
              </TabsTrigger>
              <TabsTrigger value="granted" className="flex-1 text-xs">
                3. Válido
              </TabsTrigger>
              <TabsTrigger value="denied" className="flex-1 text-xs">
                4. Denegado
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
