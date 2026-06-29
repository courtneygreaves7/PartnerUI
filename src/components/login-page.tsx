import { useState, type FormEvent } from "react"
import { LogIn, Mail, SquareChartGantt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type LoginPageProps = {
  onLogin: () => void
}

type FieldErrors = {
  email?: string
  password?: string
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function validateFields() {
    const next: FieldErrors = {}

    if (!email.trim()) {
      next.email = "Email is required"
    } else if (!validateEmail(email)) {
      next.email = "Enter a valid email address"
    }

    if (!password) {
      next.password = "Password is required"
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters"
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (validateFields()) {
      onLogin()
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (submitted) {
      setErrors((prev) => ({
        ...prev,
        email: !value.trim()
          ? "Email is required"
          : !validateEmail(value)
            ? "Enter a valid email address"
            : undefined,
      }))
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (submitted) {
      setErrors((prev) => ({
        ...prev,
        password: !value
          ? "Password is required"
          : value.length < 8
            ? "Password must be at least 8 characters"
            : undefined,
      }))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <SquareChartGantt className="size-8 text-foreground" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Keystone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access partner booking analytics
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset] backdrop-blur-md dark:shadow-none">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive/30")}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(errors.password && "border-destructive focus-visible:ring-destructive/30")}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </Field>

            <Button type="submit" className="w-full">
              <LogIn className="size-4" />
              Log in
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">Don&apos;t have an account?</p>
            <a
              href="mailto:admin@keystone.internal?subject=Keystone%20account%20request"
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Mail className="size-4" />
              Contact administrator
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
