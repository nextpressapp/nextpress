// prettier.config.mjs
/** @type {import('prettier').Config} */
export default {
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "es5",

  importOrder: [
    "<BUILTIN_MODULES>",
    "^(react|react-dom)(/.*)?$",
    "^next(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@workspace/(.*)$",
    "",
    "^types$",
    "^@/types(/.*)?$",
    "@/db",
    "^@/(db|config|emails|lib|hooks)/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/(registry|styles|app|www)/(.*)$",
    "",
    "^[./]",
    "",
    "^.+\\.(css|scss|sass)$",
  ],

  // IanVS plugin options
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderCaseSensitive: false,
  importOrderTypeScriptVersion: "5.6.0", // <-- set to your actual TS version

  // Keep Tailwind last
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
}
