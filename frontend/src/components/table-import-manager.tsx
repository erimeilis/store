/**
 * Table Import Manager Component
 * Handles file upload, parsing, preview, column mapping, and data import
 */

import React, {useRef, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardBody, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Alert} from '@/components/ui/alert'
import {Select} from '@/components/ui/select'
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow} from '@/components/ui/table'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio'
import {IconCheck, IconEye, IconRefresh, IconTrash, IconUpload, IconX} from '@tabler/icons-react'
import {clientApiRequest} from '@/lib/client-api'

interface TableImportManagerProps {
    tableId: string
}

interface TableInfo {
    for_sale: boolean
}

interface ParsedData {
    headers: string[]
    rows: any[][]
    hasHeaders: boolean
    fileType: string
    fileName: string
    skipRows?: number
    detectedColumnMappings?: Array<{ sourceColumn: string, targetColumn: string }>
}

interface ColumnMapping {
    sourceColumn: string
    targetColumn: string | null
}

interface TableColumn {
    id: number
    name: string
    type: string
    is_required: boolean
}

export function TableImportManager({tableId}: TableImportManagerProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [parsedData, setParsedData] = useState<ParsedData | null>(null)
    const [tableColumns, setTableColumns] = useState<TableColumn[]>([])
    const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [importMode, setImportMode] = useState<'add' | 'replace'>('add')
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [skipRows, setSkipRows] = useState<number>(0)
    const [currentFile, setCurrentFile] = useState<globalThis.File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load table columns and info when component mounts
    React.useEffect(() => {
        loadTableColumns()
        loadTableInfo()
    }, [tableId])

    const loadTableColumns = async () => {
        try {
            console.log('🔍 Loading table columns for tableId:', tableId)
            const response = await clientApiRequest(`/api/tables/${tableId}/columns`)
            console.log('🔍 Columns API response status:', response.status)

            if (response.ok) {
                const data = await response.json() as { data?: TableColumn[] }
                console.log('🔍 Columns API response data:', data)
                console.log('🔍 Setting tableColumns to:', data.data || [])
                setTableColumns(data.data || [])
            } else {
                console.error('❌ Columns API failed with status:', response.status)
                const errorText = await response.text()
                console.error('❌ Error response:', errorText)
            }
        } catch (error) {
            console.error('❌ Failed to load table columns:', error)
        }
    }

    const loadTableInfo = async () => {
        try {
            const response = await clientApiRequest(`/api/tables/${tableId}`)
            if (response.ok) {
                const data = await response.json() as { data?: { table: { for_sale: boolean } } }
                if (data.data?.table) {
                    setTableInfo({ for_sale: data.data.table.for_sale })
                }
            }
        } catch (error) {
            console.error('❌ Failed to load table info:', error)
        }
    }

    const parseFile = async (file: globalThis.File, skipRowsCount: number = 0) => {
        setIsUploading(true)
        setError('')
        setSuccess('')

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('skipRows', skipRowsCount.toString())

            const response = await clientApiRequest(`/api/tables/${tableId}/parse-import-file`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to parse file')
            }

            const result = await response.json() as { data: ParsedData }
            setParsedData(result.data)
            setSkipRows(result.data.skipRows || 0)

            // Use detected mappings if available, otherwise fall back to manual matching
            let mappings: ColumnMapping[]

            if (result.data.detectedColumnMappings && result.data.detectedColumnMappings.length > 0) {
                // Use intelligent mappings from backend, ensuring no duplicates
                mappings = generateOptimalMappings(result.data.headers, result.data.detectedColumnMappings)
            } else {
                // Fall back to manual matching (for single column auto-mapping), ensuring no duplicates
                mappings = generateOptimalMappings(result.data.headers)
            }

            setColumnMappings(mappings)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setCurrentFile(file)
        await parseFile(file, skipRows)
    }

    const handleSkipRowsChange = async (newSkipRows: number) => {
        if (!currentFile) return

        setSkipRows(newSkipRows)
        await parseFile(currentFile, newSkipRows)
    }


    const _findBestColumnMatch = (sourceColumn: string): string | null => {
        // Auto-select mapping when single column in file and table
        if (tableColumns.length === 1) {
            return tableColumns[0].name
        }

        const normalizedSource = sourceColumn.toLowerCase().trim()

        // Try exact match first
        const exactMatch = tableColumns.find(col =>
            col.name.toLowerCase() === normalizedSource
        )
        if (exactMatch) return exactMatch.name

        // Try partial match
        const partialMatch = tableColumns.find(col =>
            col.name.toLowerCase().includes(normalizedSource) ||
            normalizedSource.includes(col.name.toLowerCase())
        )
        if (partialMatch) return partialMatch.name

        return null
    }

    const generateOptimalMappings = (headers: string[], detectedMappings?: Array<{ sourceColumn: string, targetColumn: string }>): ColumnMapping[] => {
        const mappings: ColumnMapping[] = []
        const usedTargetColumns = new Set<string>()

        // Create a scoring system for all possible header-column combinations
        const scoredMappings: Array<{
            sourceColumn: string
            targetColumn: string
            score: number
        }> = []

        // If we have detected mappings from backend, score them highly
        if (detectedMappings && detectedMappings.length > 0) {
            for (const detected of detectedMappings) {
                scoredMappings.push({
                    sourceColumn: detected.sourceColumn,
                    targetColumn: detected.targetColumn,
                    score: 100 // Highest score for backend-detected mappings
                })
            }
        } else {
            // Fall back to manual scoring for each header-column combination
            for (const header of headers) {
                const normalizedHeader = header.toLowerCase().trim()

                for (const column of tableColumns) {
                    const normalizedColumn = column.name.toLowerCase().trim()
                    let score = 0

                    // Strategy 1: Exact lowercase match (highest score)
                    if (normalizedHeader === normalizedColumn) {
                        score = 90
                    }
                    // Strategy 2: Lowercase without spaces
                    else if (normalizedHeader.replace(/\s+/g, '') === normalizedColumn.replace(/\s+/g, '')) {
                        score = 80
                    }
                    // Strategy 3: Lowercase with only letters
                    else if (normalizedHeader.replace(/[^a-z]/g, '') === normalizedColumn.replace(/[^a-z]/g, '') &&
                        normalizedHeader.replace(/[^a-z]/g, '').length > 0) {
                        score = 70
                    }
                    // Strategy 4: Partial match (contains)
                    else if (normalizedHeader.includes(normalizedColumn) || normalizedColumn.includes(normalizedHeader)) {
                        score = 50
                    }

                    if (score > 0) {
                        scoredMappings.push({
                            sourceColumn: header,
                            targetColumn: column.name,
                            score
                        })
                    }
                }
            }
        }

        // Sort by score descending to get best matches first
        scoredMappings.sort((a, b) => b.score - a.score)

        // Assign mappings ensuring no duplicates (greedy algorithm)
        for (const scored of scoredMappings) {
            const existingMapping = mappings.find(m => m.sourceColumn === scored.sourceColumn)
            if (existingMapping) continue // Source already mapped

            if (!usedTargetColumns.has(scored.targetColumn)) {
                mappings.push({
                    sourceColumn: scored.sourceColumn,
                    targetColumn: scored.targetColumn
                })
                usedTargetColumns.add(scored.targetColumn)
            }
        }

        // For any remaining headers without mappings, add them as unmapped
        for (const header of headers) {
            const existingMapping = mappings.find(m => m.sourceColumn === header)
            if (!existingMapping) {
                mappings.push({
                    sourceColumn: header,
                    targetColumn: null
                })
            }
        }

        return mappings
    }

    const handleMappingChange = (sourceColumn: string, targetColumn: string | null) => {
        setColumnMappings(prev => {
            // If setting to null (skip), just update
            if (targetColumn === null) {
                return prev.map(mapping =>
                    mapping.sourceColumn === sourceColumn
                        ? {...mapping, targetColumn}
                        : mapping
                )
            }

            // Check if target column is already mapped to another source
            const existingMapping = prev.find(m => m.targetColumn === targetColumn && m.sourceColumn !== sourceColumn)

            if (existingMapping) {
                // Clear the existing mapping and set the new one
                return prev.map(mapping => {
                    if (mapping.sourceColumn === existingMapping.sourceColumn) {
                        return {...mapping, targetColumn: null}
                    }
                    if (mapping.sourceColumn === sourceColumn) {
                        return {...mapping, targetColumn}
                    }
                    return mapping
                })
            } else {
                // No conflict, just update
                return prev.map(mapping =>
                    mapping.sourceColumn === sourceColumn
                        ? {...mapping, targetColumn}
                        : mapping
                )
            }
        })
    }

    const handleImport = async () => {
        if (!parsedData) return

        // Validate mappings
        const validMappings = columnMappings.filter(m => m.targetColumn !== null)
        if (validMappings.length === 0) {
            setError('Please map at least one column before importing')
            return
        }

        setIsImporting(true)
        setError('')
        setSuccess('')

        try {
            const response = await clientApiRequest(`/api/tables/${tableId}/import-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: parsedData.rows,
                    headers: parsedData.headers,  // Send headers separately
                    columnMappings: validMappings,
                    importMode,
                    hasHeaders: parsedData.hasHeaders
                })
            })

            if (!response.ok) {
                const errorData = await response.json() as { message?: string }
                throw new Error(errorData.message || 'Failed to import data')
            }

            const result = await response.json() as { importedRows: number }
            setSuccess(`Successfully imported ${result.importedRows} rows`)

            // Clear the form
            setParsedData(null)
            setColumnMappings([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import data')
        } finally {
            setIsImporting(false)
        }
    }

    const handleClear = () => {
        setParsedData(null)
        setColumnMappings([])
        setError('')
        setSuccess('')
        setSkipRows(0)
        setCurrentFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const previewRows = parsedData ? parsedData.rows.slice(0, 5) : []

    return (
        <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Select File to Import
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.csv,.xls,.xlsx"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="file-input file-input-bordered w-full"
                    />
                    <div className="text-xs text-base-content/60 mt-1">
                        Supported formats: TXT (tab-delimited), CSV, XLS, XLSX
                    </div>
                </div>

                {isUploading && (
                    <Alert>
                        <IconUpload className="h-4 w-4 animate-spin"/>
                        <span>Parsing file...</span>
                    </Alert>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <Alert className="alert-error">
                    <IconX className="h-4 w-4"/>
                    <span>{error}</span>
                </Alert>
            )}

            {/* Success Display */}
            {success && (
                <Alert className="alert-success">
                    <IconCheck className="h-4 w-4"/>
                    <span>{success}</span>
                </Alert>
            )}

            {/* File Preview and Mapping */}
            {parsedData && (
                <div className="space-y-6">
                    {/* File Info */}
                    <Card>
                        <CardBody>
                            <CardTitle className="flex items-center gap-2">
                                <IconEye className="h-5 w-5"/>
                                File Preview: {parsedData.fileName}
                            </CardTitle>
                            <div className="text-sm text-base-content/70">
                                Format: {parsedData.fileType.toUpperCase()} |
                                Rows: {parsedData.rows.length} |
                                Columns: {parsedData.headers.length} |
                                Headers: {parsedData.hasHeaders ? 'Yes' : 'No'}
                            </div>
                        </CardBody>
                    </Card>

                    {/* File Options */}
                    <Card
                        color="warning"
                        style="soft"
                    >
                        <CardBody>
                            <CardTitle>File Options</CardTitle>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Skip first rows
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={skipRows}
                                            onChange={(e) => {
                                                const newSkipRows = Math.max(0, parseInt(e.target.value) || 0)
                                                handleSkipRowsChange(newSkipRows)
                                            }}
                                            min="0"
                                            max="100"
                                            className="w-20"
                                            size="sm"
                                        />
                                        <span className="text-sm">
                                            {skipRows === 0 ? 'No rows skipped' : `Skipping ${skipRows} row${skipRows > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                    <div className="text-xs mt-1">
                                        Use this to skip title rows, empty rows, or other metadata before the actual data
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Data Preview */}
                    <Card
                        color="info"
                        style="soft"
                    >
                        <CardBody>
                            <CardTitle>Data Preview (First 5 rows)</CardTitle>
                            <div className="overflow-x-auto">
                                <Table
                                    modifier="zebra"
                                >
                                    <TableHead>
                                        <TableRow>
                                            {parsedData.headers.map((header, index) => (
                                                <TableHeaderCell key={index}>
                                                    {header || `Column ${index + 1}`}
                                                </TableHeaderCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewRows.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {row.map((cell: any, cellIndex: number) => (
                                                    <TableCell key={cellIndex}>
                                                        {cell !== null && cell !== undefined ? String(cell) : '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Column Mapping */}
                    <Card>
                        <CardBody>
                            <CardTitle>Column Mapping</CardTitle>
                            <div className="text-sm text-base-content/70 mb-4">
                                Map the columns from your file to the table columns.
                                Unmapped columns will be ignored during import.
                            </div>

                            <div className="space-y-3">
                                {/* Debug info */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="text-xs text-base-content/50 p-2 bg-base-300 rounded">
                                        Debug: tableColumns.length = {tableColumns.length},
                                        columnMappings.length = {columnMappings.length}
                                    </div>
                                )}

                                {columnMappings.map((mapping, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium">
                                                {mapping.sourceColumn}
                                            </label>
                                        </div>
                                        <div className="flex-none">→</div>
                                        <div className="flex-1">
                                            <Select
                                                size="sm"
                                                color={mapping.targetColumn ? 'success' : 'default'}
                                                value={mapping.targetColumn || ''}
                                                onChange={(e) => handleMappingChange(
                                                    mapping.sourceColumn,
                                                    e.target.value || null
                                                )}
                                                options={[
                                                    {value: '', label: 'Skip this column'},
                                                    ...tableColumns.map(col => ({
                                                        value: col.name,
                                                        label: `${col.name} (${col.type})${col.is_required ? ' *' : ''}`
                                                    }))
                                                ]}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Import Options */}
                    <Card
                        color="primary"
                        style="soft"
                    >
                        <CardBody>
                            <CardTitle>Import Options</CardTitle>

                            <div className="space-y-4">
                                {/* For Sale Table Notice */}
                                {tableInfo?.for_sale && (
                                    <Alert className="alert-info">
                                        <IconCheck className="h-4 w-4"/>
                                        <span>
                                            <strong>E-commerce table:</strong> Unmapped price columns will default to 0, unmapped qty columns will default to 1.
                                        </span>
                                    </Alert>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Import Mode
                                    </label>
                                    <RadioGroup
                                        name="importMode"
                                        value={importMode}
                                        onValueChange={(value) => setImportMode(value as 'add' | 'replace')}
                                        orientation="horizontal"
                                    >
                                        <RadioGroupItem
                                            value="add"
                                            label="Add to existing data"
                                            color="primary"
                                            size="sm"
                                        />
                                        <RadioGroupItem
                                            value="replace"
                                            label="Replace all existing data"
                                            color="primary"
                                            size="sm"
                                        />
                                    </RadioGroup>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        color="primary"
                                        onClick={handleImport}
                                        disabled={isImporting}
                                        icon={isImporting ? IconRefresh : IconCheck}
                                        className={isImporting ? 'animate-pulse' : ''}
                                    >
                                        {isImporting ? 'Importing...' : 'Import Data'}
                                    </Button>

                                    <Button
                                        color="default"
                                        style="ghost"
                                        onClick={handleClear}
                                        icon={IconTrash}
                                        disabled={isImporting}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    )
}
