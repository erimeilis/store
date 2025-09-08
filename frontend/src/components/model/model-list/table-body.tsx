import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableBody, TableCell, TableHeaderCell, TableRow } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { InlineEditComponent } from './inline-edit';
import { EditingCell, IColumnDefinition, TableBodyProps } from './types';

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

    // If this column supports inline editing, make it clickable
    if (column.editableInline) {
        const cellContent = (() => {
            if (column.render) {
                return column.render(item);
            }

            const value = item[column.key as keyof T];
            if (value === null || value === undefined) {
                return '-';
            }

            // Handle date formatting - use consistent format to prevent hydration mismatch
            if (column.filterType === 'date' && typeof value === 'string') {
                const date = new Date(value);
                return date.toISOString().split('T')[0]; // Always YYYY-MM-DD format
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

    // Default non-editable cell rendering
    if (column.render) {
        return column.render(item);
    }

    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
        return '-';
    }

    // Handle date formatting - use consistent format to prevent hydration mismatch
    if (column.filterType === 'date' && typeof value === 'string') {
        const date = new Date(value);
        return date.toISOString().split('T')[0]; // Always YYYY-MM-DD format
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
}: {
    item: T;
    columns: IColumnDefinition<T>[];
    selectedItems: Set<number>;
    editingCell: EditingCell | null;
    editValue: string;
    editingError: string;
    isEditingSaving: boolean;
    editingSaveSuccess: boolean;
    editRoute: (id: number) => string;
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
}) {
    return (
        <TableRow key={item.id} className="hover:bg-base-300">
            <TableHeaderCell className="w-4 cursor-pointer">
                <div className="flex items-center">
                    <Checkbox
                        id={`select-item-${item.id}`}
                        checked={(selectedItems as any).has(item.id)}
                        onChange={(e) => (onItemSelect as any)(item.id, e.target.checked)}
                    />
                </div>
            </TableHeaderCell>
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
                          />
                      </TableCell>
                  ))}
            <TableHeaderCell className="w-fit text-right">
                <div className="flex items-center justify-end gap-2">
                    <Button size="icon" color="primary" style="soft" icon={IconEdit} title="Edit" onClick={() => window.location.href = (editRoute as any)(item.id)} />
                    <Button size="icon" color="error" style="soft" icon={IconTrash} title="Delete" onClick={() => onDeleteItem(item)} />
                </div>
            </TableHeaderCell>
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
}: TableBodyProps<T>) {
    return (
        <TableBody>
            {!items || !items.data || items.data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={100} className="p-2 text-center">
                        No items found
                    </TableCell>
                </TableRow>
            ) : (
                items.data.map((item: T) => (
                    <ModelTableRow
                        key={item.id}
                        item={item}
                        columns={columns}
                        selectedItems={selectedItems as any}
                        editingCell={editingCell}
                        editValue={editValue}
                        editingError={editingError}
                        isEditingSaving={isEditingSaving}
                        editingSaveSuccess={editingSaveSuccess}
                        editRoute={editRoute}
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
                    />
                ))
            )}
        </TableBody>
    );
}
