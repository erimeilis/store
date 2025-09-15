import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { IModel } from '@/types/models';
import { IconCalendar, IconX } from '@tabler/icons-react';
import React from 'react';
import { formatApiDate } from '@/lib/date-utils';
import { IColumnDefinition } from '@/components/model/model-list/types';

export interface DateFilterCellProps<T extends IModel> {
    column: IColumnDefinition<T>;
    filterValue: string;
    calendarTriggersRef: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    onColumnFilter: (columnKey: string, value: string, filterType?: 'text' | 'select' | 'date') => void;
    onToggleDateFilter: (columnKey: string) => void;
}

export function DateFilterCell<T extends IModel>({
    column,
    filterValue,
    calendarTriggersRef,
    onColumnFilter,
    onToggleDateFilter,
}: DateFilterCellProps<T>) {
    const columnKey = String(column.key);

    return (
        <TableCell key={columnKey}>
            <div
                className="relative"
                data-calendar-dropdown
                ref={(el) => {
                    if (el) {
                        calendarTriggersRef.current[columnKey] = el;
                    } else {
                        delete calendarTriggersRef.current[columnKey];
                    }
                }}
            >
                <Input
                    size="sm"
                    type="text"
                    placeholder={`Filter ${column.label.toLowerCase()}...`}
                    value={filterValue ? formatApiDate(filterValue) : ''}
                    onClick={() => onToggleDateFilter(columnKey)}
                    readOnly
                    suffix={
                        filterValue ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onColumnFilter(columnKey, '', 'date');
                                }}
                                className="btn h-auto min-h-0 p-0 btn-ghost btn-xs"
                            >
                                <IconX />
                            </button>
                        ) : (
                            <IconCalendar />
                        )
                    }
                />
            </div>
        </TableCell>
    );
}
