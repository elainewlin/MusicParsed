module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/no-non-null-assertion":
      "off" /* should maybe enable this later */,
    "arrow-body-style": "error",
    "func-style": "error",
    "linebreak-style": ["error", "unix"],
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
};
