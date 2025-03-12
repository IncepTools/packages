import eslintConfigPrettier from "eslint-config-prettier";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";
import globals from "globals";
import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.js"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            sonarjs: sonarjsPlugin,
            "unused-imports": unusedImportsPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            "no-case-declarations": "warn",
            "no-console": "error",
            "no-inline-comments": "error",
            "no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "no-warning-comments": "warn",
            "new-cap": ["error", { capIsNew: false }],
            camelcase: [
                "off",
                {
                    ignoreDestructuring: true,
                    properties: "never",
                    ignoreImports: true,
                    ignoreGlobals: true,
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: ["interface", "class"],
                    format: ["PascalCase"],
                },
            ],
            "no-duplicate-imports": "error",
            "sonarjs/no-all-duplicated-branches": "error",
            "sonarjs/no-element-overwrite": "error",
            "sonarjs/no-extra-arguments": "error",
            "sonarjs/no-identical-conditions": "error",
            "sonarjs/no-identical-expressions": "error",
            "sonarjs/no-one-iteration-loop": "error",
            "sonarjs/no-use-of-empty-return-value": "error",
            "prefer-const": "error",
            // "@typescript-eslint/ban-types": "warn",
            "sonarjs/cognitive-complexity": ["warn", 15],
            "sonarjs/max-switch-cases": ["error", 10],
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-collection-size-mischeck": "error",
            // "sonarjs/no-duplicate-string": ["error", 5],
            "sonarjs/no-duplicated-branches": "error",
            "sonarjs/no-identical-functions": "off",
            "sonarjs/no-redundant-boolean": "error",
            "sonarjs/no-redundant-jump": "warn",
            "sonarjs/no-same-line-conditional": "error",
            "sonarjs/no-small-switch": "warn",
            "sonarjs/no-unused-collection": "error",
            "sonarjs/no-useless-catch": "error",
            "sonarjs/prefer-object-literal": "error",
            "sonarjs/prefer-single-boolean-return": "warn",
            "prettier/prettier": [
                "error",
                {
                    trailingComma: "all",
                    semi: true,
                    tabWidth: 4,
                    endOfLine: "auto",
                    useTabs: true,
                },
            ],
        },
    },
];
