import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IColumnDefinition } from '@/components/model/model-list/types';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

export interface TextFilterCellProps<T extends IModel> {
    column: IColumnDefinition<T>;
    filterValue: string;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
}

export function TextFilterCell<T extends IModel>({ column, filterValue, onColumnFilter }: TextFilterCellProps<T>) {
    const columnKey = String(column.key);
    const [localValue, setLocalValue] = useState(filterValue);

    const handleInputChange = (value: string) => {
        setLocalValue(value);
        // Still trigger the debounced filter
        onColumnFilter(columnKey, value, 'text');
    };

    const handleSearchClick = () => {
        // Trigger immediate search by clearing and re-setting the value
        // This bypasses the debounce timeout
        onColumnFilter(columnKey, '', 'text');
        setTimeout(() => {
            onColumnFilter(columnKey, localValue, 'text');
        }, 0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <TableCell key={columnKey}>
            <div className="flex gap-1">
                <Input
                    size="sm"
                    type="text"
                    placeholder={`Filter ${column.label.toLowerCase()}...`}
                    value={localValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                />
                <Button
                    size="sm"
                    style="outline"
                    onClick={handleSearchClick}
                    className="px-2 shrink-0"
                    title="Search now"
                >
                    <IconSearch size={14} />
                </Button>
            </div>
        </TableCell>
    );
}
