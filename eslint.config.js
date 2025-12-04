// @ts-check
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Глобальные игнорируемые файлы
  {
    ignores: ["node_modules/**", "dist/**", "public/vendor/**", "**/*.min.js", "eslint.config.js"],
  },

  // Конфигурация для JavaScript файлов
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        Chart: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["warn", "always"],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-console": "off",
    },
  },

  // Конфигурация для TypeScript файлов
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Стилистические правила
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-console": "off",

      // TypeScript специфичные правила
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      // Ослабление строгих правил для реального кода
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: true }],
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/prefer-regexp-exec": "warn",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    },
  },

  // Ослабленные правила для тестов
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  }
);
