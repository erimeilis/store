import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableWrapper } from '@/components/ui/table';
import { IMassAction, IModel } from '@/types/models';
import { IconFilter, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Import our extracted components
import { DateFilterCalendar } from './model-list/date-filter-calendar';
import { ModelListModals } from './model-list/modals';
import { ModelTableBody } from './model-list/table-body';
import { TableHeader } from './model-list/table-header';
import { EditingCell, IColumnDefinition, ModelListComponentProps } from './model-list/types';

// Re-export the interface for backward compatibility
export type { IColumnDefinition };

export function ModelList<T extends IModel>({
    title,
    items,
    filters,
    createRoute,
    editRoute,
    deleteRoute,
    massActionRoute,
    columns,
    massActions,
    renderItem,
    renderHeader,
}: ModelListComponentProps<T>) {
    // Selection state
    const [selectedItems, setSelectedItems] = useState<Set<number | string>>(new Set());

    // Filter state
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [openDateFilters, setOpenDateFilters] = useState<Set<string>>(new Set());
    const [calendarPositions, setCalendarPositions] = useState<Record<string, { top: number; left: number; width: number }>>({});
    const calendarTriggersRef = useRef<Record<string, HTMLDivElement | null>>({});

    // Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [massActionModalOpen, setMassActionModalOpen] = useState<boolean>(false);
    const [selectedMassAction, setSelectedMassAction] = useState<IMassAction | null>(null);
    const [isExecutingMassAction, setIsExecutingMassAction] = useState<boolean>(false);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isEditingSaving, setIsEditingSaving] = useState<boolean>(false);
    const [editingError, setEditingError] = useState<string>('');
    const [isClickingSaveButton, setIsClickingSaveButton] = useState<boolean>(false);
    const [editingSaveSuccess, setEditingSaveSuccess] = useState<boolean>(false);

    // Debounce ref for text filters
    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    // Reset selected items when items change
    useEffect(() => {
        setSelectedItems(new Set());
    }, [items]);

    // Initialize column filters from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters: Record<string, string> = {};
        columns.forEach((column) => {
            if (column.filterable) {
                const filterValue = urlParams.get(`filter_${String(column.key)}`);
                if (filterValue) {
                    initialFilters[String(column.key)] = filterValue;
                }
            }
        });
        setColumnFilters(initialFilters);
        setShowFilters(Object.keys(initialFilters).length > 0);
    }, [columns]);

    // Cleanup debounce timeouts on unmount
    useEffect(() => {
        const timeouts = debounceTimeouts.current;
        return () => {
            Object.values(timeouts).forEach((timeout) => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);

    // Close date filter dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDateFilters.size > 0) {
                const target = event.target as Element;
                const isCalendarTriggerClick = target.closest('[data-calendar-dropdown]');
                const isCalendarContentClick = target.closest('.rdp') || target.closest('[data-calendar-portal]');
                if (!isCalendarTriggerClick && !isCalendarContentClick) {
                    setOpenDateFilters(new Set());
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDateFilters]);

    // Handle sorting
    const handleSort = (columnKey: string) => {
        const currentSort = filters.sort;
        const currentDirection = filters.direction || 'asc';

        let newDirection: 'asc' | 'desc' = 'asc';
        if (currentSort === columnKey && currentDirection === 'asc') {
            newDirection = 'desc';
        }

        const params = new URLSearchParams(window.location.search);
        params.set('sort', columnKey);
        params.set('direction', newDirection);
        params.set('page', '1'); // Reset to first page when sorting

        // Navigate to the new URL with updated params
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    // Handle column filtering with debouncing for text inputs
    const updateUrlWithFilter = useCallback((columnKey: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value.trim() === '') {
            params.delete(`filter_${columnKey}`);
        } else {
            params.set(`filter_${columnKey}`, value);
        }
        params.set('page', '1'); // Reset to first page when filtering

        // Navigate to the new URL with updated params
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    }, []);

    const handleColumnFilter = (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => {
        const newFilters = { ...columnFilters };

        if (value.trim() === '') {
            delete newFilters[columnKey];
        } else {
            newFilters[columnKey] = value;
        }

        setColumnFilters(newFilters);

        // Clear any existing timeout for this column
        if (debounceTimeouts.current[columnKey]) {
            clearTimeout(debounceTimeouts.current[columnKey]);
        }

        // For text filters, debounce the URL update
        if (filterType === 'text') {
            debounceTimeouts.current[columnKey] = setTimeout(() => {
                updateUrlWithFilter(columnKey, value);
            }, 300); // 300ms debounce
        } else {
            // For select and date filters, update immediately
            updateUrlWithFilter(columnKey, value);
        }
    };

    // Clear all column filters
    const clearAllFilters = () => {
        setColumnFilters({});
        setShowFilters(false);

        const params = new URLSearchParams(window.location.search);
        columns.forEach((column) => {
            if (column.filterable) {
                params.delete(`filter_${String(column.key)}`);
            }
        });

        // Navigate to the new URL with cleared filters
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    const handleItemSelect = (itemId: number | string, checked: boolean) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(itemId);
            } else {
                newSet.delete(itemId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (!items?.data) return;

        if (checked) {
            const allIds = items.data.map((item) => item.id);
            setSelectedItems(new Set(allIds));
        } else {
            setSelectedItems(new Set());
        }
    };

    // Handle delete modal
    const openDeleteModal = (item: T) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setIsDeleting(false);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        
        try {
            const response = await fetch(deleteRoute(itemToDelete.id), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                closeDeleteModal();
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                console.error('Delete failed:', response.statusText);
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Delete error:', error);
            setIsDeleting(false);
        }
    };

    // Handle mass action modal
    const openMassActionModal = (action: IMassAction) => {
        setSelectedMassAction(action);
        setMassActionModalOpen(true);
    };

    const closeMassActionModal = () => {
        setMassActionModalOpen(false);
        setSelectedMassAction(null);
        setIsExecutingMassAction(false);
    };

    const handleMassActionConfirm = async () => {
        if (!selectedMassAction || selectedItems.size === 0) return;

        setIsExecutingMassAction(true);
        const selectedItemIds = Array.from(selectedItems);

        try {
            const response = await fetch(massActionRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: selectedMassAction.name,
                    ids: selectedItemIds,
                }),
            });

            if (response.ok) {
                closeMassActionModal();
                setSelectedItems(new Set()); // Clear selection after successful mass action
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                console.error('Mass action failed:', response.statusText);
                setIsExecutingMassAction(false);
            }
        } catch (error) {
            console.error('Mass action error:', error);
            setIsExecutingMassAction(false);
        }
    };

    // Handle inline editing
    const startEditing = (item: T, column: IColumnDefinition<T>) => {
        if (!column.editableInline) return;

        const columnKey = String(column.key);
        const currentValue = item[column.key as keyof T];

        setEditingCell({ itemId: item.id, columnKey });

        // For select fields with boolean values, convert properly
        let editValue: string;
        if (column.editType === 'select' && typeof currentValue === 'boolean') {
            editValue = currentValue ? 'true' : 'false';
        } else {
            editValue = String(currentValue || '');
        }

        setEditValue(editValue);
        setEditingError('');
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setEditValue('');
        setEditingError('');
        setIsEditingSaving(false);
        setIsClickingSaveButton(false);
        setEditingSaveSuccess(false);
    };

    const handleSaveSuccess = () => {
        setIsEditingSaving(false);
        setEditingSaveSuccess(true);
        // Show success feedback for 2 seconds before canceling editing
        setTimeout(() => {
            cancelEditing();
        }, 2000);
    };

    const handleInputBlur = () => {
        // Don't cancel if user is clicking the save button
        if (!isClickingSaveButton) {
            cancelEditing();
        }
    };

    const validateEditValue = (column: IColumnDefinition<T>, value: string): string => {
        if (!column.editValidation) return '';

        const validation = column.editValidation;

        if (validation.required && !value.trim()) {
            return 'This field is required';
        }

        if (validation.minLength && value.length < validation.minLength) {
            return `Minimum length is ${validation.minLength} characters`;
        }

        if (validation.maxLength && value.length > validation.maxLength) {
            return `Maximum length is ${validation.maxLength} characters`;
        }

        if (validation.pattern && !validation.pattern.test(value)) {
            return 'Invalid format';
        }

        return '';
    };

    const saveEditing = async (valueToSave?: string) => {
        if (!editingCell) return;

        const item = items?.data?.find((i) => i.id === editingCell.itemId);
        const column = columns.find((c) => String(c.key) === editingCell.columnKey);

        if (!item || !column || !column.editableInline) return;

        // Use provided value or fall back to current editValue
        const currentValue = valueToSave ?? editValue;

        const validationError = validateEditValue(column, currentValue);
        if (validationError) {
            setEditingError(validationError);
            return;
        }

        setIsEditingSaving(true);
        setEditingError('');

        try {
            if (column.onSave) {
                await column.onSave(item, currentValue);
                handleSaveSuccess();
            } else {
                // Default save behavior - make a PATCH request
                // Convert currentValue to proper type based on column configuration
                let convertedValue: string | boolean | number = currentValue;

                if (column.editType === 'select' && column.editOptions) {
                    // For select fields, find the actual value from editOptions
                    const selectedOption = column.editOptions.find((opt) => opt.label === currentValue || String(opt.value) === currentValue);
                    if (selectedOption) {
                        convertedValue = selectedOption.value;
                    } else {
                        // Try to convert boolean strings
                        if (currentValue === 'true' || currentValue === 'Active') {
                            convertedValue = true;
                        } else if (currentValue === 'false' || currentValue === 'Inactive') {
                            convertedValue = false;
                        }
                    }
                } else if (column.editType === 'number') {
                    convertedValue = Number(currentValue);
                }

                try {
                    const response = await fetch(`${window.location.pathname}/${item.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            [editingCell.columnKey]: convertedValue,
                        }),
                    });

                    if (response.ok) {
                        handleSaveSuccess();
                    } else {
                        console.error('Save failed:', response.statusText);
                        setEditingError('Failed to save changes');
                        setIsEditingSaving(false);
                    }
                } catch (error) {
                    console.error('Save error:', error);
                    setEditingError('Failed to save changes');
                    setIsEditingSaving(false);
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            setEditingError('Failed to save changes');
            setIsEditingSaving(false);
        }
    };

    const handleEditKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    };

    // Handle date filter dropdown toggle
    const toggleDateFilter = (columnKey: string) => {
        setOpenDateFilters((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(columnKey)) {
                newSet.delete(columnKey);
                // Remove position data when closing
                setCalendarPositions((prevPos) => {
                    const newPos = { ...prevPos };
                    delete newPos[columnKey];
                    return newPos;
                });
            } else {
                newSet.add(columnKey);
                // Calculate position when opening
                const triggerElement = calendarTriggersRef.current[columnKey];
                if (triggerElement) {
                    const rect = triggerElement.getBoundingClientRect();
                    setCalendarPositions((prevPos) => ({
                        ...prevPos,
                        [columnKey]: {
                            top: rect.bottom + window.scrollY + 4, // 4px margin
                            left: rect.left + window.scrollX,
                            width: rect.width,
                        },
                    }));
                }
            }
            return newSet;
        });
    };

    // Handle date selection from calendar
    const handleDateSelect = (columnKey: string, date: Date | undefined) => {
        const dateValue = date ? date.toISOString().split('T')[0] : '';
        handleColumnFilter(columnKey, dateValue, 'date');
        // Close the dropdown after selection
        setOpenDateFilters((prev) => {
            const newSet = new Set(prev);
            newSet.delete(columnKey);
            return newSet;
        });
    };

    // Determine if we should use legacy rendering or new column-based rendering
    const useLegacyRendering = !columns || columns.length === 0;
    const hasFilterableColumns = columns?.some((col) => col.filterable) || false;

    return (
        <div className="px-4 py-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title={title} />
                    <Button icon={IconPlus} onClick={() => window.location.href = createRoute}>
                        Create New
                    </Button>
                </div>

                <Card>
                    <CardBody>
                        {/* Table Title and Controls */}
                        <div className="mb-4 flex items-baseline justify-between">
                            <div className="font-semibold">All {title}</div>
                            <div className="flex items-center space-x-4">
                                {selectedItems.size > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <div className="text-muted-foreground font-light">({selectedItems.size} selected)</div>
                                        {massActions && massActions.length > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-muted-foreground text-sm">•</span>
                                                <div className="flex items-center space-x-1">
                                                    {massActions.map((action) => (
                                                        <Button
                                                            key={action.name}
                                                            size="sm"
                                                            color={action.name === 'delete' ? 'error' : 'primary'}
                                                            style="soft"
                                                            onClick={() => openMassActionModal(action)}
                                                            icon={action.name === 'delete' ? IconTrash : undefined}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {hasFilterableColumns && (
                                <div className="flex items-center space-x-2">
                                    <Button size="sm" onClick={() => setShowFilters(!showFilters)} icon={IconFilter}>
                                        Filters
                                    </Button>
                                    {Object.keys(columnFilters).length > 0 && (
                                        <Button style="ghost" size="sm" onClick={clearAllFilters} icon={IconX}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <TableWrapper>
                            <Table modifier="zebra pinCols" className="w-full text-left text-sm">
                                <TableHeader
                                    columns={columns}
                                    filters={filters}
                                    selectedItems={selectedItems}
                                    items={items}
                                    onSort={handleSort}
                                    onSelectAll={handleSelectAll}
                                    useLegacyRendering={useLegacyRendering}
                                    renderHeader={renderHeader}
                                    showFilters={showFilters}
                                    hasFilterableColumns={hasFilterableColumns}
                                    columnFilters={columnFilters}
                                    openDateFilters={openDateFilters}
                                    calendarTriggersRef={calendarTriggersRef}
                                    onColumnFilter={handleColumnFilter}
                                    onToggleDateFilter={toggleDateFilter}
                                />
                                <ModelTableBody
                                    items={items}
                                    columns={columns}
                                    selectedItems={selectedItems}
                                    editingCell={editingCell}
                                    editValue={editValue}
                                    editingError={editingError}
                                    isEditingSaving={isEditingSaving}
                                    editingSaveSuccess={editingSaveSuccess}
                                    editRoute={editRoute}
                                    useLegacyRendering={useLegacyRendering}
                                    onItemSelect={handleItemSelect}
                                    onStartEditing={startEditing}
                                    onSaveEditing={saveEditing}
                                    onSetEditValue={setEditValue}
                                    onEditKeyPress={handleEditKeyPress}
                                    onInputBlur={handleInputBlur}
                                    onSetIsClickingSaveButton={setIsClickingSaveButton}
                                    onDeleteItem={openDeleteModal}
                                    renderItem={renderItem}
                                />
                            </Table>
                        </TableWrapper>

                        {items && items.last_page > 1 && (
                            <Pagination items={items} showPrevNext={true} showPageInput={true} maxVisiblePages={7} size="sm" />
                        )}
                    </CardBody>
                </Card>

                {/* Date Filter Calendar Portal */}
                <DateFilterCalendar
                    openDateFilters={openDateFilters}
                    calendarPositions={calendarPositions}
                    columnFilters={columnFilters}
                    onDateSelect={handleDateSelect}
                />

                {/* Modals */}
                <ModelListModals
                    deleteModalOpen={deleteModalOpen}
                    itemToDelete={itemToDelete}
                    isDeleting={isDeleting}
                    massActionModalOpen={massActionModalOpen}
                    selectedMassAction={selectedMassAction}
                    isExecutingMassAction={isExecutingMassAction}
                    selectedCount={selectedItems.size}
                    onCloseDeleteModal={closeDeleteModal}
                    onConfirmDelete={handleDeleteConfirm}
                    onCloseMassActionModal={closeMassActionModal}
                    onConfirmMassAction={handleMassActionConfirm}
                />
            </div>
        </div>
    );
}
