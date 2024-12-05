export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About NextPress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              NextPress is a modern, flexible CMS built with Next.js, offering
              powerful content management capabilities for your website.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} NextPress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
