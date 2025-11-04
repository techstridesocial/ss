import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables if they start with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",  // Changed to warn instead of error
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // Allow 'any' type (we'll fix these gradually)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty interfaces
      "@typescript-eslint/no-empty-object-type": "warn",
      // Prefer const is a warning, not error
      "prefer-const": "warn",
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      // Allow HTML links (we'll fix these gradually)
      "@next/next/no-html-link-for-pages": "warn",
      // Allow missing display names
      "react/display-name": "warn",
      // React hooks warnings
      "react-hooks/rules-of-hooks": "warn",
      // Allow @ts-ignore
      "@typescript-eslint/ban-ts-comment": "warn",
      // Allow require imports
      "@typescript-eslint/no-require-imports": "warn",
      // Prevent circular dependencies (prevents "Cannot access before initialization" errors)
      "import/no-cycle": ["error", { "maxDepth": 1 }]
    }
  }
];

export default eslintConfig;
