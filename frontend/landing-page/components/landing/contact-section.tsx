"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Send, CheckCircle } from "lucide-react"

export function ContactSection() {
  const [submitted, setSubmitted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="contacto" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Solicita una demostración
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Nuestro equipo te mostrará cómo Zeqium puede transformar 
              la experiencia de check-in en tu establecimiento.
            </p>
          </div>

          <div className="mt-12">
            {submitted ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  ¡Solicitud recibida!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Nos pondremos en contacto contigo en las próximas 24 horas.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-border bg-card p-8 shadow-sm"
              >
                <FieldGroup className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="name">Nombre</FieldLabel>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Tu nombre"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="company">Empresa</FieldLabel>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nombre del hotel o cadena"
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Email corporativo</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="message">Mensaje (opcional)</FieldLabel>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Cuéntanos sobre tus necesidades..."
                      rows={4}
                    />
                  </Field>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        Solicitar Demo
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </FieldGroup>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Al enviar este formulario, aceptas nuestra{" "}
                  <a href="#" className="underline hover:text-foreground">
                    política de privacidad
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
