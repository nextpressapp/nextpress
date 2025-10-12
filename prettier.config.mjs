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

  // Add <BUILTIN_MODULES> here to keep Node built-ins at the top (replaces the old trivago flag)
  importOrder: [
    "<BUILTIN_MODULES>",
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@workspace/(.*)$",
    "",
    "^types$",
    "^@/types/(.*)$",
    "^@/config/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/registry/(.*)$",
    "^@/styles/(.*)$",
    "^@/app/(.*)$",
    "^@/www/(.*)$",
    "",
    "^[./]",
  ],
  // Supported options for @ianvs
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderCaseSensitive: false,
  // if you use side-effect imports that must never move, list them here:
  // importOrderSafeSideEffects: ['**/polyfills.ts'],

  plugins: [sortImports, "prettier-plugin-tailwindcss"],
}

export default prettierConfig
