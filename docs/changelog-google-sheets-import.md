# Changelog: Google Sheets Import Feature

## [2025-10-17 14:17] - Fixed 401 Unauthorized Error with Multi-Strategy Approach

### Issue
When testing the Google Sheets import feature, encountered 401 Unauthorized error when trying to fetch sheet data via the CSV export endpoint.

### Root Cause Analysis
Research revealed that the Google Sheets CSV export endpoint (`/export?format=csv`) has strict access requirements:
- Requires sheets to be explicitly "Published to the web" (File → Share → Publish to web)
- Simply setting "Anyone with the link can view" is NOT sufficient for the export endpoint
- Google has different permission models for different API endpoints

### Solution Implemented
Created a multi-strategy fallback system in `parseGoogleSheets.ts` that tries multiple Google Sheets access methods:

1. **Strategy 1**: Standard CSV export endpoint
   - `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv`
   - Works for sheets that are "Published to the web"

2. **Strategy 2**: Google Visualization API (gviz) endpoint
   - `https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv`
   - More lenient, often works with "Anyone with the link" sharing

3. **Strategy 3**: Published CSV endpoint
   - `https://docs.google.com/spreadsheets/d/e/{ID}/pub?output=csv`
   - For explicitly published sheets

### Error Handling Improvements
- System now tries all three strategies before failing
- Provides helpful error message with clear instructions:
  - How to make sheet publicly accessible
  - Steps to enable proper sharing
  - All attempted strategies with specific error details

### Files Modified
- `/Volumes/Annette/IdeaProjects/Store/src/services/fileParserService/parseGoogleSheets.ts`
  - Rewrote `fetchGoogleSheetsData()` function (lines 57-130)
  - Added multi-strategy fallback logic
  - Improved error messages with actionable guidance

### Testing Status
- Backend code deployed and reloaded
- Ready for user testing with different sheet sharing configurations

### Next Steps
- Test with various Google Sheets sharing configurations
- Verify which strategy works best for different scenarios
- May need to add frontend guidance about proper sheet sharing

---

## [2025-10-17 14:10] - Fixed Button and RadioGroup Component Issues

### Issue
Button component usage was incorrect - icons were being wrapped as children instead of using the `icon` prop parameter.

### Changes Made
1. **Button Component Fix**:
   - Changed from wrapping icon in Button children to using `icon={IconUpload}` prop
   - Added `processing={isUploading}` state prop
   - Simplified button content to just text

2. **RadioGroup Structure Fix**:
   - Made RadioGroupItem direct children of RadioGroup
   - Used `label` prop instead of wrapping in divs
   - Fixed component structure to work with RadioGroup's child cloning mechanism

3. **Codebase Audit**:
   - Analyzed 26 files using Button component
   - Confirmed all other usages were already correct
   - Only table-import-manager.tsx needed fixing

### Files Modified
- `/Volumes/Annette/IdeaProjects/Store/frontend/src/components/table-import-manager.tsx`
  - Lines 422-436: Fixed RadioGroup structure
  - Lines 483-491: Fixed Button component with icon prop

### User Feedback
- User explicitly requested checking entire frontend for Button misuse
- Comprehensive audit confirmed only one file needed fixing

---

## [2025-10-17 13:45] - Initial Google Sheets Import Implementation

### Overview
Added Google Sheets URL import functionality to the existing table data import system.

### Backend Implementation

1. **Created Google Sheets Parser Service**:
   - `/src/services/fileParserService/parseGoogleSheets.ts`
   - URL pattern extraction for various Google Sheets URL formats
   - CSV export endpoint integration
   - Custom CSV parser for handling quoted fields

2. **Added API Route**:
   - `POST /api/tables/:id/parse-google-sheets`
   - Accepts Google Sheets URL
   - Returns parsed data in standard format

3. **Type Definitions**:
   - Added `google_sheets` to FileType enum
   - Extended ParseOptions for Google Sheets-specific options

### Frontend Implementation

1. **Table Import Manager Component**:
   - Added import source selector (File Upload vs Google Sheets URL)
   - Google Sheets URL input field
   - Load Sheet button with loading state
   - Error handling and toast notifications

2. **UI Components**:
   - RadioGroup for source selection
   - TextInput for URL entry
   - Conditional rendering based on source

### Integration
- Google Sheets parser follows same interface as file parser
- Compatible with existing column mapping workflow
- Returns data in ParsedData format

### Files Created
- `/src/services/fileParserService/parseGoogleSheets.ts`
- `/src/services/fileParserService/index.ts` (updated exports)

### Files Modified
- `/src/types/file-parser.ts`
- `/src/routes/tables.ts`
- `/frontend/src/components/table-import-manager.tsx`

### Testing
- Manual testing of URL extraction
- CSV parsing validation
- Frontend UI interaction testing

### Known Limitations
- Requires public sheet access (Anyone with the link)
- Only fetches first sheet by default
- No support for specific sheet tabs yet
