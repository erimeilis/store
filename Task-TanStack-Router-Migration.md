# Task: Migrate to TanStack Router

## Objective
Migrate the current Hono SSR + custom routing system to TanStack Router for improved type safety, modern routing patterns, and better developer experience.

## Current State Analysis

### Existing Architecture
- **Framework**: Hono (TypeScript web framework) for SSR
- **Routing**: Custom configuration-based routing system
- **Routes**: 25+ manually defined routes in `/frontend/src/config/routes.ts`
- **Handlers**: Server-side route handlers in `/frontend/src/handlers/`
- **Components**: Page components in `/frontend/src/app/` following Next.js-like structure
- **Authentication**: Custom auth middleware applied per-route
- **Layouts**: Custom layout system with provider/renderer pattern
- **Hydration**: Manual client-side hydration with layout resolution

### Current Routing Pattern
```typescript
// Server-side route definition
{
  path: '/dashboard/users/edit/:id',
  handler: async (c) => (await import('@/handlers/users')).handleEditUserPage(c),
  layout: 'dashboard',
  segment: 'edit',
  requiresAuth: true
}

// Handler function
export async function handleEditUserPage(c: Context) {
  const user = c.get('user')
  const userId = c.req.param('id')
  const userData = await fetchUserData(userId, c)
  const props = buildPageProps(user, c, { userData })
  return renderDashboardPage(c, '/dashboard/users/edit/:id', props)
}

// React component
export default function EditUserPage({ userData, user }) {
  return <UserEditForm userData={userData} user={user} />
}
```

## Migration Strategy

### Phase 1: Setup & Infrastructure
1. **Install TanStack Router dependencies**
   ```bash
   npm install @tanstack/react-router @tanstack/router-devtools @tanstack/router-plugin
   ```

2. **Configure build system**
   - Add TanStack Router Vite plugin
   - Create `tsr.config.json` for route generation
   - Update TypeScript configuration

3. **Create initial route structure**
   ```
   frontend/src/routes/
   ├── __root.tsx              # Root layout with HTML structure
   ├── index.tsx               # Login page (/)
   ├── error.tsx               # Error page
   ├── dashboard/              # Dashboard routes
   │   ├── index.tsx           # Dashboard home
   │   ├── users/
   │   │   ├── index.tsx       # Users list
   │   │   ├── create.tsx      # Create user
   │   │   └── edit.$id.tsx    # Edit user (dynamic)
   │   ├── tables/
   │   │   ├── index.tsx       # Tables list
   │   │   ├── create.tsx      # Create table
   │   │   └── $id/            # Dynamic table routes
   │   │       ├── data.tsx    # Table data
   │   │       ├── edit.tsx    # Edit table
   │   │       └── columns.tsx # Manage columns
   │   └── sales/
   │       ├── index.tsx       # Sales list
   │       ├── analytics.tsx   # Analytics
   │       └── inventory/
   │           ├── index.tsx   # Inventory
   │           └── alerts.tsx  # Alerts
   └── demo.tsx                # Demo page
   ```

### Phase 2: Route Migration
1. **Convert route definitions**
   - Transform each route config to TanStack Router file-based route
   - Migrate route handlers to loader functions
   - Convert dynamic params (`:id` → `$id`)
   - Implement search parameter validation with Zod

2. **Authentication integration**
   ```typescript
   // Route with auth requirement
   export const Route = createFileRoute('/dashboard/users/')({
     beforeLoad: ({ context }) => {
       if (!context.user) {
         throw redirect({ to: '/' })
       }
     },
     loader: async ({ context, params }) => {
       return await fetchUsers(context)
     },
     component: UsersPage
   })
   ```

3. **Data loading patterns**
   - Move handler data fetching logic to route loaders
   - Implement proper error handling and loading states
   - Add search parameter validation for filtering/pagination

### Phase 3: Component Migration
1. **Update page components**
   - Remove handler-specific props interfaces
   - Use TanStack Router hooks (`useLoaderData`, `useParams`, `useSearch`)
   - Implement proper TypeScript types from route definitions

2. **Navigation updates**
   - Replace manual `window.location.href` with TanStack Router `Link` components
   - Update navigation components to use typed routes
   - Implement proper search parameter handling

3. **Layout system integration**
   - Migrate custom layout system to TanStack Router layout routes
   - Implement nested route structures for dashboard sections
   - Preserve existing UI components and styling

