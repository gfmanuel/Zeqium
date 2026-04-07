"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Settings2, Plus, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { registerSchema, getSchema, createCredentialDefinition, getCredentialDefinition } from "@/lib/api"

export function SchemaManagement() {
    // Schema form
    const [schemaID, setSchemaID] = useState("schema:zeqium:gov:dni:v1")
    const [schemaName, setSchemaName] = useState("DNI Español")
    const [schemaVersion, setSchemaVersion] = useState("1.0")
    const [schemaAttrs, setSchemaAttrs] = useState("given_name, family_name, birth_date, national_id, nacionalidad")
    const [schemaLoading, setSchemaLoading] = useState(false)
    const [schemaResult, setSchemaResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // CredDef form
    const [credDefID, setCredDefID] = useState("creddef:zeqium:gov:dni:v1")
    const [credDefSchemaID, setCredDefSchemaID] = useState("schema:zeqium:gov:dni:v1")
    const [credDefLoading, setCredDefLoading] = useState(false)
    const [credDefResult, setCredDefResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Query
    const [queryID, setQueryID] = useState("")
    const [queryType, setQueryType] = useState<'schema' | 'creddef'>('schema')
    const [queryLoading, setQueryLoading] = useState(false)
    const [queryResult, setQueryResult] = useState<unknown>(null)
    const [queryError, setQueryError] = useState("")

    async function handleRegisterSchema() {
        setSchemaLoading(true)
        setSchemaResult(null)
        try {
            const attrs = schemaAttrs.split(',').map(a => a.trim()).filter(Boolean)
            await registerSchema(schemaID, schemaName, schemaVersion, attrs)
            setSchemaResult({ type: 'success', message: `Schema ${schemaID} registrado correctamente` })
        } catch (err: unknown) {
            setSchemaResult({ type: 'error', message: err instanceof Error ? err.message : 'Error desconocido' })
        } finally {
            setSchemaLoading(false)
        }
    }

    async function handleCreateCredDef() {
        setCredDefLoading(true)
        setCredDefResult(null)
        try {
            await createCredentialDefinition(credDefID, credDefSchemaID, { master_public: 'clave_publica_maestra' })
            setCredDefResult({ type: 'success', message: `CredDef ${credDefID} creada correctamente` })
        } catch (err: unknown) {
            setCredDefResult({ type: 'error', message: err instanceof Error ? err.message : 'Error desconocido' })
        } finally {
            setCredDefLoading(false)
        }
    }

    async function handleQuery() {
        setQueryLoading(true)
        setQueryResult(null)
        setQueryError("")
        try {
            if (queryType === 'schema') {
                const data = await getSchema(queryID)
                setQueryResult(data)
            } else {
                const data = await getCredentialDefinition(queryID)
                setQueryResult(data)
            }
        } catch (err: unknown) {
            setQueryError(err instanceof Error ? err.message : 'No encontrado')
        } finally {
            setQueryLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Register Schema */}
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-white">Registrar Schema</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Registrar un nuevo esquema en la blockchain</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">Schema ID</FieldLabel>
                            <Input value={schemaID} onChange={e => setSchemaID(e.target.value)} className="border-slate-200 bg-white font-mono text-sm dark:border-slate-700 dark:bg-slate-800" />
                        </Field>
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">Nombre</FieldLabel>
                            <Input value={schemaName} onChange={e => setSchemaName(e.target.value)} className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
                        </Field>
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">Versión</FieldLabel>
                            <Input value={schemaVersion} onChange={e => setSchemaVersion(e.target.value)} className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
                        </Field>
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">Atributos</FieldLabel>
                            <Input value={schemaAttrs} onChange={e => setSchemaAttrs(e.target.value)} className="border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-800" />
                            <FieldDescription>Separados por comas</FieldDescription>
                        </Field>
                        <Button onClick={handleRegisterSchema} disabled={schemaLoading} className="w-full bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                            {schemaLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Registrar Schema
                        </Button>
                        {schemaResult && (
                            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${schemaResult.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                {schemaResult.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {schemaResult.message}
                            </div>
                        )}
                    </FieldGroup>
                </CardContent>
            </Card>

            {/* Register CredDef */}
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <Settings2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-white">Crear Credential Definition</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Asociar claves públicas a un schema</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">CredDef ID</FieldLabel>
                            <Input value={credDefID} onChange={e => setCredDefID(e.target.value)} className="border-slate-200 bg-white font-mono text-sm dark:border-slate-700 dark:bg-slate-800" />
                        </Field>
                        <Field>
                            <FieldLabel className="text-slate-700 dark:text-slate-300">Schema ID asociado</FieldLabel>
                            <Input value={credDefSchemaID} onChange={e => setCredDefSchemaID(e.target.value)} className="border-slate-200 bg-white font-mono text-sm dark:border-slate-700 dark:bg-slate-800" />
                        </Field>
                        <Button onClick={handleCreateCredDef} disabled={credDefLoading} className="w-full bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                            {credDefLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Crear Credential Definition
                        </Button>
                        {credDefResult && (
                            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${credDefResult.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                {credDefResult.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {credDefResult.message}
                            </div>
                        )}
                    </FieldGroup>
                </CardContent>
            </Card>

            {/* Query */}
            <Card className="border-slate-200 bg-white shadow-sm xl:col-span-2 dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-white">Consultar Blockchain</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Buscar un Schema o Credential Definition por su ID</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex gap-2">
                            <Button
                                variant={queryType === 'schema' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setQueryType('schema')}
                                className={queryType === 'schema' ? 'bg-indigo-700 text-white' : ''}
                            >
                                Schema
                            </Button>
                            <Button
                                variant={queryType === 'creddef' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setQueryType('creddef')}
                                className={queryType === 'creddef' ? 'bg-indigo-700 text-white' : ''}
                            >
                                CredDef
                            </Button>
                        </div>
                        <div className="flex flex-1 gap-2">
                            <Input
                                placeholder={queryType === 'schema' ? 'schema:zeqium:gov:dni:v1' : 'creddef:zeqium:gov:dni:v1'}
                                value={queryID}
                                onChange={e => setQueryID(e.target.value)}
                                className="border-slate-200 bg-white font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                            <Button onClick={handleQuery} disabled={queryLoading || !queryID.trim()} className="bg-indigo-700 text-white hover:bg-indigo-800">
                                {queryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {queryError && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            {queryError}
                        </div>
                    )}

                    {queryResult && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-2">
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    Encontrado en Blockchain
                                </Badge>
                            </div>
                            <pre className="overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                                {JSON.stringify(queryResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
