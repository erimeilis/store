import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IColumnDefinition } from '@/components/model/model-list/types';
import { IconX } from '@tabler/icons-react';

export interface TextFilterCellProps<T extends IModel> {
    column: IColumnDefinition<T>;
    filterValue: string;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
}

export function TextFilterCell<T extends IModel>({ column, filterValue, onColumnFilter }: TextFilterCellProps<T>) {
    const columnKey = String(column.key);
    const [localValue, setLocalValue] = useState(filterValue);

    // Sync local state when filter is cleared from parent (e.g., Clear All Filters button)
    useEffect(() => {
        setLocalValue(filterValue);
    }, [filterValue]);

    const handleInputChange = (value: string) => {
        setLocalValue(value);
        // Still trigger the debounced filter
        onColumnFilter(columnKey, value, 'text');
    };

    const handleClear = () => {
        setLocalValue('');
        onColumnFilter(columnKey, '', 'text');
    };

    return (
        <TableCell key={columnKey}>
            <Input
                size="sm"
                type="text"
                placeholder={`Filter ${column.label.toLowerCase()}...`}
                value={localValue}
                onChange={(e) => handleInputChange(e.target.value)}
                suffix={localValue ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-0.5 text-base-content/50 hover:text-base-content transition-colors"
                        title="Clear filter"
                    >
                        <IconX size={12} />
                    </button>
                ) : undefined}
            />
        </TableCell>
    );
}
