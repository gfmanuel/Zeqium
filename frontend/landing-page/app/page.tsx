import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { UseCasesSection } from "@/components/landing/use-cases-section"
import { TechSection } from "@/components/landing/tech-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <UseCasesSection />
        <TechSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
