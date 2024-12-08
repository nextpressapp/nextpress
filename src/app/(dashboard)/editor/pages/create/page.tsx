import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";
import PageForm from "@/app/(dashboard)/editor/pages/_components/PageForm";

export default async function CreatePagePage() {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)) {
        redirect("/");
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Create New Page</h2>
            <PageForm />
        </div>
    );
}