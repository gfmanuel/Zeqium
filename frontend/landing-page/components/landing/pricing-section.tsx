import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Boutique",
    description: "Para hoteles independientes y pequeñas cadenas.",
    price: "299",
    period: "/mes",
    features: [
      "Hasta 100 check-ins/mes",
      "1 establecimiento",
      "Soporte por email",
      "Dashboard básico",
      "Integración API REST",
    ],
    highlighted: false,
    cta: "Comenzar",
  },
  {
    name: "Cadena Hotelera",
    description: "Para cadenas medianas con múltiples propiedades.",
    price: "899",
    period: "/mes",
    features: [
      "Hasta 1,000 check-ins/mes",
      "Hasta 10 establecimientos",
      "Soporte prioritario 24/7",
      "Analytics avanzados",
      "Webhooks y SDK completo",
      "Gestión multi-propiedad",
    ],
    highlighted: true,
    cta: "Solicitar Demo",
  },
  {
    name: "Institucional",
    description: "Para grandes corporaciones y gobiernos.",
    price: "Personalizado",
    period: "",
    features: [
      "Check-ins ilimitados",
      "Establecimientos ilimitados",
      "Account manager dedicado",
      "SLA garantizado 99.99%",
      "Despliegue on-premise opcional",
      "Integración con sistemas legacy",
      "Auditorías de seguridad",
    ],
    highlighted: false,
    cta: "Contactar Ventas",
  },
]

export function PricingSection() {
  return (
    <section id="precios" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Planes adaptados a tu escala
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Desde hoteles boutique hasta grandes cadenas institucionales. 
            Sin compromisos a largo plazo.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-xl border p-8 shadow-sm transition-shadow hover:shadow-md",
                plan.highlighted
                  ? "border-primary bg-card ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-card-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price === "Personalizado" ? "" : "€"}
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="#contacto">{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
