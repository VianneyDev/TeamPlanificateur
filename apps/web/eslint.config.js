import js from "@eslint/js";
import globals from "globals";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const unusedVarsRule = [
  "error",
  {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_",
  },
];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.astro/**",
      "**/.cursor/**",
      "**/.github/skills/**",
      "**/.github/agents/**",
      "**/.impeccable/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,astro}"],
    rules: {
      // Prefer typescript-eslint's unused-vars with `_` escape hatch (TS + Astro).
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": unusedVarsRule,
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Narrow React Hooks surface: correctness only (no React Compiler rules yet).
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
);
