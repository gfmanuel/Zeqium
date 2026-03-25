import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Identidad Autosoberana para Hoteles</span>
            </div>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              El futuro de la identidad digital hotelera
            </h1>
            
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Infraestructura Zero-Knowledge que permite verificación instantánea 
              y check-in en 1 segundo. Privacidad por diseño, seguridad por hardware, 
              cumplimiento regulatorio total.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="#contacto">
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tecnologia">Ver Tecnología</Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-8 border-t border-border pt-8">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Check-in en 1s</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Zero-Knowledge</span>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative lg:ml-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Desktop Screen */}
              <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Credencial Verificada</div>
                        <div className="text-xs text-muted-foreground">DNI Digital - Válido</div>
                      </div>
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Activo
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Check-in Instantáneo</div>
                        <div className="text-xs text-muted-foreground">Hotel Gran Vía - Hab. 405</div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        1.2s
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="absolute -bottom-6 -left-6 w-32 rounded-2xl border border-border bg-card p-1.5 shadow-sm sm:-left-12 sm:w-40">
                <div className="rounded-xl bg-secondary p-3">
                  <div className="mb-2 flex justify-center">
                    <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                      <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-medium text-foreground">ID Verificado</span>
                    <div className="h-1.5 w-full rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
