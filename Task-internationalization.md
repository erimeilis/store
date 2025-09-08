# Task: Internationalization (i18n) System

## Objective
Implement a comprehensive internationalization system to support multiple languages in the Store CRUD application.

## Approach
Create a React-based i18n system with server-side rendering support, language detection, and persistent user language preferences stored in KV.

## Files to Modify/Create

### Frontend i18n Infrastructure
- `frontend/src/lib/i18n.ts` - Core i18n configuration and utilities
- `frontend/src/hooks/useTranslation.ts` - React hook for translations
- `frontend/src/contexts/LocaleContext.tsx` - React context for locale management
- `frontend/src/types/i18n.ts` - TypeScript interfaces for i18n

### Translation Files
- `frontend/src/locales/en.json` - English translations (default)
- `frontend/src/locales/es.json` - Spanish translations  
- `frontend/src/locales/fr.json` - French translations
- `frontend/src/locales/de.json` - German translations
- `frontend/src/locales/index.ts` - Locale exports and management

### Component Updates
- `frontend/src/app/dashboard/layout.tsx` - Add language switcher to user dropdown
- `frontend/src/app/dashboard/page.tsx` - Localize dashboard content
- `frontend/src/components/model/model-list.tsx` - Localize table headers and actions
- All form components - Localize labels and validation messages

### Backend Integration
- Update user settings KV storage to include language preference
- Add language detection middleware for SSR
- Modify server rendering to pass locale context

## Translation Structure
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel", 
    "delete": "Delete",
    "edit": "Edit"
  },
  "dashboard": {
    "title": "Dashboard",
    "items": "Store Items",
    "users": "Users"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "users": "Users", 
    "security": "Security"
  }
}
```

## Features to Implement
1. **Language Detection**: Browser preference → User settings → Default (English)
2. **Dynamic Loading**: Load translation files on demand
3. **Pluralization**: Support for singular/plural forms
4. **Number/Date Formatting**: Locale-specific formatting
5. **RTL Support**: Layout adjustments for right-to-left languages
6. **SSR Compatibility**: Server-side translation rendering

## Language Switcher UI
Add to user dropdown menu:
- Current language flag/name
- Dropdown with available languages
- Persistent selection in user settings

## Implementation Steps
1. Set up i18n infrastructure and React context
2. Create initial translation files for key languages
3. Implement useTranslation hook and utilities
4. Add language switcher to user dropdown
5. Localize dashboard and core components
6. Integrate with user settings KV storage
7. Add SSR support for initial page loads
8. Test all languages and edge cases

## Supported Languages (Initial)
- 🇺🇸 English (en) - Default
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)  
- 🇩🇪 German (de)

## Future Extensions
- More languages based on user demand
- Translation management system
- Automatic translation suggestions
- Context-aware translations
- Professional translation integration