import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { ChangePasswordForm } from "@/components/dashboard/change-password-form"
import { DeleteAccountForm } from "@/components/dashboard/delete-account-form"
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
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-8">
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
          <ProfileForm initialValues={initialValues} />
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Enable Two Factor Authentication</h2>
          <TwoFactorForm />
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Change Password</h2>
          <ChangePasswordForm />
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Delete Account</h2>
          <DeleteAccountForm />
        </div>
      </div>
    </div>
  )
}
