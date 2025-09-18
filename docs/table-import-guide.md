# Table Data Import Guide

## Overview

The Table Data Import feature allows users to import data from external files (CSV, TXT) into dynamic tables. This powerful feature includes file parsing, data preview, column mapping, and flexible import options.

## Supported File Formats

### CSV Files (.csv)
- **Delimiter**: Comma-separated values
- **Headers**: Automatically detected or manually specified
- **Encoding**: UTF-8 recommended
- **Size Limit**: 10MB maximum

### TXT Files (.txt)
- **Delimiters**: Auto-detected (comma, tab, semicolon, pipe)
- **Headers**: Automatically detected
- **Encoding**: UTF-8 recommended
- **Size Limit**: 10MB maximum

### Excel Files (.xls, .xlsx)
- **Status**: Not yet supported (planned for future release)
- **Workaround**: Export Excel files to CSV format

## How to Import Data

### Step 1: Navigate to Import Page
1. Go to your table's data page
2. Click on **"Import Data"** in the navigation bar
3. You'll see the import interface with file upload section

### Step 2: Upload File
1. Click **"Choose File"** or drag and drop your file
2. Select a CSV or TXT file (max 10MB)
3. The system will automatically parse and validate the file
4. Wait for the parsing to complete

### Step 3: Review File Preview
After successful parsing, you'll see:
- **File Information**: Name, format, row count, column count
- **Header Detection**: Whether headers were automatically detected
- **Data Preview**: First 5 rows of your data in a table format

### Step 4: Map Columns
The column mapping interface allows you to:
- **Auto-mapping**: System attempts to match columns by name
- **Manual mapping**: Use dropdowns to map each source column to target table columns
- **Skip columns**: Leave unmapped to ignore during import
- **Required fields**: Ensure required table columns are mapped

**Column Mapping Tips:**
- Required fields are marked with *
- Column types are shown (text, number, boolean, date)
- Exact name matches are prioritized in auto-mapping
- You can skip columns you don't need

### Step 5: Choose Import Mode
- **Add to existing data**: Appends new rows to current table data
- **Replace all existing data**: Clears the table and imports new data

### Step 6: Import Data
1. Click **"Import Data"** button
2. Wait for the import process to complete
3. Review the import results (imported rows, skipped rows, any errors)

## Data Type Conversion

The import system automatically converts data types:

### Text Fields
- Any string value
- HTML/special characters are preserved
- Empty values become null

### Number Fields
- Integers and decimals
- Scientific notation supported
- Invalid numbers cause row to be skipped

### Boolean Fields
Accepts these values:
- **True**: true, yes, 1, y, on
- **False**: false, no, 0, n, off
- Case-insensitive

### Date Fields
Supported formats:
- **ISO**: 2024-01-15
- **US**: 01/15/2024, 1/15/2024
- **European**: 15.01.2024
- **Alternative**: 01-15-2024
- Invalid dates cause row to be skipped

## File Format Guidelines

### CSV File Example
```csv
name,email,age,is_active,join_date
John Doe,john@example.com,30,true,2024-01-15
Jane Smith,jane@example.com,25,false,2024-01-20
Bob Johnson,bob@example.com,35,yes,2024-01-25
```

### TXT File Example (Tab-delimited)
```
name	email	age	is_active	join_date
John Doe	john@example.com	30	true	2024-01-15
Jane Smith	jane@example.com	25	false	2024-01-20
Bob Johnson	bob@example.com	35	yes	2024-01-25
```

## Best Practices

### File Preparation
1. **Use UTF-8 encoding** to avoid character issues
2. **Include headers** in the first row for easier mapping
3. **Clean your data** before import (remove empty rows, fix formatting)
4. **Test with small files** first before importing large datasets
5. **Backup existing data** if using replace mode

### Column Mapping
1. **Map required fields first** (marked with *)
2. **Check data types** match between source and target
3. **Preview mappings** before importing
4. **Skip unnecessary columns** to improve performance

### Import Strategy
1. **Use "Add" mode** for incremental updates
2. **Use "Replace" mode** for complete data refresh
3. **Import in batches** for very large datasets
4. **Verify data** after import completion

## Troubleshooting

### Common Issues

#### "File too large" Error
- **Cause**: File exceeds 10MB limit
- **Solution**: Split file into smaller chunks or compress data

#### "Invalid file type" Error
- **Cause**: Unsupported file format
- **Solution**: Convert to CSV or TXT format

#### "Column name and type are required" Error
- **Cause**: Required columns not mapped or contain empty values
- **Solution**: Ensure all required fields (*) are properly mapped

#### "Invalid number/date" Errors
- **Cause**: Data doesn't match expected format
- **Solution**: Clean source data or adjust column types in table definition

#### "No data rows found" Error
- **Cause**: File contains only headers or empty rows
- **Solution**: Add data rows to your file

### Performance Tips

1. **Optimize file size**: Remove unnecessary columns and rows
2. **Use proper data types**: Avoid storing numbers as text
3. **Batch imports**: Split very large files (>100,000 rows)
4. **Import during off-peak hours** for large datasets

## Technical Details

### File Processing
- Files are processed in browser (client-side parsing)
- Data is sent to server in JSON format
- Server validates and converts data types
- Database operations use transactions for data integrity

### Security
- File size and type validation
- SQL injection protection
- Admin-only access required
- Input sanitization and validation

### Error Handling
- Row-level error tracking
- Detailed error messages
- Transaction rollback on critical errors
- Partial import support (continues on non-critical errors)

## API Endpoints

### Parse File
```
POST /api/tables/{id}/parse-import-file
Content-Type: multipart/form-data
Body: file upload
```

### Import Data
```
POST /api/tables/{id}/import-data
Content-Type: application/json
Body: {
  data: array of row arrays,
  columnMappings: array of mapping objects,
  importMode: "add" | "replace",
  hasHeaders: boolean
}
```

## Future Enhancements

- **Excel file support** (.xls, .xlsx)
- **JSON and XML import**
- **Data transformation rules**
- **Scheduled imports**
- **Import templates**
- **Bulk import from multiple files**
- **Data validation rules**
- **Import history and rollback**

---

For technical support or feature requests, please contact the development team or file an issue in the project repository.