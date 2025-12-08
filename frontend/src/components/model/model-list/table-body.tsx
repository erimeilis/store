import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { TableBody, TableCell, TableHeaderCell, TableRow } from '@/components/ui/table';
import InputError from '@/components/ui/input-error';
import { IModel } from '@/types/models';
import { formatApiDate } from '@/lib/date-utils';
import { IconEdit, IconTrash, IconCheck, IconX, IconGripVertical, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import React from 'react';
import { InlineEditComponent } from './inline-edit';
import { EditingCell, IColumnDefinition, IRowAction, TableBodyProps } from './types';

// Add New Row Component
function AddNewRowComponent<T extends IModel>({
    columns,
    newRowData,
    _newRowError,
    isSavingNewRow,
    onUpdateNewRowData,
    onSaveNewRow,
    onCancelAddingNewRow,
    hasMassActions = true,
    hasActions = true,
}: {
    columns: IColumnDefinition<T>[];
    newRowData: Record<string, string>;
    _newRowError: string;
    isSavingNewRow: boolean;
    onUpdateNewRowData: (columnKey: string, value: string) => void;
    onSaveNewRow: () => Promise<void>;
    onCancelAddingNewRow: () => void;
    hasMassActions?: boolean;
    hasActions?: boolean;
}) {
    const handleInputChange = (columnKey: string, value: string) => {
        onUpdateNewRowData(columnKey, value);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSavingNewRow) {
            e.preventDefault();
            onSaveNewRow();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancelAddingNewRow();
        }
    };

    const renderInputForColumn = (column: IColumnDefinition<T>) => {
        const columnKey = String(column.key);
        const value = newRowData[columnKey] || '';

        // Check if this is a system/non-editable column
        const isSystemColumn = !column.editableInline && !column.editType ||
                              columnKey === 'order' ||
                              columnKey === 'created_at' ||
                              columnKey === 'updated_at' ||
                              columnKey === 'id';

        // For system columns, render a disabled input showing the auto-generated value
        if (isSystemColumn) {
            let displayValue = '';
            if (columnKey === 'order') {
                displayValue = 'Auto';
            } else if (columnKey === 'created_at' || columnKey === 'updated_at') {
                displayValue = 'Auto-generated';
            } else if (columnKey === 'id') {
                displayValue = 'Auto-generated';
            }

            return (
                <input
                    type="text"
                    value={displayValue}
                    placeholder={displayValue}
                    className="input input-sm input-bordered w-full"
                    disabled={true}
                    readOnly={true}
                />
            );
        }

        switch (column.editType) {
            case 'email':
                return (
                    <input
                        type="email"
                        value={value}
                        onChange={(e) => handleInputChange(columnKey, e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Enter ${column.label.replace(' *', '')}`}
                        className="input input-sm input-bordered w-full"
                        disabled={isSavingNewRow}
                        required={column.editValidation?.required}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(columnKey, e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Enter ${column.label.replace(' *', '')}`}
                        className="input input-sm input-bordered w-full"
                        disabled={isSavingNewRow}
                        required={column.editValidation?.required}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleInputChange(columnKey, e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="input input-sm input-bordered w-full"
                        disabled={isSavingNewRow}
                        required={column.editValidation?.required}
                    />
                );
            case 'toggle': {
                const isChecked = value === 'true' || value === '1' || String(value) === 'true';
                return (
                    <div className="flex items-center justify-center">
                        <Toggle
                            color="success"
                            size="sm"
                            checked={isChecked}
                            onChange={(e) => {
                                const newValue = e.target.checked ? 'true' : 'false';
                                handleInputChange(columnKey, newValue);
                            }}
                            disabled={isSavingNewRow}
                        />
                    </div>
                );
            }
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(columnKey, e.target.value)}
                        onKeyDown={handleKeyPress as any}
                        className="select select-sm select-bordered w-full"
                        disabled={isSavingNewRow}
                        required={column.editValidation?.required}
                    >
                        <option value="">Select...</option>
                        {column.editOptions?.map((option, idx) => (
                            <option key={`${option.value}-${idx}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(columnKey, e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Enter ${column.label.replace(' *', '')}`}
                        className="input input-sm input-bordered w-full"
                        disabled={isSavingNewRow}
                        required={column.editValidation?.required}
                        maxLength={column.editValidation?.maxLength}
                        minLength={column.editValidation?.minLength}
                    />
                );
        }
    };

    return (
        <TableRow className="bg-base-100 border-2 border-dashed border-primary">
            {hasMassActions && (
                <TableHeaderCell>
                    <div className="flex items-center">
                        <span className="text-xs text-primary font-semibold">New</span>
                    </div>
                </TableHeaderCell>
            )}
            {columns.map((column) => (
                <TableCell key={String(column.key)} className={column.className || ''}>
                    {renderInputForColumn(column)}
                </TableCell>
            ))}
            {hasActions && (
                <TableHeaderCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                        {isSavingNewRow ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <>
                                <Button
                                    size="icon"
                                    color="success"
                                    style="soft"
                                    icon={IconCheck}
                                    title="Save new row"
                                    onClick={() => onSaveNewRow()}
                                    disabled={isSavingNewRow}
                                />
                                <Button
                                    size="icon"
                                    color="default"
                                    style="ghost"
                                    icon={IconX}
                                    title="Cancel"
                                    onClick={onCancelAddingNewRow}
                                    disabled={isSavingNewRow}
                                />
                            </>
                        )}
                    </div>
                </TableHeaderCell>
            )}
        </TableRow>
    );
}

// Individual Table Cell Component
function TableCellContent<T extends IModel>({
    item,
    column,
    editingCell,
    editValue,
    editingError,
    isEditingSaving,
    editingSaveSuccess,
    onStartEditing,
    onSaveEditing,
    onSetEditValue,
    onEditKeyPress,
    onInputBlur,
    onSetIsClickingSaveButton,
    orderingHandlers,
}: {
    item: T;
    column: IColumnDefinition<T>;
    editingCell: EditingCell | null;
    editValue: string;
    editingError: string;
    isEditingSaving: boolean;
    editingSaveSuccess: boolean;
    onStartEditing: (item: T, column: IColumnDefinition<T>) => void;
    onSaveEditing: (valueToSave?: string) => Promise<void>;
    onSetEditValue: (value: string) => void;
    onEditKeyPress: (e: React.KeyboardEvent) => void;
    onInputBlur: () => void;
    onSetIsClickingSaveButton: (value: boolean) => void;
    orderingHandlers?: any;
}) {
    const columnKey = String(column.key);
    const isCurrentlyEditing = editingCell?.itemId === item.id && editingCell?.columnKey === columnKey;

    // If this cell is being edited, render the edit component
    if (isCurrentlyEditing) {
        return (
            <InlineEditComponent
                column={column}
                editValue={editValue}
                editingError={editingError}
                isEditingSaving={isEditingSaving}
                editingSaveSuccess={editingSaveSuccess}
                onSetEditValue={onSetEditValue}
                onSaveEditing={onSaveEditing}
                onEditKeyPress={onEditKeyPress}
                onInputBlur={onInputBlur}
                onSetIsClickingSaveButton={onSetIsClickingSaveButton}
            />
        );
    }

    // Check if this cell is editable (either always editable or conditionally editable)
    const isEditable = column.editableInline &&
        (column.isEditableInline ? column.isEditableInline(item) : true);

    // If this column supports inline editing, make it clickable
    if (isEditable) {
        const cellContent = (() => {
            if (column.render) {
                return column.render(item);
            }

            const value = item[column.key as keyof T];
            if (value === null || value === undefined) {
                return '-';
            }

            // Handle date formatting - use dd.mm.yyyy format for display
            if (column.filterType === 'date' && typeof value === 'string') {
                return formatApiDate(value); // Always dd.mm.yyyy format for display
            }

            return String(value);
        })();

        return (
            <div
                onClick={() => onStartEditing(item, column)}
                className="group cursor-pointer rounded p-1 transition-colors duration-150 hover:bg-base-200"
                title="Click to edit"
            >
                <div className="flex items-center justify-between">
                    <span>{cellContent}</span>
                    <Icon
                        iconNode={IconEdit}
                        className="text-muted-foreground ml-1 h-3 w-3 flex-shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                    />
                </div>
            </div>
        );
    }

    // Check if this is an "order" column and ordering is enabled
    if (String(column.key) === 'order' && orderingHandlers) {
        const handlers = orderingHandlers;
        const positionInfo = handlers.getPositionInfo(item);

        return (
            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                <div
                    draggable={true}
                    onDragStart={(e) => handlers.onDragStart(e, item)}
                    onDragEnd={handlers.onDragEnd}
                    className="cursor-grab active:cursor-grabbing drag-handle"
                    title="Drag to reorder"
                >
                    <IconGripVertical className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </div>
                <Button
                    type="button"
                    onClick={() => handlers.onMoveItem(item, 'up')}
                    disabled={positionInfo.isFirst}
                    title="Move up"
                    style="ghost"
                    size="icon"
                    icon={IconArrowUp}
                />
                <Button
                    type="button"
                    onClick={() => handlers.onMoveItem(item, 'down')}
                    disabled={positionInfo.isLast}
                    title="Move down"
                    style="ghost"
                    size="icon"
                    icon={IconArrowDown}
                />
            </div>
        );
    }

    // Default non-editable cell rendering
    if (column.render) {
        return column.render(item);
    }

    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
        return '-';
    }

    // Handle date formatting - use dd.mm.yyyy format for display
    if (column.filterType === 'date' && typeof value === 'string') {
        return formatApiDate(value); // Always dd.mm.yyyy format for display
    }

    return String(value);
}

// Individual Table Row Component
function ModelTableRow<T extends IModel>({
    item,
    columns,
    selectedItems,
    editingCell,
    editValue,
    editingError,
    isEditingSaving,
    editingSaveSuccess,
    editRoute,
    deleteRoute,
    useLegacyRendering,
    onItemSelect,
    onStartEditing,
    onSaveEditing,
    onSetEditValue,
    onEditKeyPress,
    onInputBlur,
    onSetIsClickingSaveButton,
    onDeleteItem,
    renderItem,
    rowActions,
    orderingHandlers,
    hasMassActions = true,
    hasActions = true,
}: {
    item: T;
    columns: IColumnDefinition<T>[];
    selectedItems: Set<number>;
    editingCell: EditingCell | null;
    editValue: string;
    editingError: string;
    isEditingSaving: boolean;
    editingSaveSuccess: boolean;
    editRoute: (id: number | string) => string;
    deleteRoute: (id: number | string) => string;
    useLegacyRendering: boolean;
    onItemSelect: (itemId: number, checked: boolean) => void;
    onStartEditing: (item: T, column: IColumnDefinition<T>) => void;
    onSaveEditing: (valueToSave?: string) => Promise<void>;
    onSetEditValue: (value: string) => void;
    onEditKeyPress: (e: React.KeyboardEvent) => void;
    onInputBlur: () => void;
    onSetIsClickingSaveButton: (value: boolean) => void;
    onDeleteItem: (item: T) => void;
    renderItem?: (item: T) => React.ReactNode;
    rowActions?: IRowAction<T>[];
    orderingHandlers?: any;
    hasMassActions?: boolean;
    hasActions?: boolean;
}) {
    return (
        <TableRow
            key={item.id}
            className="hover:bg-base-300"
            draggable={!!orderingHandlers}
            onDragStart={orderingHandlers ? (e) => orderingHandlers.onDragStart(e, item) : undefined}
            onDragOver={orderingHandlers?.onDragOver}
            onDragEnd={orderingHandlers?.onDragEnd}
            onDrop={orderingHandlers ? (e) => orderingHandlers.onDrop(e, item) : undefined}
        >
            {hasMassActions && (
                <TableHeaderCell>
                    <div className="flex items-center">
                        <Checkbox
                            id={`select-item-${item.id}`}
                            checked={(selectedItems as any).has(item.id)}
                            onChange={(e) => (onItemSelect as any)(item.id, e.target.checked)}
                        />
                    </div>
                </TableHeaderCell>
            )}
            {useLegacyRendering
                ? renderItem && renderItem(item)
                : columns.map((column) => (
                      <TableCell key={String(column.key)} className={`${column.className || ''}`}>
                          <TableCellContent
                              item={item}
                              column={column}
                              editingCell={editingCell}
                              editValue={editValue}
                              editingError={editingError}
                              isEditingSaving={isEditingSaving}
                              editingSaveSuccess={editingSaveSuccess}
                              onStartEditing={onStartEditing}
                              onSaveEditing={onSaveEditing}
                              onSetEditValue={onSetEditValue}
                              onEditKeyPress={onEditKeyPress}
                              onInputBlur={onInputBlur}
                              onSetIsClickingSaveButton={onSetIsClickingSaveButton}
                              orderingHandlers={orderingHandlers}
                          />
                      </TableCell>
                  ))}
            {hasActions && (
                <TableHeaderCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                        {/* Custom row actions */}
                        {rowActions?.map((action, index) => (
                            <Button
                                key={index}
                                size="icon"
                                color={action.color || 'primary'}
                                style={action.style || 'soft'}
                                icon={action.icon}
                                title={action.title}
                                onClick={() => action.onClick(item)}
                            />
                        ))}
                        {/* Standard actions */}
                        {editRoute && editRoute(item.id) !== '#' && <Button size="icon" color="primary" style="soft" icon={IconEdit} title="Edit" onClick={() => window.location.href = (editRoute as any)(item.id)} />}
                        {deleteRoute(item.id) !== '#' && <Button size="icon" color="error" style="soft" icon={IconTrash} title="Delete" onClick={() => onDeleteItem(item)} />}
                    </div>
                </TableHeaderCell>
            )}
        </TableRow>
    );
}

// Main Table Body Component
export function ModelTableBody<T extends IModel>({
    items,
    columns,
    selectedItems,
    editingCell,
    editValue,
    editingError,
    isEditingSaving,
    editingSaveSuccess,
    editRoute,
    deleteRoute,
    useLegacyRendering,
    onItemSelect,
    onStartEditing,
    onSaveEditing,
    onSetEditValue,
    onEditKeyPress,
    onInputBlur,
    onSetIsClickingSaveButton,
    onDeleteItem,
    renderItem,
    rowActions,
    // Add Row functionality
    isAddingNewRow,
    newRowData,
    newRowError,
    isSavingNewRow,
    onUpdateNewRowData,
    onSaveNewRow,
    onCancelAddingNewRow,
    // Ordering functionality
    orderingHandlers,
    // Mass actions props for checkbox column visibility
    hasMassActions = true,
    // Actions column visibility
    hasActions = true,
}: TableBodyProps<T>) {
    return (
        <TableBody>
            {/* Regular table rows */}
            {!items || !items.data || items.data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={100} className="p-2 text-center">
                        No items found
                    </TableCell>
                </TableRow>
            ) : (
                items.data.map((item: T) => (
                    <React.Fragment key={item.id}>
                        <ModelTableRow
                            item={item}
                            columns={columns}
                            selectedItems={selectedItems as any}
                            editingCell={editingCell}
                            editValue={editValue}
                            editingError={editingError}
                            isEditingSaving={isEditingSaving}
                            editingSaveSuccess={editingSaveSuccess}
                            editRoute={editRoute}
                            deleteRoute={deleteRoute}
                            useLegacyRendering={useLegacyRendering}
                            onItemSelect={onItemSelect}
                            onStartEditing={onStartEditing}
                            onSaveEditing={onSaveEditing}
                            onSetEditValue={onSetEditValue}
                            onEditKeyPress={onEditKeyPress}
                            onInputBlur={onInputBlur}
                            onSetIsClickingSaveButton={onSetIsClickingSaveButton}
                            onDeleteItem={onDeleteItem}
                            renderItem={renderItem}
                            rowActions={rowActions}
                            orderingHandlers={orderingHandlers}
                            hasMassActions={hasMassActions}
                            hasActions={hasActions}
                        />
                        {/* Show error message below the row if editing this row and there's an error */}
                        {editingError && editingCell && editingCell.itemId === item.id && (
                            <TableRow>
                                <TableCell colSpan={100} className="p-2 bg-error/10">
                                    <InputError message={editingError} />
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))
            )}

            {/* Add New Row Component - shows at the bottom when active */}
            {isAddingNewRow && onUpdateNewRowData && onSaveNewRow && onCancelAddingNewRow && (
                <>
                    <AddNewRowComponent
                        columns={columns as IColumnDefinition<IModel>[]}
                        newRowData={newRowData || {}}
                        _newRowError={newRowError || ''}
                        isSavingNewRow={isSavingNewRow || false}
                        onUpdateNewRowData={onUpdateNewRowData}
                        onSaveNewRow={onSaveNewRow}
                        onCancelAddingNewRow={onCancelAddingNewRow}
                        hasMassActions={hasMassActions}
                        hasActions={hasActions}
                    />
                    {/* Show error message below the add row if there is one */}
                    {newRowError && (
                        <TableRow>
                            <TableCell colSpan={100} className="p-2">
                                <div className="alert alert-error text-sm">
                                    <span>{newRowError}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </>
            )}
        </TableBody>
    );
}
