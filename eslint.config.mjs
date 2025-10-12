// eslint.config.mjs
import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import importPlugin from "eslint-plugin-import"
import tseslint from "typescript-eslint"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  // Base JS recs (optional but nice)
  js.configs.recommended,

  // Bring in Next + TS legacy configs
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  // TS/Next plugin wiring
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "@next/next": nextPlugin,
      import: importPlugin,
    },
    rules: {
      // import sanity (complements your Prettier sorter)
      "import/no-duplicates": "error",
      "import/order": ["error", { "newlines-between": "always" }],
      // your TS/console prefs
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Ignores (move these from .eslintignore)
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]

export default config