import { useState } from "react"
import {
  Check,
  KeyRound,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-6 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  phone: string
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type TwoFactorStep = "idle" | "setup" | "enabled"

const INITIAL_PROFILE: ProfileForm = {
  firstName: "George",
  lastName: "Nunn",
  email: "george.nunn@sykescottages.co.uk",
  jobTitle: "Partner Manager",
  phone: "+44 7700 900123",
}

const DEMO_BACKUP_CODES = ["8F2K-91LQ", "P3NM-47VX", "Q9WT-2H5C", "M6YR-8BKD"] as const

export function AdminPage() {
  const [profile, setProfile] = useState<ProfileForm>(INITIAL_PROFILE)
  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [twoFactorStep, setTwoFactorStep] = useState<TwoFactorStep>("idle")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null)

  function updateProfile<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setProfileSaved(false)
  }

  function updatePassword<K extends keyof PasswordForm>(key: K, value: PasswordForm[K]) {
    setPassword((prev) => ({ ...prev, [key]: value }))
    setPasswordSaved(false)
    setPasswordError(null)
  }

  function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault()
    setProfileSaved(true)
  }

  function handleSavePassword(event: React.FormEvent) {
    event.preventDefault()
    if (!password.currentPassword || !password.newPassword) {
      setPasswordError("Please fill in all password fields.")
      return
    }
    if (password.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("New password and confirmation do not match.")
      return
    }
    setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setPasswordSaved(true)
    setPasswordError(null)
  }

  function startTwoFactorSetup() {
    setTwoFactorStep("setup")
    setVerificationCode("")
    setTwoFactorError(null)
    setTwoFactorMessage(null)
  }

  function cancelTwoFactorSetup() {
    setTwoFactorStep(twoFactorEnabled ? "enabled" : "idle")
    setVerificationCode("")
    setTwoFactorError(null)
  }

  function confirmTwoFactorSetup(event: React.FormEvent) {
    event.preventDefault()
    const code = verificationCode.replace(/\s/g, "")
    if (!/^\d{6}$/.test(code)) {
      setTwoFactorError("Enter the 6-digit code from your authenticator app.")
      return
    }
    setTwoFactorEnabled(true)
    setTwoFactorStep("enabled")
    setVerificationCode("")
    setTwoFactorError(null)
    setTwoFactorMessage("Two-factor authentication is now enabled.")
  }

  function resetTwoFactor() {
    setTwoFactorEnabled(false)
    setTwoFactorStep("idle")
    setVerificationCode("")
    setTwoFactorError(null)
    setTwoFactorMessage(
      "Two-factor authentication has been reset. Set it up again to secure your account."
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className={MONO_LABEL}>Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your {PARTNER_BRANDING.shortName} account details and sign-in settings.
        </p>
      </div>

      <section className={PANEL}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">User details</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update the name, email, and contact details used across the partner portal.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="admin-first-name">First name</Label>
              <Input
                id="admin-first-name"
                value={profile.firstName}
                onChange={(event) => updateProfile("firstName", event.target.value)}
                autoComplete="given-name"
              />
            </Field>
            <Field>
              <Label htmlFor="admin-last-name">Last name</Label>
              <Input
                id="admin-last-name"
                value={profile.lastName}
                onChange={(event) => updateProfile("lastName", event.target.value)}
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="admin-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                className="pl-9"
                value={profile.email}
                onChange={(event) => updateProfile("email", event.target.value)}
                autoComplete="email"
              />
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="admin-job-title">Job title</Label>
              <Input
                id="admin-job-title"
                value={profile.jobTitle}
                onChange={(event) => updateProfile("jobTitle", event.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="admin-phone">Phone</Label>
              <Input
                id="admin-phone"
                type="tel"
                value={profile.phone}
                onChange={(event) => updateProfile("phone", event.target.value)}
                autoComplete="tel"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {profileSaved ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Check className="size-3.5" />
                Profile details saved
              </p>
            ) : (
              <span />
            )}
            <Button type="submit" className="gap-1.5">
              <Save className="size-3.5" />
              Save details
            </Button>
          </div>
        </form>
      </section>

      <section className={PANEL}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Password</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Change the password used to sign in to the partner portal.
            </p>
          </div>
        </div>

        <Separator className="my-5" />

        <form onSubmit={handleSavePassword} className="space-y-4">
          <Field>
            <Label htmlFor="admin-current-password">Current password</Label>
            <Input
              id="admin-current-password"
              type="password"
              value={password.currentPassword}
              onChange={(event) => updatePassword("currentPassword", event.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="admin-new-password">New password</Label>
              <Input
                id="admin-new-password"
                type="password"
                value={password.newPassword}
                onChange={(event) => updatePassword("newPassword", event.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field>
              <Label htmlFor="admin-confirm-password">Confirm new password</Label>
              <Input
                id="admin-confirm-password"
                type="password"
                value={password.confirmPassword}
                onChange={(event) => updatePassword("confirmPassword", event.target.value)}
                autoComplete="new-password"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {passwordError ? (
              <p className="text-xs font-medium text-destructive">{passwordError}</p>
            ) : passwordSaved ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Check className="size-3.5" />
                Password updated
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            )}
            <Button type="submit" variant="outline" className="gap-1.5">
              <KeyRound className="size-3.5" />
              Update password
            </Button>
          </div>
        </form>
      </section>

      <section className={PANEL}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Two-factor authentication</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add an authenticator app for an extra layer of security when signing in.
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
              twoFactorEnabled
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {twoFactorEnabled ? "Enabled" : "Not set up"}
          </span>
        </div>

        <Separator className="my-5" />

        {twoFactorMessage ? (
          <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="size-3.5" />
            {twoFactorMessage}
          </p>
        ) : null}

        {twoFactorStep === "idle" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Protect your partner login with a one-time code from an authenticator app such as
              Google Authenticator, 1Password, or Authy.
            </div>
            <div className="flex justify-end">
              <Button type="button" className="gap-1.5" onClick={startTwoFactorSetup}>
                <Smartphone className="size-3.5" />
                Set up 2FA
              </Button>
            </div>
          </div>
        ) : null}

        {twoFactorStep === "setup" ? (
          <form onSubmit={confirmTwoFactorSetup} className="space-y-5">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                Install an authenticator app on your phone.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                Scan the QR code below, or enter the setup key manually.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                Enter the 6-digit verification code to finish setup.
              </li>
            </ol>

            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/70 bg-muted/20 p-5 sm:flex-row sm:items-start">
              <div
                aria-hidden
                className="grid size-36 shrink-0 place-items-center rounded-xl border border-border bg-background p-3"
              >
                <div className="grid size-full grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "rounded-[2px]",
                        [
                          0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24, 6, 8, 12, 16, 18,
                        ].includes(index)
                          ? "bg-foreground"
                          : "bg-transparent"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Manual setup key
                  </p>
                  <p className="mt-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-wider text-foreground">
                    SYKE-P1KL-2FAX-GEOR
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this key private. You&apos;ll need it if you change devices before finishing
                  setup.
                </p>
              </div>
            </div>

            <Field>
              <Label htmlFor="admin-2fa-code">Verification code</Label>
              <Input
                id="admin-2fa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => {
                  setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  setTwoFactorError(null)
                }}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {twoFactorError ? (
                <p className="text-xs font-medium text-destructive">{twoFactorError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Demo: any 6-digit code will confirm setup.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={cancelTwoFactorSetup}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Enable 2FA
                </Button>
              </div>
            </div>
          </form>
        ) : null}

        {twoFactorStep === "enabled" ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Authenticator app is linked to this account. You&apos;ll be asked for a code when
              signing in from a new device.
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Backup codes
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {DEMO_BACKUP_CODES.map((code) => (
                  <p
                    key={code}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-sm tracking-wider text-foreground"
                  >
                    {code}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Store these somewhere safe. Each code can be used once if you lose access to your
                authenticator.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={startTwoFactorSetup}
              >
                <RefreshCcw className="size-3.5" />
                Reconfigure
              </Button>
              <Button type="button" variant="outline" className="gap-1.5" onClick={resetTwoFactor}>
                <ShieldOff className="size-3.5" />
                Reset 2FA
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <p
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground"
        )}
      >
        Changes apply to your {PARTNER_BRANDING.name} partner login. Contact Pikl support if you
        need help recovering access.
      </p>
    </div>
  )
}
