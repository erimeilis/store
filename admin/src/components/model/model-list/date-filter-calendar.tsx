import { Calendar } from '@/components/ui/calendar';
import { createPortal } from 'react-dom';
import { DateFilterCalendarProps } from './types';

export function DateFilterCalendar({ openDateFilters, calendarPositions, columnFilters, onDateSelect }: DateFilterCalendarProps) {
    if (openDateFilters.size === 0) return null;

    return createPortal(
        <div data-calendar-portal>
            {Array.from(openDateFilters).map((columnKey) => {
                const position = calendarPositions[columnKey];
                const filterValue = columnFilters[columnKey] || '';

                if (!position) return null;

                return (
                    <div
                        key={columnKey}
                        className="fixed z-[9999] rounded-box bg-base-100 shadow-xl"
                        style={{
                            top: position.top,
                            left: position.left,
                            minWidth: Math.max(position.width, 280), // Ensure minimum width for calendar
                        }}
                    >
                        <Calendar
                            value={filterValue ? new Date(filterValue) : undefined}
                            onSelect={(date) => onDateSelect(columnKey, date)}
                            size="sm"
                        />
                    </div>
                );
            })}
        </div>,
        document.body,
    );
}
