// prettier.config.mjs
import sortImports from "@ianvs/prettier-plugin-sort-imports"

/** @type {import('prettier').Config} */
const prettierConfig = {
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "es5",

  importOrder: [
    "<BUILTIN_MODULES>",

    // Core libs first
    "^(react|react-dom)(/.*)?$",
    "^next(/.*)?$",

    "<THIRD_PARTY_MODULES>",
    "",

    // Monorepo / workspace packages
    "^@workspace/(.*)$",
    "",

    // Local aliases (types first)
    "^types$",
    "^@/types(/.*)?$",
    "@/db",
    "^@/(db|config|emails|lib|hooks)/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/(registry|styles|app|www)/(.*)$",
    "",

    // Relative imports
    "^[./]",

    // Side-effect styles last (optional but handy)
    "",
    "^.+\\.(css|scss|sass)$",
  ],

  // @ianvs options
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderCaseSensitive: false,
  importOrderSortSpecifiers: true,
  importOrderCombineTypeAndValueImports: true,
  importOrderGroupNamespaceSpecifiers: true,
  // importOrderSafeSideEffects: ['**/polyfills.ts'],

  plugins: [sortImports, "prettier-plugin-tailwindcss"], // keep Tailwind plugin last
}

export default prettierConfig
