import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileForm from "@/app/(dashboard)/dashboard/_components/ProfileForm";
import ChangePasswordForm from "@/app/(dashboard)/dashboard/_components/ChangePasswordForm";
import DeleteAccountForm from "@/app/(dashboard)/dashboard/_components/DeleteAccountForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <ProfileForm user={session.user} />
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
          <DeleteAccountForm />
        </div>
      </div>
    </div>
  );
}
