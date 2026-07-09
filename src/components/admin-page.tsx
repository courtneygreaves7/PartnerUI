import { useState } from "react"
import { Check, KeyRound, Mail, Save, UserRound } from "lucide-react"

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

const INITIAL_PROFILE: ProfileForm = {
  firstName: "George",
  lastName: "Nunn",
  email: "george.nash@sykescottages.co.uk",
  jobTitle: "Partner Manager",
  phone: "+44 7700 900123",
}

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
