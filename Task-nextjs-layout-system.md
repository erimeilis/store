# Task: Next.js-Style Layout System for Hono React Frontend

## Objective
Create a sophisticated layout system for the frontend similar to Next.js App Router, enabling:
- Hierarchical layout nesting based on directory structure
- Shared UI components across route groups
- Layout-specific state management
- Type-safe layout props
- Server-side rendering compatibility with Hono

## Approach

### 1. Layout Architecture Design
- **Layout Discovery**: Create a system to automatically discover and register layouts based on directory structure
- **Layout Hierarchy**: Implement nested layout rendering similar to Next.js `children` prop pattern
- **Layout Context**: Provide context for layouts to share state and configuration
- **Route Groups**: Support for grouped layouts (similar to Next.js `(group)` folders)

### 2. Core Components
- **LayoutProvider**: Context provider for layout system
- **LayoutRenderer**: Component that handles layout nesting and rendering
- **LayoutTypes**: TypeScript definitions for layout props and configuration
- **LayoutRegistry**: System to register and manage available layouts

### 3. Directory Structure Convention (Next.js App Router Style)
```
frontend/src/
├── layout.tsx                # Root layout (required)
├── login/
│   ├── page.tsx             # Login page
│   └── layout.tsx           # Optional: Login-specific layout
├── dashboard/
│   ├── page.tsx             # Dashboard main page
│   ├── layout.tsx           # Dashboard layout (wraps all dashboard routes)
│   ├── settings/
│   │   ├── page.tsx         # Settings page (inherits dashboard layout)
│   │   └── profile/
│   │       └── page.tsx     # Profile settings (inherits dashboard layout)
│   └── analytics/
│       ├── page.tsx         # Analytics page
│       └── layout.tsx       # Optional: Analytics-specific layout
```

### 4. Integration Points
- **Hono React Renderer**: Modify existing Hono setup to use layout system
- **Routing**: Integrate with current routing mechanism
- **State Management**: Ensure layouts can access and provide global state
- **CSS/Styling**: Maintain current TailwindCSS + DaisyUI integration

## Files to Modify/Create

### New Files
- `frontend/src/lib/layout-system.ts` - Core layout system logic
- `frontend/src/types/layout.ts` - Layout type definitions
- `frontend/src/components/LayoutProvider.tsx` - Layout context provider
- `frontend/src/components/LayoutRenderer.tsx` - Layout rendering component
- `frontend/src/layout.tsx` - Root layout component
- `frontend/src/login/page.tsx` - Login page component
- `frontend/src/login/layout.tsx` - Optional login layout
- `frontend/src/dashboard/page.tsx` - Dashboard page component
- `frontend/src/dashboard/layout.tsx` - Dashboard layout component

### Modified Files
- `frontend/src/index.tsx` - Integrate layout system with Hono renderer and routing
- Move existing `frontend/src/pages/DashboardPage.tsx` → `frontend/src/dashboard/page.tsx`
- Move existing `frontend/src/pages/LoginPage.tsx` → `frontend/src/login/page.tsx`

## Technical Specifications

### Layout Component Interface
```typescript
interface LayoutProps {
  children: React.ReactNode
  params?: Record<string, string>
  searchParams?: Record<string, string>
  segment?: string
}

interface LayoutConfig {
  name: string
  path: string
  parent?: string
  metadata?: {
    title?: string
    description?: string
  }
}
```

### Layout Registration System
- Automatic layout discovery based on file structure
- Layout hierarchy resolution
- Dynamic layout loading
- Type-safe layout props

### Server-Side Rendering Compatibility
- Ensure layouts work with Hono's SSR capabilities
- Maintain hydration compatibility
- Preserve existing build process

## Testing Strategy

### Unit Tests
- Layout discovery system tests
- Layout hierarchy resolution tests
- Layout context provider tests
- TypeScript type validation

### Integration Tests
- Full page rendering with nested layouts
- Layout state sharing between components
- Route transitions with layout preservation
- SSR/hydration consistency

### Manual Testing
- Navigate between routes with different layouts
- Verify layout nesting behaves correctly
- Test layout-specific state persistence
- Validate responsive layout behavior

## Success Criteria

1. **Functional Parity**: Layout system behaves similarly to Next.js App Router
2. **Type Safety**: Full TypeScript support for layout props and configuration
3. **Performance**: No significant impact on SSR performance or bundle size
4. **Developer Experience**: Easy to create and manage layouts
5. **Backward Compatibility**: Existing pages work without modification initially
6. **Documentation**: Clear examples and migration guide

## Implementation Phases

### Phase 1: Core Infrastructure
- Layout type definitions
- Layout discovery system
- Basic layout rendering

### Phase 2: Advanced Features
- Nested layout support
- Layout context and state sharing
- Route group support

### Phase 3: Integration & Testing
- Hono integration
- Existing page migration
- Comprehensive testing

### Phase 4: Documentation & Examples
- Usage documentation
- Migration guide
- Example layouts