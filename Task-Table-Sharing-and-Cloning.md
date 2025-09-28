# Task: Table Sharing and Cloning Feature

## Objective
Implement enhanced table visibility controls and table structure cloning functionality:

1. **Enhanced Table Visibility System**:
   - Add "shared" visibility level to existing private/public system
   - Private: Only visible and editable by owner and admins
   - Public: Visible by everyone, but editable by owner and admins
   - Shared: Visible and editable by any authenticated user

2. **Table Structure Cloning**:
   - Add "hollow clone" functionality to create table copy without data
   - Add clone icon-button to row actions in "Your Tables" section

## Approach

### Phase 1: Database Schema Updates
- Update `user_tables` table to support new visibility enum: 'private' | 'public' | 'shared'
- Create database migration for the new visibility column
- Update existing records to maintain current behavior

### Phase 2: Backend API Updates
- Update table access middleware to handle shared tables
- Modify table permissions logic in repositories and services
- Add table cloning endpoint that copies structure without data
- Update table listing and filtering logic

### Phase 3: Frontend Updates
- Update table creation/editing forms to include shared option
- Add clone button to table row actions with appropriate icon
- Update table visibility badges and filtering
- Implement clone table modal/confirmation dialog

### Phase 4: Access Control Logic
- Private tables: owner + admins (read/write)
- Public tables: everyone (read), owner + admins (write)
- Shared tables: authenticated users (read/write), owner + admins (all permissions)

## Files to Modify/Create

### Backend Files:
- `prisma/migrations/013_add_shared_visibility/migration.sql` - New migration
- `src/types/dynamic-tables.ts` - Update visibility enum
- `src/middleware/table-access.ts` - Update access control logic
- `src/repositories/tableRepository.ts` - Update table queries and access checks
- `src/services/tableService/` - Add cloning service and update permissions
- `src/routes/tables.ts` - Add clone endpoint

### Frontend Files:
- `frontend/src/types/dynamic-tables.ts` - Update visibility types
- `frontend/src/app/dashboard/tables/page.tsx` - Add clone button
- `frontend/src/app/dashboard/tables/create/page.tsx` - Add shared option
- `frontend/src/app/dashboard/tables/[id]/edit/page.tsx` - Add shared option
- `frontend/src/components/table-visibility-badge.tsx` - Support shared visibility
- `frontend/src/handlers/tables.tsx` - Add clone functionality

## Testing Strategy

### Backend Testing:
- Test table access permissions for each visibility level
- Test table cloning functionality preserves structure correctly
- Test migration doesn't break existing tables
- Test API endpoints with different user roles

### Frontend Testing:
- Test visibility selection in create/edit forms
- Test clone button functionality and user feedback
- Test table filtering with new shared option
- Test access control in UI matches backend permissions

### Integration Testing:
- Test end-to-end table creation with shared visibility
- Test complete clone workflow from button click to new table
- Test permission boundaries between different user types
- Test database migration in all environments (local/preview/production)