### Phase 4: Advanced Features
1. **Search parameter validation**
   ```typescript
   const searchSchema = z.object({
     page: z.number().min(1).catch(1),
     sort: z.string().optional(),
     direction: z.enum(['asc', 'desc']).optional(),
     filterName: z.string().optional()
   })

   export const Route = createFileRoute('/dashboard/users/')({
     validateSearch: searchSchema,
     // ...
   })
   ```

2. **Code splitting & lazy loading**
   - Implement route-based code splitting
   - Add loading components for data fetching states
   - Optimize bundle sizes for better performance

3. **SSR compatibility**
   - Ensure TanStack Router works with existing Hono SSR setup
   - Implement proper hydration strategy
   - Maintain SEO-friendly server-side rendering

## Files to Modify/Create

### New Files
- `frontend/src/routes/__root.tsx` - Root route with HTML structure
- `frontend/src/routes/*.tsx` - All route files (25+ files)
- `frontend/tsr.config.json` - TanStack Router configuration
- `frontend/src/router.tsx` - Router instance configuration
- `frontend/src/routeTree.gen.ts` - Generated route tree (auto-generated)

### Modified Files
- `frontend/vite.config.js` - Add TanStack Router plugin
- `frontend/src/index.tsx` - Remove custom routing, add RouterProvider
- `frontend/src/client.tsx` - Update hydration for TanStack Router
- `frontend/package.json` - Add TanStack Router dependencies
- All page components in `frontend/src/app/` - Update to use Router hooks

### Removed Files
- `frontend/src/config/routes.ts` - Replace with file-based routing
- `frontend/src/lib/route-setup.tsx` - No longer needed
- `frontend/src/handlers/*.tsx` - Logic moved to route loaders
- `frontend/src/lib/layout-system.js` - Replace with TanStack Router layouts
- `frontend/src/components/LayoutProvider.tsx` - No longer needed
- `frontend/src/components/LayoutRenderer.tsx` - No longer needed

## Testing Strategy

### Unit Tests
- Test individual route loaders for data fetching
- Test component rendering with mocked router context
- Test search parameter validation schemas

### Integration Tests
- Test route navigation flows
- Test authentication redirects
- Test data loading and error states
- Test SSR hydration compatibility

### Manual Testing
- Verify all 25+ routes work correctly
- Test authentication flows and redirects
- Test search/filter functionality across pages
- Verify mobile responsiveness remains intact
- Test browser back/forward navigation

## Migration Risks & Mitigation

### High Risk
1. **SSR Compatibility** - TanStack Router may not integrate seamlessly with existing Hono SSR
   - *Mitigation*: Implement gradual migration, test SSR thoroughly

2. **Complex Authentication Flow** - Custom auth middleware may need significant rework
   - *Mitigation*: Study TanStack Router auth patterns, implement context-based auth

3. **API Proxy Routes** - Current API proxy system may conflict with new routing
   - *Mitigation*: Preserve API proxy setup, ensure route precedence is correct

### Medium Risk
1. **Layout System Changes** - Custom layout system needs complete rework
   - *Mitigation*: Plan layout migration carefully, preserve existing UI components

2. **Search Parameter Handling** - Complex filtering may need restructuring
   - *Mitigation*: Use Zod schemas for validation, test all filter combinations

3. **Build System Changes** - Vite plugin integration may cause build issues
   - *Mitigation*: Test build process thoroughly, have rollback plan ready

## Success Criteria
- [ ] All existing routes work with TanStack Router
- [ ] Authentication flow preserved and working
- [ ] Search/filtering functionality intact
- [ ] SSR and hydration working correctly
- [ ] Type safety improved with full TypeScript inference
- [ ] Bundle size maintained or reduced
- [ ] Performance maintained or improved
- [ ] All tests passing
- [ ] No breaking changes to user experience

## Estimated Timeline
- **Phase 1 (Setup)**: 2-3 days
- **Phase 2 (Route Migration)**: 5-7 days
- **Phase 3 (Component Migration)**: 3-4 days
- **Phase 4 (Advanced Features)**: 2-3 days
- **Testing & Polish**: 2-3 days
- **Total**: 14-20 days

## Next Steps
1. Create backup branch for migration
2. Set up TanStack Router infrastructure
3. Create initial route structure
4. Begin route-by-route migration
5. Test each migrated section thoroughly
6. Update documentation and team knowledge