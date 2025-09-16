// @ts-check
import globals from "globals";

export default [
  {
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
    files: ["**/*.js"],
    ignores: ["public/vendor/**", "node_modules/**", "**/*.min.js"],
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["warn", "always"],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-console": "off",
    },
  },
];
