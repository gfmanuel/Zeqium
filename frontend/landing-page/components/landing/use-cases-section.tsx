import { Building2, BadgeCheck, KeyRound, UserCheck, ShieldCheck, Clock } from "lucide-react"

export function UseCasesSection() {
  return (
    <section id="casos-de-uso" className="bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Un ecosistema para todos los actores
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Zeqium conecta autoridades emisoras con establecimientos verificadores, 
            creando un flujo de confianza digital sin precedentes.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Police / Government Card */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <BadgeCheck className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Para Autoridades
                </h3>
                <p className="text-sm text-muted-foreground">Policía y entidades gubernamentales</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Emisión de DNI Digital</p>
                  <p className="text-sm text-muted-foreground">
                    Emita credenciales verificables vinculadas a identidades oficiales con total trazabilidad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Revocación Instantánea</p>
                  <p className="text-sm text-muted-foreground">
                    Invalide credenciales comprometidas en tiempo real con propagación inmediata.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Auditoría Completa</p>
                  <p className="text-sm text-muted-foreground">
                    Registro inmutable de todas las operaciones para cumplimiento normativo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Card */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Para Hoteles
                </h3>
                <p className="text-sm text-muted-foreground">Cadenas y establecimientos independientes</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Check-in Sin Fricción</p>
                  <p className="text-sm text-muted-foreground">
                    Verifique huéspedes en segundos sin copias de documentos ni formularios.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Cumplimiento GDPR</p>
                  <p className="text-sm text-muted-foreground">
                    Sin almacenamiento de datos personales. La verificación se hace sin retención.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Control de Acceso Integrado</p>
                  <p className="text-sm text-muted-foreground">
                    Llaves digitales vinculadas a la identidad verificada del huésped.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
