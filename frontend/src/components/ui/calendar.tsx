import * as React from 'react'
import {DayPicker, getDefaultClassNames, useNavigation} from 'react-day-picker'
import {cn} from '@/lib/utils'
import {cva, type VariantProps} from 'class-variance-authority'
import {Button} from '@/components/ui/button'
import {Select} from '@/components/ui/select'
import {IconChevronLeft, IconChevronRight} from '@tabler/icons-react'

const calendarVariants = cva(
    'rdp',
    {
        variants: {
            size: {
                sm: 'rdp-sm',
                md: 'rdp-md',
                lg: 'rdp-lg',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

export interface CalendarProps extends VariantProps<typeof calendarVariants> {
    className?: string
    value?: Date
    onSelect?: (date: Date | undefined) => void
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    showTodayButton?: boolean
    fromYear?: number
    toYear?: number
}

// Custom Caption component for navigation
function CustomCaption({calendarMonth, fromYear, toYear}: {
    calendarMonth: { date: Date };
    displayIndex: number;
    fromYear?: number;
    toYear?: number;
}) {
    const {goToMonth, nextMonth, previousMonth} = useNavigation()

    // Create month options
    const monthOptions = [
        {value: '0', label: 'January'},
        {value: '1', label: 'February'},
        {value: '2', label: 'March'},
        {value: '3', label: 'April'},
        {value: '4', label: 'May'},
        {value: '5', label: 'June'},
        {value: '6', label: 'July'},
        {value: '7', label: 'August'},
        {value: '8', label: 'September'},
        {value: '9', label: 'October'},
        {value: '10', label: 'November'},
        {value: '11', label: 'December'},
    ]

    // Create year options based on fromYear and toYear
    const currentYear = new Date().getFullYear()
    const startYear = fromYear || currentYear - 10
    const endYear = toYear || currentYear + 10

    const yearOptions = []
    for (let year = startYear; year <= endYear; year++) {
        yearOptions.push({value: year.toString(), label: year.toString()})
    }

    // Handle month change
    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(event.target.value)
        const newDate = new Date(calendarMonth.date.getFullYear(), monthIndex, 1)
        goToMonth(newDate)
    }

    // Handle year change
    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const year = parseInt(event.target.value)
        const newDate = new Date(year, calendarMonth.date.getMonth(), 1)
        goToMonth(newDate)
    }

    return (
        <div className="rdp-caption flex justify-between items-center py-2 px-1">
            <Button
                size="icon"
                style="ghost"
                icon={IconChevronLeft}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                disabled={!previousMonth}
                className="rdp-button_previous"
            />

            <div className="flex items-center gap-2 flex-1 justify-center">
                <Select
                    size="sm"
                    style="ghost"
                    options={monthOptions}
                    value={calendarMonth.date.getMonth().toString()}
                    onChange={handleMonthChange}
                    className="min-w-0"
                />
                <Select
                    size="sm"
                    style="ghost"
                    options={yearOptions}
                    value={calendarMonth.date.getFullYear().toString()}
                    onChange={handleYearChange}
                    className="min-w-0"
                />
            </div>

            <Button
                size="icon"
                style="ghost"
                icon={IconChevronRight}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                disabled={!nextMonth}
                className="rdp-button_next"
            />
        </div>
    )
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    ({className, size, value, onSelect, weekStartsOn = 0, showTodayButton = true, fromYear, toYear}, ref) => {
        const [month, setMonth] = React.useState<Date>(value || new Date())
        const today = new Date()
        const defaultClassNames = getDefaultClassNames()

        const handleTodayClick = () => {
            setMonth(today)
            onSelect?.(today)
        }

        return (
            <div
                ref={ref}
                className={cn(
                    calendarVariants({size}),
                    'p-3 isolate bg-base-100 rounded-lg border border-base-300 z-50',
                    className
                )}
                style={{
                    // Additional CSS-in-JS for maximum override strength
                    isolation: 'isolate',
                }}
            >
                <DayPicker
                    mode="single"
                    numberOfMonths={1}
                    selected={value}
                    onSelect={onSelect}
                    month={month}
                    onMonthChange={setMonth}
                    weekStartsOn={weekStartsOn}
                    showOutsideDays={true}
                    today={today}
                    hideNavigation={true}
                    components={{
                        MonthCaption: (props: any) => <CustomCaption {...props} fromYear={fromYear} toYear={toYear}/>,
                    }}
                    classNames={{
                        months: `${defaultClassNames.months}`,
                        month: `${defaultClassNames.month}`,
                        month_caption: `${defaultClassNames.month_caption}`,
                        caption_label: `${defaultClassNames.caption_label}`,
                        dropdown: `${defaultClassNames.dropdown}`,
                        month_grid: `${defaultClassNames.month_grid} w-full border-collapse`,
                        weekdays: `${defaultClassNames.weekdays}`,
                        weekday: `${defaultClassNames.weekday} text-center text-sm font-medium text-base-content/70`,
                        week: `${defaultClassNames.week}`,
                        day_button: `${defaultClassNames.day_button} btn-xs p-1`,
                        day: `${defaultClassNames.day} text-center hover:bg-base-300`,
                        range_end: `${defaultClassNames.range_end}`,
                        selected: `${defaultClassNames.selected} bg-primary/70 text-primary-content hover:bg-primary hover:text-primary-content`,
                        today: `${defaultClassNames.today} bg-accent/50 hover:bg-accent`,
                        outside: `${defaultClassNames.outside} text-base-content/30`,
                        disabled: `${defaultClassNames.disabled} text-base-content/20 cursor-not-allowed`,
                        range_middle: `${defaultClassNames.range_middle}`,
                        hidden: `${defaultClassNames.hidden} invisible`,
                    }}
                />
                {showTodayButton && (
                    <div className="flex justify-center mt-3">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleTodayClick}
                        >
                            Today
                        </Button>
                    </div>
                )}
            </div>
        )
    }
)

Calendar.displayName = 'Calendar'

export {Calendar, calendarVariants}
