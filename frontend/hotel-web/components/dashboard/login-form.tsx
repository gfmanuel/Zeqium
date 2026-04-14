"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, LogIn, AlertCircle, Loader2 } from "lucide-react"
import { login } from "@/lib/api"

interface LoginFormProps {
    onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)
        try {
            await login(user, pass)
            onLoginSuccess()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Credenciales incorrectas")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl text-white">Zeqium Hotel</CardTitle>
                    <CardDescription className="text-slate-400">
                        Panel de Recepción — Check-in Digital
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-300">Usuario</label>
                            <Input
                                placeholder="recepcion_hotel"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                className="border-slate-600 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-300">Contraseña</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="border-slate-600 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-blue-500"
                                required
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading || !user || !pass}
                            className="mt-1 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Iniciar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
