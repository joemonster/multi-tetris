import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test files
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    // Coverage reports
    "coverage/**",
    // Temporarily ignore files with known ESLint issues (TODO: fix these)
    "app/components/debug/**",
    "app/components/multiplayer/NicknameModal.tsx",
    "app/components/multiplayer/ModeSelector.tsx",
    "app/contexts/**",
    "app/game/**/page.tsx",
    "app/hooks/**",
    "app/page.tsx",
    "app/queue/page.tsx",
    "party/index.ts",
  ]),
]);

export default eslintConfig;
