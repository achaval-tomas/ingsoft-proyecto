import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import stylisticJsx from "@stylistic/eslint-plugin-jsx";

export default tseslint.config(
    { ignores: ["dist", "coverage/"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
        ],
        files: ["**/*.{ts,tsx}"],
        ignores: ["vitest.config.ts"],
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
            "@stylistic": stylistic,
            "@stylistic/jsx": stylisticJsx,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            indent: ["warn", 4, { SwitchCase: 1 }],
            quotes: ["warn", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["warn", "always-multiline"],
            "comma-spacing": ["warn", { before: false, after: true }],
            curly: ["warn", "all"],
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-trailing-spaces": "warn",
            "object-curly-spacing": ["warn", "always"],
            "arrow-spacing": ["warn", { before: true, after: true }],
            "no-multi-spaces": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@stylistic/array-bracket-spacing": ["warn", "never"],
            "@stylistic/space-infix-ops": ["warn"],
            "@stylistic/member-delimiter-style": ["warn"],
            "@stylistic/block-spacing": ["warn", "always"],
            "@stylistic/keyword-spacing": ["warn"],
            "@stylistic/brace-style": [
                "warn",
                "1tbs",
                { allowSingleLine: true },
            ],
            "@stylistic/jsx/jsx-equals-spacing": ["warn", "never"],
            "@stylistic/jsx/jsx-tag-spacing": [
                "warn",
                {
                    afterOpening: "never",
                    beforeClosing: "never",
                    beforeSelfClosing: "proportional-always",
                    closingSlash: "never",
                },
            ],
            "@stylistic/jsx/jsx-curly-spacing": ["warn", "never"],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    }
);
