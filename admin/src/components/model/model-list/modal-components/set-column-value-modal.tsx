/**
 * Set Column Value Modal
 * A specialized mass action modal that allows selecting a column and entering a value
 * with type-appropriate validation and input controls.
 *
 * Supports:
 * - Built-in types: text, email, phone, url, date, boolean, number, country
 * - Module column types (e.g., phoneNumbers:phone, docs:category) with dynamic options
 */

import { MassActionConfirmation } from '@/components/shared/mass-action-confirmation'
import { InputFieldType } from '@/types/models'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { getCountryOptions } from '@/components/ui/country-select'
import { IconX, IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

export interface ColumnInfo {
    name: string
    label: string
    type: string
    isRequired?: boolean
}

export interface SetColumnValueModalProps {
    isOpen: boolean
    isLoading: boolean
    selectedCount: number
    columns: ColumnInfo[]
    error?: string
    onClose: () => void
    onConfirm: (columnName: string, value: string | number | boolean) => Promise<void>
    /**
     * Module type options for columns that have them.
     * Key is column name, value contains options array and multiValue flag.
     * These are loaded dynamically from the module manifest.
     */
    moduleTypeOptions?: Record<string, {
        options: Array<{ value: string; label: string; raw?: Record<string, unknown> }>
        multiValue: boolean
    }>
}

/**
 * Check if a column type is from a module (contains colon separator)
 */
function isModuleColumnType(type: string): boolean {
    return type.includes(':')
}

/**
 * Parse comma-separated values into array
 */
function parseMultiValue(value: string): string[] {
    if (!value) return []
    return value.split(',').map(v => v.trim()).filter(Boolean)
}

/**
 * Join array values into comma-separated string
 */
function joinMultiValue(values: string[]): string {
    return values.join(',')
}

/**
 * Get business indicator from option's raw.business field
 * - true: business only
 * - false: personal only
 * - null/undefined: both variants needed
 */
function getBusinessIndicator(opt: { raw?: Record<string, unknown> }): 'business' | 'personal' | 'both' {
    const business = opt.raw?.business
    if (business === true) return 'business'
    if (business === false) return 'personal'
    return 'both' // null or undefined means both variants
}

/**
 * Process options to add business/personal indicators
 */
function processOptionsWithIndicators(
    options: Array<{ value: string; label: string; raw?: Record<string, unknown> }>
): Array<{ value: string; label: string; indicator?: 'business' | 'personal' | null }> {
    const result: Array<{ value: string; label: string; indicator?: 'business' | 'personal' | null }> = []

    options.forEach(opt => {
        const indicator = getBusinessIndicator(opt)

        if (indicator === 'business') {
            result.push({
                value: opt.value.endsWith(':business') ? opt.value : `${opt.value}:business`,
                label: opt.label.startsWith('[B] ') ? opt.label : `[B] ${opt.label}`,
                indicator: 'business'
            })
        } else if (indicator === 'personal') {
            result.push({
                value: opt.value.endsWith(':personal') ? opt.value : `${opt.value}:personal`,
                label: opt.label.startsWith('[P] ') ? opt.label : `[P] ${opt.label}`,
                indicator: 'personal'
            })
        } else {
            // Both variants needed (raw.business === null)
            if (opt.value.endsWith(':business') || opt.value.endsWith(':personal')) {
                result.push({ ...opt, indicator: null })
            } else {
                result.push({
                    value: `${opt.value}:personal`,
                    label: `[P] ${opt.label.replace(/^\[(B|P)\]\s*/, '')}`,
                    indicator: 'personal'
                })
                result.push({
                    value: `${opt.value}:business`,
                    label: `[B] ${opt.label.replace(/^\[(B|P)\]\s*/, '')}`,
                    indicator: 'business'
                })
            }
        }
    })

    return result
}

/**
 * Extract base type from module column type (e.g., "phoneNumbers:phone" → "phone")
 */
function getBaseType(type: string): string {
    if (type.includes(':')) {
        return type.split(':').pop() || 'text'
    }
    return type
}

/**
 * Map column type to InputFieldType for input rendering
 */
function mapColumnTypeToInputType(columnType: string): InputFieldType {
    const baseType = getBaseType(columnType)

    switch (baseType) {
        case 'email': return 'email'
        case 'phone': return 'phone'
        case 'url': return 'url'
        case 'date': return 'date'
        case 'boolean': return 'boolean'
        case 'number': return 'float'
        case 'integer': return 'integer'
        case 'float': return 'float'
        case 'currency': return 'currency'
        case 'percentage': return 'percentage'
        case 'country': return 'country'
        case 'text': return 'text'
        case 'textarea': return 'textarea'
        case 'rating': return 'rating'
        case 'color': return 'color'
        case 'time': return 'time'
        case 'datetime': return 'datetime'
        default:
            // For module types without recognized base type, default to text
            // The actual options will be shown if available
            return 'text'
    }
}

/**
 * Get HTML input type for a given InputFieldType
 */
function getHtmlInputType(type: InputFieldType): string {
    switch (type) {
        case 'email': return 'email'
        case 'url': return 'url'
        case 'phone': return 'tel'
        case 'integer':
        case 'float':
        case 'currency':
        case 'percentage':
        case 'number':
        case 'rating':
            return 'number'
        case 'date': return 'date'
        case 'time': return 'time'
        case 'datetime': return 'datetime-local'
        case 'color': return 'color'
        case 'textarea':
        case 'text':
        case 'country':
        default:
            return 'text'
    }
}

/**
 * Get step value for numeric types
 */
function getStepValue(type: InputFieldType): string | undefined {
    switch (type) {
        case 'integer':
        case 'rating':
            return '1'
        case 'currency':
            return '0.01'
        case 'percentage':
        case 'float':
        case 'number':
            return 'any'
        default:
            return undefined
    }
}

/**
 * Parse and validate input value based on type
 */
function parseInputValue(type: InputFieldType, value: string): string | number | boolean | null {
    switch (type) {
        case 'integer':
        case 'rating': {
            const parsed = parseInt(value, 10)
            return isNaN(parsed) ? null : parsed
        }
        case 'float':
        case 'currency':
        case 'percentage':
        case 'number': {
            const parsed = parseFloat(value)
            return isNaN(parsed) ? null : parsed
        }
        case 'boolean':
            return value === 'true'
        case 'country':
            return value.toUpperCase()
        default:
            return value
    }
}

export function SetColumnValueModal({
    isOpen,
    isLoading,
    selectedCount,
    columns,
    error,
    onClose,
    onConfirm,
    moduleTypeOptions
}: SetColumnValueModalProps) {
    const [selectedColumn, setSelectedColumn] = useState<string>('')
    const [inputValue, setInputValue] = useState<string>('')

    // Multiselect state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
    const multiselectContainerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Calculate dropdown position
    const updateDropdownPosition = useCallback(() => {
        if (multiselectContainerRef.current) {
            const rect = multiselectContainerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 250)
            })
        }
    }, [])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedColumn('')
            setInputValue('')
            setIsDropdownOpen(false)
            setSearchQuery('')
        }
    }, [isOpen])

    // Reset input value when column changes
    useEffect(() => {
        setInputValue('')
        setIsDropdownOpen(false)
        setSearchQuery('')
    }, [selectedColumn])

    // Update dropdown position when opening
    useEffect(() => {
        if (isDropdownOpen) {
            updateDropdownPosition()
            const handleUpdate = () => updateDropdownPosition()
            window.addEventListener('scroll', handleUpdate, true)
            window.addEventListener('resize', handleUpdate)
            return () => {
                window.removeEventListener('scroll', handleUpdate, true)
                window.removeEventListener('resize', handleUpdate)
            }
        }
    }, [isDropdownOpen, updateDropdownPosition])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const dropdownPortal = document.getElementById('mass-action-multiselect-portal')
            if (multiselectContainerRef.current && !multiselectContainerRef.current.contains(target) &&
                (!dropdownPortal || !dropdownPortal.contains(target))) {
                setIsDropdownOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Get the selected column info
    const selectedColumnInfo = useMemo(() => {
        return columns.find(col => col.name === selectedColumn)
    }, [columns, selectedColumn])

    // Get the input type for the selected column
    const inputType = useMemo(() => {
        if (!selectedColumnInfo) return 'text'
        return mapColumnTypeToInputType(selectedColumnInfo.type)
    }, [selectedColumnInfo])

    // Check if column has module options
    const columnOptions = useMemo(() => {
        if (!selectedColumn || !moduleTypeOptions) return null
        const opts = moduleTypeOptions[selectedColumn]
        if (opts?.options?.length) return opts
        return null
    }, [selectedColumn, moduleTypeOptions])

    // Check if this is a module column type
    const isModuleType = useMemo(() => {
        if (!selectedColumnInfo) return false
        return isModuleColumnType(selectedColumnInfo.type)
    }, [selectedColumnInfo])

    // Process options with business/personal indicators for multiselect
    const processedOptions = useMemo(() => {
        if (!columnOptions?.options) return []
        return processOptionsWithIndicators(columnOptions.options)
    }, [columnOptions])

    // Parse current value into array for multiselect
    const selectedValues = useMemo(() => parseMultiValue(inputValue), [inputValue])

    // Filter options based on search and selection for multiselect
    const availableOptions = useMemo(() => {
        return processedOptions.filter(opt =>
            !selectedValues.includes(opt.value) &&
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [processedOptions, selectedValues, searchQuery])

    // Get selected options for display in multiselect
    const selectedOptionsDisplay = useMemo(() => {
        return selectedValues.map(value => {
            const opt = processedOptions.find(o => o.value === value)
            return opt || { value, label: value, indicator: null }
        })
    }, [selectedValues, processedOptions])

    // Multiselect handlers
    const handleMultiselectAdd = (optionValue: string) => {
        const newValues = [...selectedValues, optionValue]
        setInputValue(joinMultiValue(newValues))
        setSearchQuery('')
        searchInputRef.current?.focus()
    }

    const handleMultiselectRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newValues = selectedValues.filter(v => v !== optionValue)
        setInputValue(joinMultiValue(newValues))
    }

    const handleMultiselectKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && searchQuery === '' && selectedValues.length > 0) {
            const newValues = selectedValues.slice(0, -1)
            setInputValue(joinMultiValue(newValues))
        }
        if (e.key === 'Escape') {
            setIsDropdownOpen(false)
            setSearchQuery('')
        }
        if (e.key === 'Enter' && availableOptions.length > 0) {
            e.preventDefault()
            handleMultiselectAdd(availableOptions[0].value)
        }
    }

    const getChipColor = (indicator?: 'business' | 'personal' | null) => {
        if (indicator === 'business') return 'badge-primary'
        if (indicator === 'personal') return 'badge-ghost'
        return 'badge-neutral'
    }

    const getCleanLabel = (label: string) => {
        return label.replace(/^\[(B|P)\]\s*/, '')
    }

    const handleConfirm = async () => {
        if (!selectedColumn) return

        const parsedValue = parseInputValue(inputType, inputValue)

        if (parsedValue === null && inputType !== 'boolean') {
            return // Don't confirm if value is invalid
        }

        await onConfirm(selectedColumn, parsedValue ?? inputValue)
    }

    // Render the column selector
    const renderColumnSelector = () => (
        <div className="mb-4">
            <label className="label">
                <span className="label-text font-medium">Select Column</span>
            </label>
            <select
                className="select select-bordered w-full"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                disabled={isLoading}
            >
                <option value="">Choose a column...</option>
                {columns.map((col) => (
                    <option key={col.name} value={col.name}>
                        {col.label}
                    </option>
                ))}
            </select>
        </div>
    )

    // Render the value input based on column type
    const renderValueInput = () => {
        if (!selectedColumn || !selectedColumnInfo) {
            return (
                <div className="text-base-content/50 text-sm italic">
                    Select a column first to enter a value
                </div>
            )
        }

        const htmlType = getHtmlInputType(inputType)
        const step = getStepValue(inputType)

        // Handle module types with options
        if (columnOptions) {
            const { options, multiValue } = columnOptions

            // For multiValue columns, render a chip-based multiselect
            if (multiValue) {
                return (
                    <div className="mb-4">
                        <label className="label">
                            <span className="label-text font-medium">
                                New Value for {selectedColumnInfo.label}
                            </span>
                        </label>
                        <div
                            ref={multiselectContainerRef}
                            className={cn(
                                'min-h-[42px] rounded-lg border bg-base-100 px-3 py-2 cursor-pointer flex flex-wrap gap-1.5 items-center',
                                'border-base-300 focus-within:border-primary',
                                isLoading && 'opacity-50 pointer-events-none'
                            )}
                            onClick={() => {
                                setIsDropdownOpen(true)
                                searchInputRef.current?.focus()
                            }}
                        >
                            {/* Selected chips */}
                            {selectedOptionsDisplay.map((option) => (
                                <span
                                    key={option.value}
                                    className={cn('badge badge-sm gap-0.5', getChipColor(option.indicator))}
                                >
                                    {option.indicator && (
                                        <span className="opacity-70 font-bold">
                                            {option.indicator === 'business' ? 'B' : 'P'}
                                        </span>
                                    )}
                                    {getCleanLabel(option.label)}
                                    <button
                                        type="button"
                                        onClick={(e) => handleMultiselectRemove(option.value, e)}
                                        className="hover:text-error ml-0.5"
                                    >
                                        <IconX size={12} />
                                    </button>
                                </span>
                            ))}

                            {/* Search input */}
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                                onKeyDown={handleMultiselectKeyDown}
                                placeholder={selectedValues.length === 0 ? 'Select values...' : ''}
                                className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
                                disabled={isLoading}
                            />

                            <IconChevronDown
                                size={16}
                                className={cn(
                                    'text-base-content/50 transition-transform',
                                    isDropdownOpen && 'rotate-180'
                                )}
                            />
                        </div>

                        {/* Dropdown Portal */}
                        {isDropdownOpen && dropdownPosition && typeof document !== 'undefined' && createPortal(
                            <div
                                id="mass-action-multiselect-portal"
                                className="fixed z-[9999] max-h-60 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
                                style={{
                                    top: dropdownPosition.top,
                                    left: dropdownPosition.left,
                                    width: dropdownPosition.width,
                                }}
                            >
                                {availableOptions.length === 0 ? (
                                    <div className="px-3 py-2 text-base-content/50 text-sm">
                                        {searchQuery ? 'No matches' : 'No more options'}
                                    </div>
                                ) : (
                                    availableOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            onClick={() => handleMultiselectAdd(option.value)}
                                            className="px-3 py-2 cursor-pointer hover:bg-base-200 flex items-center gap-2 text-sm"
                                        >
                                            {option.indicator && (
                                                <span className={cn(
                                                    'badge badge-xs',
                                                    option.indicator === 'business' ? 'badge-primary' : 'badge-ghost'
                                                )}>
                                                    {option.indicator === 'business' ? 'B' : 'P'}
                                                </span>
                                            )}
                                            <span>{getCleanLabel(option.label)}</span>
                                        </div>
                                    ))
                                )}
                            </div>,
                            document.body
                        )}

                        <label className="label">
                            <span className="label-text-alt">Select one or more values</span>
                        </label>
                    </div>
                )
            }

            // For single-value columns, render a standard select dropdown
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Select value...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            )
        }

        // Handle country type with country select
        if (inputType === 'country') {
            const countryOptions = getCountryOptions()
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Select country...</option>
                        {countryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            )
        }

        // Handle boolean type with toggle
        if (inputType === 'boolean') {
            return (
                <div className="mb-4">
                    <label className="label cursor-pointer">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={inputValue === 'true'}
                            onChange={(e) => setInputValue(e.target.checked ? 'true' : 'false')}
                            disabled={isLoading}
                        />
                    </label>
                </div>
            )
        }

        // Handle rating type with star selector
        if (inputType === 'rating') {
            const currentRating = parseInt(inputValue, 10) || 0
            const maxRating = 5
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                    </label>
                    <div className="rating rating-lg">
                        {Array.from({ length: maxRating }, (_, i) => (
                            <input
                                key={i + 1}
                                type="radio"
                                name="rating"
                                className="mask mask-star-2 bg-warning"
                                checked={currentRating === i + 1}
                                onChange={() => setInputValue(String(i + 1))}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                </div>
            )
        }

        // Handle textarea type
        if (inputType === 'textarea') {
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder={`Enter ${selectedColumnInfo.label.toLowerCase()}...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                    />
                </div>
            )
        }

        // Handle color type
        if (inputType === 'color') {
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">
                            New Value for {selectedColumnInfo.label}
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            className="w-12 h-12 cursor-pointer rounded"
                            value={inputValue || '#000000'}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="#000000"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            pattern="^#[0-9A-Fa-f]{6}$"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            )
        }

        // Default: standard input field
        return (
            <div className="mb-4">
                <label className="label">
                    <span className="label-text font-medium">
                        New Value for {selectedColumnInfo.label}
                    </span>
                </label>
                <input
                    type={htmlType}
                    className="input input-bordered w-full"
                    placeholder={`Enter ${selectedColumnInfo.label.toLowerCase()}...`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    step={step}
                    disabled={isLoading}
                />
                {inputType === 'phone' && (
                    <label className="label">
                        <span className="label-text-alt">Enter phone number with country code (e.g., +1 555-123-4567)</span>
                    </label>
                )}
                {inputType === 'email' && (
                    <label className="label">
                        <span className="label-text-alt">Enter a valid email address</span>
                    </label>
                )}
                {inputType === 'currency' && (
                    <label className="label">
                        <span className="label-text-alt">Enter amount (e.g., 19.99)</span>
                    </label>
                )}
                {inputType === 'percentage' && (
                    <label className="label">
                        <span className="label-text-alt">Enter value as percentage (e.g., 25 for 25%)</span>
                    </label>
                )}
                {isModuleType && !columnOptions && (
                    <label className="label">
                        <span className="label-text-alt text-warning">
                            Note: Module options not loaded. Enter value manually.
                        </span>
                    </label>
                )}
            </div>
        )
    }

    // Check if confirm should be disabled
    const isConfirmDisabled = !selectedColumn || (!inputValue && inputType !== 'boolean')

    const inputContent = (
        <div className="space-y-2">
            {renderColumnSelector()}
            {renderValueInput()}
        </div>
    )

    const message = selectedColumn && selectedColumnInfo
        ? `Set "${selectedColumnInfo.label}" to the specified value for ${selectedCount} selected row${selectedCount === 1 ? '' : 's'}.`
        : `Choose a column and value to update ${selectedCount} selected row${selectedCount === 1 ? '' : 's'}.`

    return (
        <MassActionConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Set Column Value"
            message={message}
            errorMessage={error}
            confirmButtonText="Update"
            isLoading={isLoading}
            actionType="warning"
            actionName="set_column_value"
            inputContent={inputContent}
            isConfirmDisabled={isConfirmDisabled}
        />
    )
}
