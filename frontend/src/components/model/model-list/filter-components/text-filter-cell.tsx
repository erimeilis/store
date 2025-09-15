import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IColumnDefinition } from '@/components/model/model-list/types';

export interface TextFilterCellProps<T extends IModel> {
    column: IColumnDefinition<T>;
    filterValue: string;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
}

export function TextFilterCell<T extends IModel>({ column, filterValue, onColumnFilter }: TextFilterCellProps<T>) {
    const columnKey = String(column.key);

    return (
        <TableCell key={columnKey}>
            <Input
                size="sm"
                type="text"
                placeholder={`Filter ${column.label.toLowerCase()}...`}
                value={filterValue}
                onChange={(e) => onColumnFilter(columnKey, e.target.value, 'text')}
            />
        </TableCell>
    );
}
