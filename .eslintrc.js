module.exports = {
  env: {
    amd: true,
    node: true,
    es6: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2015
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-unused-vars": ["warn"],
    quotes: ["error", "double"],
    semi: ["error", "always"]
  }
};
