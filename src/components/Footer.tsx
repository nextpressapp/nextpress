export function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    © {new Date().getFullYear()} NextPress. All rights reserved.
                </div>
            </div>
        </footer>
)
}