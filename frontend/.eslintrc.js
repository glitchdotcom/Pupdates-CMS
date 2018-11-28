const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
  ],
  env: {
    'es6': true,        // We are writing ES6 code
    'browser': true,    // for the browser
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "allowImportExportEverywhere": false, // import/export must happen at the top level.
  },
  "plugins": [
    "jsx-a11y", // https://www.npmjs.com/package/eslint-plugin-jsx-a11y
  ],
  "rules": {
    // Overrides/additions to eslint:recommended:
    "no-console": OFF,
    "no-else-return": ERROR,
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "semi": ["error", "always"],
    "no-debugger": WARN,
    
    "jsx-a11y/label-has-for": OFF, // It's been deprecated. -- https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/label-has-for.md
    
    // Overrides of react/recommended:
    "react/no-unescaped-entities": ["error", {"forbid": [`"`, ">", "}"]}], // permit ' in jsx html,
    "react/prop-types": [OFF], // disabled so we can use composed prop-types
  },
  "settings": {
    "react": {
      "version": "16.6.3" // Should match package.json
    }
  }
}
