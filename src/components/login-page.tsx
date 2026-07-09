import { useState, type FormEvent } from "react"
import { Eye, EyeOff, LogIn, Mail, SquareChartGantt, Zap } from "lucide-react"

import { PartnerLogo } from "@/components/partner-logo"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { PARTNER_BRANDING } from "@/lib/partner-branding"

const DEMO_EMAIL = "george@sykes.com"
const DEMO_PASSWORD = "pikldemo"

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

function KeystoneMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-white/15 text-white shadow-sm ring-1 ring-white/25 backdrop-blur-sm">
        <SquareChartGantt aria-hidden className="size-7" strokeWidth={2} />
      </span>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Keystone</h1>
      <p className="mt-1.5 text-sm text-white/75">Partner portal</p>
    </div>
  )
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const showDemoHint = !email.trim() || !password

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0054cc] px-6 py-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-28 size-[34rem] rounded-full bg-[radial-gradient(circle,_#7eb6ff_0%,_#4d9fff_35%,_transparent_70%)] opacity-90 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-[8%] size-[28rem] rounded-full bg-[radial-gradient(circle,_#a8d0ff_0%,_#66a6ff_40%,_transparent_72%)] opacity-80 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-18%] left-[18%] size-[32rem] rounded-full bg-[radial-gradient(circle,_#3389ff_0%,_#006bff_38%,_transparent_70%)] opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[18%] bottom-[12%] size-[18rem] rounded-full bg-[radial-gradient(circle,_rgb(255_255_255_/_0.45)_0%,_transparent_68%)] blur-3xl"
      />

      <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
        <PartnerLogo inverted className="[&_span]:h-7 [&_span]:max-w-[160px]" />
      </div>

      <div className="absolute right-6 top-6 z-10 sm:right-8 sm:top-8">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
          <Zap className="size-3.5 fill-white/80 text-white/80" aria-hidden />
          Powered by Pikl
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <KeystoneMark className="mb-8" />

        <div className="rounded-2xl border border-white/25 bg-white/15 p-8 text-white shadow-[0_20px_50px_rgb(0_40_120_/_0.28)] backdrop-blur-xl">
          {showDemoHint ? (
            <p className="mb-5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 text-center text-xs leading-relaxed text-white/80">
              Enter <span className="font-semibold text-white">{DEMO_EMAIL}</span> and password{" "}
              <span className="font-semibold text-white">{DEMO_PASSWORD}</span>
            </p>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Field>
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={DEMO_EMAIL}
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "border-white/25 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-white/50 focus-visible:ring-white/30",
                  errors.email && "border-rose-300 focus-visible:ring-rose-300/40"
                )}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-rose-200">
                  {errors.email}
                </p>
              )}
            </Field>

            <Field>
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={DEMO_PASSWORD}
                  value={password}
                  onChange={(event) => handlePasswordChange(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={cn(
                    "border-white/25 bg-white/10 pr-11 text-white placeholder:text-white/50 focus-visible:border-white/50 focus-visible:ring-white/30",
                    errors.password && "border-rose-300 focus-visible:ring-rose-300/40"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-rose-200">
                  {errors.password}
                </p>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full border-0 bg-white text-primary hover:bg-white/90"
            >
              <LogIn className="size-4" />
              Log in
            </Button>
          </form>

          <div className="mt-6 border-t border-white/20 pt-6 text-center">
            <p className="text-sm text-white/70">Don&apos;t have an account?</p>
            <a
              href={`mailto:${PARTNER_BRANDING.contactEmail}?subject=${encodeURIComponent(`${PARTNER_BRANDING.name} partner portal access`)}`}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
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
