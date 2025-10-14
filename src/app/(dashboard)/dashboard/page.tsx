import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { ChangePasswordForm } from "@/components/dashboard/change-password-form"
import { DeleteAccountForm } from "@/components/dashboard/delete-account-form"
import { PasskeyManager } from "@/components/dashboard/passkey-manager"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { TwoFactorForm } from "@/components/dashboard/two-factor-form"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/sign-in")

  const initialValues = {
    name: session.user?.name ?? "",
    email: session.user?.email ?? "",
  }

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0">
      <div>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      {/* Profile */}
      <section className="mb-10">
        <ProfileForm initialValues={initialValues} />
      </section>

      {/* Security: Passkeys + 2FA */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Security</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <PasskeyManager />
          <TwoFactorForm />
        </div>
      </section>

      {/* Password + Danger zone */}
      <section className="mb-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Change Password</h2>
            <ChangePasswordForm />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Danger Zone</h2>
            <DeleteAccountForm />
          </div>
        </div>
      </section>
    </div>
  )
}
