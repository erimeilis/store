import { Icon } from '@/components/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IconChevronDown, IconChevronUp, IconDots } from '@tabler/icons-react';
import { IColumnDefinition, TableHeaderProps } from './types';
import { FiltersRow } from './filters-row';

// Column Header Cell Component
function ColumnHeaderCell<T extends IModel>({
    column,
    filters,
    onSort,
}: {
    column: IColumnDefinition<T>;
    filters: { sort?: string; direction?: 'asc' | 'desc' };
    onSort: (columnKey: string) => void;
}) {
    const isSorted = filters.sort === String(column.key);
    const sortDirection = filters.direction || 'asc';

    return (
        <TableCell key={String(column.key)} scope="col" className={`${column.headerClassName || ''}`}>
            <div className="flex items-center space-x-2">
                {column.sortable ? (
                    <button onClick={() => onSort(String(column.key))} className="flex items-center space-x-1 font-medium hover:text-primary">
                        <span>{column.label}</span>
                        {isSorted && <Icon iconNode={sortDirection === 'asc' ? IconChevronUp : IconChevronDown} className="h-4 w-4" />}
                    </button>
                ) : (
                    <span className="font-medium">{column.label}</span>
                )}
            </div>
        </TableCell>
    );
}

export function TableHeader<T extends IModel>({
    columns,
    filters,
    selectedItems,
    items,
    onSort,
    onSelectAll,
    useLegacyRendering,
    renderHeader,
    showFilters,
    hasFilterableColumns,
    columnFilters,
    openDateFilters,
    calendarTriggersRef,
    onColumnFilter,
    onToggleDateFilter,
    hasMassActions = true, // Default to true for backward compatibility
    hasActions = true, // Default to true for backward compatibility
}: TableHeaderProps<T>) {
    const isAllSelected = items?.data ? selectedItems.size === items.data.length && items.data.length > 0 : false;
    const isIndeterminate = selectedItems.size > 0 && selectedItems.size < (items?.data?.length || 0);

    return (
        <TableHead className="bg-muted text-xs uppercase">
            <TableRow>
                {hasMassActions && (
                    <TableHeaderCell scope="col">
                        <div className="flex items-center">
                            <Checkbox
                                id="select-all"
                                checked={isAllSelected}
                                ref={(checkbox) => {
                                    if (checkbox) {
                                        checkbox.indeterminate = isIndeterminate;
                                    }
                                }}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </div>
                    </TableHeaderCell>
                )}
                {useLegacyRendering
                    ? renderHeader && renderHeader()
                    : columns.map((column) => <ColumnHeaderCell key={String(column.key)} column={column} filters={filters} onSort={onSort} />)}
                {hasActions && (
                    <TableHeaderCell scope="col" className="text-right">
                        <div className="flex justify-end">
                            <IconDots />
                        </div>
                    </TableHeaderCell>
                )}
            </TableRow>
            {showFilters && hasFilterableColumns && !useLegacyRendering && columnFilters && openDateFilters && calendarTriggersRef && onColumnFilter && onToggleDateFilter && (
                <FiltersRow
                    columns={columns}
                    columnFilters={columnFilters}
                    openDateFilters={openDateFilters}
                    calendarTriggersRef={calendarTriggersRef}
                    onColumnFilter={onColumnFilter}
                    onToggleDateFilter={onToggleDateFilter}
                    hasMassActions={hasMassActions}
                    hasActions={hasActions}
                />
            )}
        </TableHead>
    );
}
