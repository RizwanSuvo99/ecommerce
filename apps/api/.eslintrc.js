/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@ecommerce/eslint-config/nest'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
