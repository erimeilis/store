import React, { useRef, useEffect } from 'react';
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
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input value when filter is cleared from parent (e.g., Clear All Filters button)
    // Only update if different and input is not focused (to avoid disrupting user typing)
    useEffect(() => {
        if (inputRef.current && inputRef.current !== document.activeElement) {
            if (inputRef.current.value !== filterValue) {
                inputRef.current.value = filterValue;
            }
        }
    }, [filterValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onColumnFilter(columnKey, value, 'text');
    };

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onColumnFilter(columnKey, '', 'text');
    };

    return (
        <TableCell key={columnKey}>
            <Input
                ref={inputRef}
                size="sm"
                type="text"
                placeholder={`Filter ${column.label.toLowerCase()}...`}
                defaultValue={filterValue}
                onChange={handleInputChange}
                suffix={
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-0.5 text-base-content/50 hover:text-base-content transition-colors"
                        title="Clear filter"
                    >
                        <IconX size={12} />
                    </button>
                }
            />
        </TableCell>
    );
}
