import { Shield, Zap, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Privacidad por Diseño",
    description:
      "Arquitectura Zero-Knowledge que permite verificar credenciales sin exponer datos personales. El usuario mantiene control total sobre su información.",
  },
  {
    icon: Zap,
    title: "Check-in Instantáneo",
    description:
      "Verificación criptográfica en menos de 1 segundo. Elimina colas, reduce fricción y mejora la experiencia del huésped desde el primer momento.",
  },
  {
    icon: Cpu,
    title: "Seguridad por Hardware",
    description:
      "Claves privadas protegidas en el Secure Enclave del dispositivo. Firmas Ed25519 garantizan integridad y autenticidad de cada transacción.",
  },
]

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Diseñado para la confianza institucional
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Una infraestructura que cumple con los más altos estándares de seguridad 
            y privacidad, pensada para el sector hotelero y gubernamental.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
