# Task: Admin Dummy Table Generation

## Objective
Create an admin-only button in the Dynamic Tables page that generates 100 dummy tables with 200 test records each for testing and development purposes.

## Approach
1. Create a backend endpoint `/api/admin/generate-dummy-tables` that:
   - Validates admin access
   - Generates 100 tables with randomized schemas
   - Populates each table with 200 faker-generated records
   - Returns progress/completion status

2. Create a utility script using Faker.js to:
   - Generate realistic table schemas (varying column types)
   - Generate realistic data for each column type
   - Batch insert records for performance

3. Add an admin-only button to the frontend:
   - Check user role (admin only)
   - Show confirmation dialog before generation
   - Display progress/loading state
   - Handle success/error states

## Files to Modify/Create
- `src/routes/admin.ts` - New admin routes file
- `src/services/dummyTableGenerator.ts` - Table generation logic
- `frontend/src/app/dashboard/tables/page.tsx` - Add admin button
- `frontend/src/handlers/admin.tsx` - Admin API handler

## Testing Strategy
1. Verify admin-only access (non-admins should not see button)
2. Test generation with smaller numbers first (10 tables, 20 records)
3. Verify table schemas are diverse and realistic
4. Check data quality and consistency
5. Monitor performance and database load
6. Test error handling (database failures, timeouts)

## Security Considerations
- Admin role verification required
- Rate limiting to prevent abuse
- Confirmation dialog to prevent accidental clicks
- Consider adding a cleanup endpoint for removing test data
