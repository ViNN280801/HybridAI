// HybridAI/eslint.config.mjs

import { dirname } from "path";
import { fileURLToPath } from "url";
import next from "@next/eslint-plugin-next";
import typescript from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat();

export default [
  ...compat.extends("plugin:@next/next/core-web-vitals"),
  {
    ignores: [".next", "node_modules"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@next/next": next,
      "@typescript-eslint": typescript,
      "react-hooks": hooks,
      "react-refresh": refresh,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": "warn",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
