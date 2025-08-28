import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

// Simple type casting for popover API properties (experimental)

const dropdownVariants = cva(
    'dropdown',
    {
        variants: {
            // Position variants
            position: {
                bottom: 'dropdown-bottom',
                top: 'dropdown-top',
                left: 'dropdown-left',
                right: 'dropdown-right',
            },
            // Alignment variants
            align: {
                start: 'dropdown-start',
                center: 'dropdown-center',
                end: 'dropdown-end',
            },
            // Behavior variants
            behavior: {
                default: '',
                hover: 'dropdown-hover',
                open: 'dropdown-open',
            },
        },
        defaultVariants: {
            position: 'bottom',
            align: 'start',
            behavior: 'default',
        },
    }
)

const dropdownContentVariants = cva(
    'dropdown-content',
    {
        variants: {
            // Content type variants
            type: {
                menu: 'menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow',
                card: 'card card-compact bg-base-100 z-[1] shadow',
                custom: '',
            },
        },
        defaultVariants: {
            type: 'menu',
        },
    }
)

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {
    children: React.ReactNode
}

export interface DropdownTriggerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode
    asChild?: boolean
}

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownContentVariants> {
    children: React.ReactNode
}

export interface DropdownDetailsProps extends React.DetailsHTMLAttributes<HTMLDetailsElement>,
    VariantProps<typeof dropdownVariants> {
    summary: React.ReactNode
    children: React.ReactNode
}

export interface DropdownPopoverProps extends VariantProps<typeof dropdownVariants> {
    id: string
    trigger: React.ReactNode
    children: React.ReactNode
    anchorName?: string
    className?: string
    contentClassName?: string
}

/**
 * DaisyUI Dropdown Container Component
 *
 * Base dropdown container for CSS focus-based dropdowns.
 * Uses tabindex for focus management.
 */
function Dropdown({
    className,
    position,
    align,
    behavior,
    children,
    ...props
}: DropdownProps) {
    return (
        <div
            className={cn(dropdownVariants({position, align, behavior}), className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * DaisyUI Dropdown Trigger Component
 *
 * Trigger button for dropdown with proper accessibility attributes.
 */
function DropdownTrigger({
    className,
    children,
    asChild = false,
    ...props
}: DropdownTriggerProps) {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{className?: string}>, {
            tabIndex: 0,
            role: 'button',
            className: cn((children as React.ReactElement<{className?: string}>).props?.className, className),
            ...props,
        })
    }

    return (
        <div
            tabIndex={0}
            role="button"
            className={cn('btn', className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * DaisyUI Dropdown Content Component
 *
 * Content container for dropdown items with proper focus management.
 */
function DropdownContent({
    className,
    type,
    children,
    ...props
}: DropdownContentProps) {
    return (
        <div
            tabIndex={0}
            className={cn(dropdownContentVariants({type}), className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * DaisyUI Dropdown Details Component
 *
 * Dropdown using native HTML details/summary elements.
 * Provides built-in show/hide functionality without JavaScript.
 */
function DropdownDetails({
    className,
    position,
    align,
    behavior,
    summary,
    children,
    ...props
}: DropdownDetailsProps) {
    return (
        <details
            className={cn(dropdownVariants({position, align, behavior}), className)}
            {...props}
        >
            <summary className="btn">
                {summary}
            </summary>
            <div className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                {children}
            </div>
        </details>
    )
}

/**
 * DaisyUI Dropdown Popover Component
 *
 * Modern dropdown using the Popover API with CSS Anchor Positioning.
 * Provides top-layer rendering without z-index issues.
 */
function DropdownPopover({
    className,
    position,
    align,
    behavior,
    id,
    trigger,
    children,
    anchorName,
    contentClassName,
    ...props
}: DropdownPopoverProps) {
    const anchor = anchorName || `--anchor-${id}`

    return (
        <>
            <button
                className={cn(dropdownVariants({position, align, behavior}), 'btn', className)}
                style={{ anchorName: anchor } as React.CSSProperties}
                // @ts-ignore - popoverTarget is experimental
                popoverTarget={id}
                {...props}
            >
                {trigger}
            </button>
            <div
                id={id}
                className={cn('dropdown menu w-52 rounded-box bg-base-100 shadow', contentClassName)}
                style={{ positionAnchor: anchor } as React.CSSProperties}
                // @ts-ignore - popover is experimental
                popover="auto"
            >
                {children}
            </div>
        </>
    )
}

/**
 * Simple Dropdown Menu Item Component
 *
 * Individual menu item for dropdown content.
 */
function DropdownItem({
    className,
    children,
    onClick,
    ...props
}: React.HTMLAttributes<HTMLLIElement>) {
    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
        // Close dropdown by blurring active element
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur()
        }
        onClick?.(event)
    }

    return (
        <li className={className} onClick={handleClick} {...props}>
            {typeof children === 'string' ? <a>{children}</a> : children}
        </li>
    )
}

/**
 * Dropdown Menu Component
 *
 * Pre-configured dropdown with menu styling.
 */
function DropdownMenu({
    trigger,
    items,
    position,
    align,
    behavior,
    className,
    onItemClick,
}: {
    trigger: React.ReactNode
    items: Array<{
        label: React.ReactNode
        onClick?: () => void
        href?: string
        disabled?: boolean
    }>
    position?: VariantProps<typeof dropdownVariants>['position']
    align?: VariantProps<typeof dropdownVariants>['align']
    behavior?: VariantProps<typeof dropdownVariants>['behavior']
    className?: string
    onItemClick?: (index: number) => void
}) {
    return (
        <Dropdown position={position} align={align} behavior={behavior} className={className}>
            <DropdownTrigger>
                {trigger}
            </DropdownTrigger>
            <DropdownContent>
                {items.map((item, index) => (
                    <DropdownItem
                        key={index}
                        onClick={() => {
                            item.onClick?.()
                            onItemClick?.(index)
                        }}
                    >
                        {item.href ? (
                            <a href={item.href} className={item.disabled ? 'disabled' : ''}>
                                {item.label}
                            </a>
                        ) : (
                            <button disabled={item.disabled}>
                                {item.label}
                            </button>
                        )}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </Dropdown>
    )
}

export {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownDetails,
    DropdownPopover,
    DropdownItem,
    DropdownMenu,
    dropdownVariants,
    dropdownContentVariants
}
