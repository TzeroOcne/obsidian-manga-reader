import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin';

/**
 * @template T
 * @typedef {import('eslint').Linter.RuleEntry<T>} RuleEntry
 * */

/**
 * @typedef {import('@stylistic/eslint-plugin/rule-options').RuleOptions} RuleOptions
 * @typedef {{
 *  [Key in keyof RuleOptions]: RuleEntry<RuleOptions[Key]>
 * }} StylisticRules
 * */
/** @type {StylisticRules} */
const stylisticRules = {
  "@stylistic/semi": [
    "error",
    "always",
  ],
  "@stylistic/comma-dangle": [
    "error",
    "always-multiline",
  ],
  "@stylistic/indent": [
    "error",
    2,
  ],
  "@stylistic/quotes": [
    "error",
    "single",
  ],
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.config({
    rules: {
      '@typescript-eslint/no-unused-vars': [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
    },
  }),
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: stylisticRules,
  },
];
