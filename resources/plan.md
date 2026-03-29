Status: Approved by user on 2026-03-23. Ready for implementation handoff.

## Plan: Exact Minimal Mismatch Fixes

Apply the smallest safe set of changes to remove current mismatch risk: backend script/docs mismatch, Jest major mismatch, and Node typings drift, while keeping Node 18 baseline.

**Steps**
1. Phase 1 - Backend script parity:
2. In salon-samochodowy-backend/package.json add scripts so docs command works:
3. Add test script with Node ESM flag: test = node --experimental-vm-modules ./node_modules/jest/bin/jest.js
4. Optional but useful: add test:watch and test:coverage variants with the same runner. *parallel with step 6*
5. Keep existing apidoc script unchanged.
6. Phase 2 - Version parity:
7. Standardize backend Jest to stable 29.7.x to match frontend:
8. Set backend jest to ^29.7.0 and @jest/globals to ^29.7.0.
9. Keep frontend jest stack as-is (already 29.7.0).
10. Standardize @types/node to one Node 18 patch line in both apps:
11. Set both backend and frontend to ^18.19.130. *parallel with step 8*
12. Phase 3 - Docs parity:
13. Update resources/TESTING.md only where needed:
14. Keep Node.js >= 18 requirement.
15. Ensure run command section matches real backend scripts (npm test works directly).
16. Phase 4 - Verify:
17. Reinstall deps in each app (npm install or npm ci).
18. Backend run: npm test.
19. Frontend run: npm test.
20. Confirm editor no longer shows node type definition error in backend tsconfig context.

**Relevant files**
- d:/Projects/AnalizaTesting/web-app-test/web-app-test/salon-samochodowy-backend/package.json - add/align scripts, set Jest 29.7.x, align @types/node
- d:/Projects/AnalizaTesting/web-app-test/web-app-test/salon-samochodowy-frontend/package.json - align @types/node only
- d:/Projects/AnalizaTesting/web-app-test/web-app-test/resources/TESTING.md - keep commands synced with backend scripts
- d:/Projects/AnalizaTesting/web-app-test/web-app-test/salon-samochodowy-backend/jest.config.cjs - should work unchanged; verify after Jest downgrade

**Verification**
1. Backend dependency check: npm ls jest @jest/globals @types/node
2. Frontend dependency check: npm ls jest @types/node
3. Backend tests: npm test
4. Frontend tests: npm test
5. Docs sanity: command examples in resources/TESTING.md run without edits

**Decisions**
- Included now: only mismatch fixes that are low-risk and non-architectural.
- Excluded now: forcing npm audit breaking upgrades (for example sqlite3 major bump) unless team approves.
- Recommended baseline: Node 18 plus Jest 29.7.x across both apps for stability and parity.
