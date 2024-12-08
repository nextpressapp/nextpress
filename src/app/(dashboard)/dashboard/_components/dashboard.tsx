import { Header } from "@/app/(dashboard)/dashboard/_components/header";

export function Dashboard() {
    return (
        <div className="flex h-screen">
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {/* Dashboard content goes here */}
                    <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="rounded-lg shadow-md p-6 border-2">
                            <h2 className="text-xl font-semibold mb-4">
                                Widget 1
                            </h2>
                            <p>Content for Widget 1</p>
                        </div>
                        <div className="rounded-lg shadow-md p-6 border-2">
                            <h2 className="text-xl font-semibold mb-4">
                                Widget 2
                            </h2>
                            <p>Content for Widget 2</p>
                        </div>
                        <div className="rounded-lg shadow-md p-6 border-2">
                            <h2 className="text-xl font-semibold mb-4">
                                Widget 3
                            </h2>
                            <p>Content for Widget 3</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
