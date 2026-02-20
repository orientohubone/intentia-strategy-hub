---
description: Run AdminPanel vitest suite in isolation
---
1. Run `npx vitest run src/test/AdminPanel.test.tsx` to execute only the failing test.
2. Once the isolated test passes, proceed with `npm test` if needed to ensure other suites stay green.
