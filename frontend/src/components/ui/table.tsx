import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

// Helper function to process multiple modifiers
const getModifierClasses = (modifiers?: string): string => {
    if (!modifiers || modifiers === 'default') return ''

    const modifierMap: Record<string, string> = {
        zebra: 'table-zebra',
        pinRows: 'table-pin-rows',
        pinCols: 'table-pin-cols',
    }

    return modifiers
        .split(' ')
        .map(modifier => modifier.trim())
        .filter(modifier => modifier && modifierMap[modifier])
        .map(modifier => modifierMap[modifier])
        .join(' ')
}

const tableVariants = cva(
    'table',
    {
        variants: {
            // DaisyUI table size variants (5 sizes)
            size: {
                xs: 'table-xs',
                sm: 'table-sm',
                md: 'table-md',
                lg: 'table-lg',
                xl: 'table-xl',
            },
            // Responsive behavior
            responsive: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
            responsive: true,
        },
        compoundVariants: [
            // When responsive is true, override size for small screens
            {
                responsive: true,
                size: 'md',
                class: 'table-xs sm:table-sm md:table-md',
            },
            {
                responsive: true,
                size: 'lg',
                class: 'table-xs sm:table-sm md:table-lg',
            },
            {
                responsive: true,
                size: 'xl',
                class: 'table-xs sm:table-sm md:table-xl',
            },
            // xs and sm sizes remain unchanged when responsive
            {
                responsive: true,
                size: 'xs',
                class: 'table-xs',
            },
            {
                responsive: true,
                size: 'sm',
                class: 'table-xs sm:table-sm',
            },
        ],
    }
)

const tableWrapperVariants = cva('overflow-x-auto')

const tableHeadVariants = cva('')

const tableBodyVariants = cva('')

const tableRowVariants = cva(
    '',
    {
        variants: {
            hover: {
                default: '',
                true: 'hover',
            },
            active: {
                default: '',
                true: 'active',
            },
        },
        defaultVariants: {
            hover: 'default',
            active: 'default',
        },
    }
)

const tableCellVariants = cva('')

const tableHeaderCellVariants = cva('')

type TableProps = React.TableHTMLAttributes<HTMLTableElement> &
    VariantProps<typeof tableVariants> & {
        modifier?: string
    }

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({className, size, modifier, responsive, ...props}, ref) => (
        <table
            ref={ref}
            className={cn(
                tableVariants({size, responsive}),
                getModifierClasses(modifier),
                className
            )}
            {...props}
        />
    )
)
Table.displayName = 'Table'

const TableWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({className, ...props}, ref) => (
        <div
            ref={ref}
            className={cn(tableWrapperVariants(), className)}
            {...props}
        />
    )
)
TableWrapper.displayName = 'TableWrapper'

const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({className, ...props}, ref) => (
        <thead
            ref={ref}
            className={cn(tableHeadVariants(), className)}
            {...props}
        />
    )
)
TableHead.displayName = 'TableHead'

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({className, ...props}, ref) => (
        <tbody
            ref={ref}
            className={cn(tableBodyVariants(), className)}
            {...props}
        />
    )
)
TableBody.displayName = 'TableBody'

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & VariantProps<typeof tableRowVariants>

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
    ({className, hover, active, ...props}, ref) => (
        <tr
            ref={ref}
            className={cn(tableRowVariants({hover, active}), className)}
            {...props}
        />
    )
)
TableRow.displayName = 'TableRow'

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({className, ...props}, ref) => (
        <td
            ref={ref}
            className={cn(tableCellVariants(), className)}
            {...props}
        />
    )
)
TableCell.displayName = 'TableCell'

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({className, ...props}, ref) => (
        <th
            ref={ref}
            className={cn(tableHeaderCellVariants(), className)}
            {...props}
        />
    )
)
TableHeaderCell.displayName = 'TableHeaderCell'

export {
    Table,
    TableWrapper,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableHeaderCell,
    tableVariants,
    tableWrapperVariants,
    tableRowVariants
}
