import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "@/app/(dashboard)/editor/pages/_components/PageForm";

export default async function EditPagePage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !["ADMIN", "MANAGER", "EDITOR"].includes(session.user.role)
    ) {
        redirect("/");
    }

    const page = await prisma.page.findUnique({
        where: { id: params.id },
    });

    if (!page) {
        redirect("/editor/pages");
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Edit Page</h2>
            <PageForm page={page} />
        </div>
    );
}
