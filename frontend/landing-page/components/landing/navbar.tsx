"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#caracteristicas", label: "Características" },
  { href: "#casos-de-uso", label: "Casos de Uso" },
  { href: "#tecnologia", label: "Tecnología" },
  { href: "#precios", label: "Precios" },
  { href: "#contacto", label: "Contacto" },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Zeqium</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            {mounted && (
              <>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>

          {/* CTA Button */}
          <Button className="hidden sm:inline-flex" asChild>
            <Link href="#contacto">Solicitar Demo</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menú</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "border-b border-border bg-background md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Button className="w-full" asChild>
              <Link href="#contacto">Solicitar Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
