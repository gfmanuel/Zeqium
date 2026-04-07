"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Shield, LogIn, AlertCircle, Loader2 } from "lucide-react"
import { login } from "@/lib/api"

interface LoginFormProps {
    onLoginSuccess: (token: string) => void
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
            const data = await login(user, pass)
            onLoginSuccess(data.token)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error de autenticación")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                        <Shield className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl text-white">Zeqium Policía</CardTitle>
                    <CardDescription className="text-slate-400">
                        Panel de Emisión y Gobernanza de Credenciales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel htmlFor="user" className="text-slate-300">
                                    Usuario
                                </FieldLabel>
                                <Input
                                    id="user"
                                    placeholder="admin_policia"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    className="border-slate-600 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="pass" className="text-slate-300">
                                    Contraseña
                                </FieldLabel>
                                <Input
                                    id="pass"
                                    type="password"
                                    placeholder="••••••••"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    className="border-slate-600 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                                    required
                                />
                            </Field>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !user || !pass}
                                className="mt-2 w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-4 w-4" />
                                )}
                                Iniciar Sesión
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
