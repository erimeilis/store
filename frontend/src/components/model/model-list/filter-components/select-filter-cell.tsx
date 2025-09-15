import { Select } from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IColumnDefinition } from '@/components/model/model-list/types';

export interface SelectFilterCellProps<T extends IModel> {
    column: IColumnDefinition<T>;
    filterValue: string;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
}

export function SelectFilterCell<T extends IModel>({ column, filterValue, onColumnFilter }: SelectFilterCellProps<T>) {
    if (!column.filterOptions) return <TableCell key={String(column.key)} />;

    const columnKey = String(column.key);

    return (
        <TableCell key={columnKey}>
            <Select size="sm" value={filterValue} onChange={(e) => onColumnFilter(columnKey, e.target.value, 'select')}>
                <option value="">All</option>
                {column.filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        </TableCell>
    );
}
