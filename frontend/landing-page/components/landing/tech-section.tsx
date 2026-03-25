import { Layers, MessageSquare, FileKey, Fingerprint } from "lucide-react"

const techStack = [
  {
    icon: Layers,
    name: "Hyperledger Fabric",
    description: "Blockchain empresarial permisionada para máxima escalabilidad y control.",
  },
  {
    icon: MessageSquare,
    name: "DIDComm v2",
    description: "Protocolo de comunicación segura entre agentes de identidad descentralizada.",
  },
  {
    icon: FileKey,
    name: "SD-JWT",
    description: "Credenciales con divulgación selectiva para compartir solo lo necesario.",
  },
  {
    icon: Fingerprint,
    name: "Firmas Ed25519",
    description: "Criptografía de curva elíptica para autenticación de alta seguridad.",
  },
]

export function TechSection() {
  return (
    <section id="tecnologia" className="bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Bajo el Capó
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Estándares de clase mundial
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Construido sobre tecnologías probadas y estándares abiertos que garantizan 
            interoperabilidad, seguridad y evolución a largo plazo.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <tech.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">{tech.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
