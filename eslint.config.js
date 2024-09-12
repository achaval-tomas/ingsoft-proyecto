import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
        ],
        files: ["**/*.{ts,tsx}"],
        settings: {
            react: { version: "18.3" },
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            indent: ["warn", 4, { SwitchCase: 1 }],
            quotes: ["warn", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["warn", "always-multiline"],
            "comma-spacing": ["warn", { before: false, after: true }],
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-trailing-spaces": "warn",
            "object-curly-spacing": ["warn", "always"],
            "arrow-spacing": ["warn", { before: true, after: true }],
            "no-multi-spaces": "warn",
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    }
);
