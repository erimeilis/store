import { TableCell, TableHeaderCell, TableRow } from '@/components/ui/table';
import { IModel } from '@/types/models';
import React from 'react';
import { DateFilterCell } from './filter-components/date-filter-cell';
import { SelectFilterCell } from './filter-components/select-filter-cell';
import { TextFilterCell } from './filter-components/text-filter-cell';
import { FiltersRowProps, IColumnDefinition } from './types';

// Individual Filter Cell Component
function FilterCell<T extends IModel>({
    column,
    filterValue,
    calendarTriggersRef,
    onColumnFilter,
    onToggleDateFilter,
}: {
    column: IColumnDefinition<T>;
    filterValue: string;
    calendarTriggersRef: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
    onToggleDateFilter: (columnKey: string) => void;
}) {
    if (!column.filterable) return <TableCell key={String(column.key)} />;

    // Select filter
    if (column.filterType === 'select' && column.filterOptions) {
        return <SelectFilterCell column={column} filterValue={filterValue} onColumnFilter={onColumnFilter} />;
    }

    // Date filter
    if (column.filterType === 'date') {
        return (
            <DateFilterCell
                column={column}
                filterValue={filterValue}
                calendarTriggersRef={calendarTriggersRef}
                onColumnFilter={onColumnFilter}
                onToggleDateFilter={onToggleDateFilter}
            />
        );
    }

    // Text filter (default)
    return <TextFilterCell column={column} filterValue={filterValue} onColumnFilter={onColumnFilter} />;
}

export function FiltersRow<T extends IModel>({
    columns,
    columnFilters,
    calendarTriggersRef,
    onColumnFilter,
    onToggleDateFilter,
}: FiltersRowProps<T>) {
    return (
        <TableRow>
            <TableHeaderCell>{/* Empty cell for the checkbox column */}</TableHeaderCell>
            {columns.map((column) => {
                const filterValue = columnFilters[String(column.key)] || '';
                return (
                    <FilterCell
                        key={String(column.key)}
                        column={column}
                        filterValue={filterValue}
                        calendarTriggersRef={calendarTriggersRef}
                        onColumnFilter={onColumnFilter}
                        onToggleDateFilter={onToggleDateFilter}
                    />
                );
            })}
            <TableHeaderCell>{/* Empty cell for actions column */}</TableHeaderCell>
        </TableRow>
    );
}
