import { IModel } from '@/types/models';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { InlineEditComponentProps } from '@/components/model/model-list/types';
import { IconX, IconChevronDown, IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
function getBusinessIndicator(opt: { raw?: { business?: boolean | null } }): 'business' | 'personal' | 'both' {
    const business = opt.raw?.business
    if (business === true) return 'business'
    if (business === false) return 'personal'
    return 'both' // null or undefined means both variants
}

export function MultiselectEditComponent<T extends IModel>({
    column,
    editValue,
    editingError,
    isEditingSaving,
    editingSaveSuccess,
    onSetEditValue,
    onSaveEditing,
    onEditKeyPress,
    onInputBlur,
    onSetIsClickingSaveButton,
}: InlineEditComponentProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Calculate dropdown position when opening
    const updateDropdownPosition = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 200)
            })
        }
    }, [])

    // Parse current value into array
    const selectedValues = useMemo(() => parseMultiValue(editValue), [editValue])

    // Get options from column definition
    const options = column.editOptions || []

    // Process options to add business/personal indicators based on raw.business field
    const processedOptions = useMemo(() => {
        const result: Array<{ value: string; label: string; group?: string; indicator?: 'business' | 'personal' | null }> = []

        options.forEach(opt => {
            const indicator = getBusinessIndicator(opt)

            if (indicator === 'business') {
                // Business only - single entry
                result.push({
                    ...opt,
                    value: opt.value.endsWith(':business') ? opt.value : `${opt.value}:business`,
                    label: opt.label.startsWith('[B] ') ? opt.label : `[B] ${opt.label}`,
                    indicator: 'business'
                })
            } else if (indicator === 'personal') {
                // Personal only - single entry
                result.push({
                    ...opt,
                    value: opt.value.endsWith(':personal') ? opt.value : `${opt.value}:personal`,
                    label: opt.label.startsWith('[P] ') ? opt.label : `[P] ${opt.label}`,
                    indicator: 'personal'
                })
            } else {
                // Both variants needed (raw.business === null)
                // Check if value already has suffix to avoid double-processing
                if (opt.value.endsWith(':business') || opt.value.endsWith(':personal')) {
                    result.push({ ...opt, indicator: null })
                } else {
                    // Create both personal and business variants
                    result.push({
                        value: `${opt.value}:personal`,
                        label: `[P] ${opt.label.replace(/^\[(B|P)\]\s*/, '')}`,
                        group: 'Personal',
                        indicator: 'personal'
                    })
                    result.push({
                        value: `${opt.value}:business`,
                        label: `[B] ${opt.label.replace(/^\[(B|P)\]\s*/, '')}`,
                        group: 'Business',
                        indicator: 'business'
                    })
                }
            }
        })

        return result
    }, [options])

    // Filter options based on search and selection
    const availableOptions = useMemo(() => {
        return processedOptions.filter(opt =>
            !selectedValues.includes(opt.value) &&
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
    }, [processedOptions, selectedValues, search])

    // Get selected options for display
    const selectedOptions = useMemo(() => {
        return selectedValues.map(value => {
            const opt = processedOptions.find(o => o.value === value)
            return opt || { value, label: value, indicator: null }
        })
    }, [selectedValues, processedOptions])

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition()
            // Also update on scroll/resize
            const handleUpdate = () => updateDropdownPosition()
            window.addEventListener('scroll', handleUpdate, true)
            window.addEventListener('resize', handleUpdate)
            return () => {
                window.removeEventListener('scroll', handleUpdate, true)
                window.removeEventListener('resize', handleUpdate)
            }
        }
    }, [isOpen, updateDropdownPosition])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            // Check if click is inside container or dropdown portal
            const dropdownPortal = document.getElementById('multiselect-dropdown-portal')
            if (containerRef.current && !containerRef.current.contains(target) &&
                (!dropdownPortal || !dropdownPortal.contains(target))) {
                setIsOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string) => {
        const newValues = [...selectedValues, optionValue]
        onSetEditValue(joinMultiValue(newValues))
        setSearch('')
        inputRef.current?.focus()
    }

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newValues = selectedValues.filter(v => v !== optionValue)
        onSetEditValue(joinMultiValue(newValues))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && search === '' && selectedValues.length > 0) {
            const newValues = selectedValues.slice(0, -1)
            onSetEditValue(joinMultiValue(newValues))
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
            setSearch('')
            onEditKeyPress(e)
        }
        if (e.key === 'Enter' && availableOptions.length > 0) {
            e.preventDefault()
            handleSelect(availableOptions[0].value)
        }
    }

    const handleSave = async () => {
        await onSaveEditing(editValue)
    }

    const getChipColor = (indicator?: 'business' | 'personal' | null) => {
        if (indicator === 'business') return 'badge-primary'
        if (indicator === 'personal') return 'badge-ghost'
        return 'badge-neutral'
    }

    const getCleanLabel = (label: string) => {
        return label.replace(/^\[(B|P)\]\s*/, '')
    }

    return (
        <div className="flex items-center gap-1" ref={containerRef}>
            <div
                className={cn(
                    'min-h-8 flex-1 rounded-lg border bg-base-100 px-2 py-1 cursor-pointer flex flex-wrap gap-1 items-center',
                    'border-base-300 focus-within:border-primary',
                    editingError && 'border-error'
                )}
                onClick={() => {
                    setIsOpen(true)
                    inputRef.current?.focus()
                }}
            >
                {/* Selected chips */}
                {selectedOptions.slice(0, 5).map((option) => (
                    <span
                        key={option.value}
                        className={cn('badge badge-sm gap-0.5', getChipColor(option.indicator))}
                    >
                        {/* Show indicator badge for business/personal */}
                        {option.indicator && (
                            <span className="opacity-70 font-bold">
                                {option.indicator === 'business' ? 'B' : 'P'}
                            </span>
                        )}
                        {getCleanLabel(option.label)}
                        <button
                            type="button"
                            onClick={(e) => handleRemove(option.value, e)}
                            className="hover:text-error ml-0.5"
                        >
                            <IconX size={12} />
                        </button>
                    </span>
                ))}

                {selectedOptions.length > 5 && (
                    <span className="badge badge-sm badge-neutral">
                        +{selectedOptions.length - 5}
                    </span>
                )}

                {/* Search input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedValues.length === 0 ? 'Select...' : ''}
                    className="flex-1 min-w-[60px] bg-transparent outline-none text-xs"
                    disabled={isEditingSaving}
                />

                <IconChevronDown
                    size={14}
                    className={cn(
                        'text-base-content/50 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </div>

            {/* Dropdown Portal - renders outside table container to avoid overflow clipping */}
            {isOpen && dropdownPosition && typeof document !== 'undefined' && createPortal(
                <div
                    id="multiselect-dropdown-portal"
                    className="fixed z-[9999] max-h-48 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                    }}
                >
                    {availableOptions.length === 0 ? (
                        <div className="px-3 py-2 text-base-content/50 text-xs">
                            {search ? 'No matches' : 'No more options'}
                        </div>
                    ) : (
                        availableOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="px-3 py-1.5 cursor-pointer hover:bg-base-200 flex items-center gap-1.5 text-xs"
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

            <Button
                onClick={handleSave}
                onMouseDown={() => onSetIsClickingSaveButton(true)}
                onMouseUp={() => onSetIsClickingSaveButton(false)}
                onMouseLeave={() => onSetIsClickingSaveButton(false)}
                processing={isEditingSaving}
                success={editingSaveSuccess}
                color="success"
                style="soft"
                size="icon"
                title="Save changes"
                icon={IconDeviceFloppy}
            />
        </div>
    );
}
