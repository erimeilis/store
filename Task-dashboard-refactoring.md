# Task: Dashboard Refactoring with Model-List Implementation

## Objective
Replace the ItemsTable component with the standardized model-list component and create comprehensive management pages for tokens and allowed emails tables, ensuring consistent UI patterns across all dashboard functionality.

## Approach
1. **Analysis Phase**: Study existing ItemsTable usage and understand model-list pattern from users page
2. **Refactoring Phase**: Replace ItemsTable with model-list in dashboard
3. **Extension Phase**: Create new management pages for tokens and allowed-emails tables
4. **Quality Phase**: Fix all lint and type errors
5. **Navigation Phase**: Update top navigation menu to include all management pages

## Files to Modify/Create
- Delete: `frontend/src/components/ItemsTable.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`
- Create: `frontend/src/app/dashboard/tokens/page.tsx`
- Create: `frontend/src/app/dashboard/allowed-emails/page.tsx`
- Modify: `frontend/src/app/dashboard/layout.tsx`
- Fix: Various components with lint/type errors

## Testing Strategy
- Ensure all TypeScript errors are resolved
- Verify ESLint passes without errors
- Test that all new navigation links work correctly
- Validate that model-list functionality is consistent across all pages