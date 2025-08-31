import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const breadcrumbsVariants = cva(
    'breadcrumbs',
    {
        variants: {
            // Size variants
            size: {
                xs: 'text-xs',
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
            },
        },
        defaultVariants: {
            size: 'sm',
        },
    }
)

export interface BreadcrumbItem {
    label: React.ReactNode
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    current?: boolean
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof breadcrumbsVariants> {
    items: BreadcrumbItem[]
    maxWidth?: string
}

/**
 * DaisyUI Breadcrumbs Component
 *
 * A navigation aid that shows users their current location within a site's hierarchy.
 * Supports icons, custom separators, and responsive scrolling for long paths.
 */
function Breadcrumbs({
    className,
    size,
    items,
    maxWidth,
    ...props
}: BreadcrumbsProps) {
    const breadcrumbsClasses = cn(
        breadcrumbsVariants({size}),
        maxWidth && `max-w-${maxWidth}`,
        className
    )

    return (
        <div className={breadcrumbsClasses} {...props}>
            <ul>
                {items.map((item, index) => {
                    const Icon = item.icon

                    return (
                        <li key={index}>
                            {item.href && !item.current ? (
                                <a href={item.href} className="inline-flex items-center gap-2">
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

/**
 * Simple Breadcrumbs Component
 *
 * A simplified version that accepts children directly for more flexibility.
 */
function SimpleBreadcrumbs({
    className,
    size,
    maxWidth,
    children,
    ...props
}: Omit<BreadcrumbsProps, 'items'> & { children: React.ReactNode }) {
    const breadcrumbsClasses = cn(
        breadcrumbsVariants({size}),
        maxWidth && `max-w-${maxWidth}`,
        className
    )

    return (
        <div className={breadcrumbsClasses} {...props}>
            <ul>
                {children}
            </ul>
        </div>
    )
}

/**
 * Breadcrumb Item Component
 *
 * Individual breadcrumb item for use with SimpleBreadcrumbs.
 */
function BreadcrumbItem({
    href,
    icon: Icon,
    current = false,
    children,
    className,
    ...props
}: {
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    current?: boolean
    children: React.ReactNode
    className?: string
} & React.HTMLAttributes<HTMLLIElement>) {
    return (
        <li className={className} {...props}>
            {href && !current ? (
                <a href={href} className="inline-flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {children}
                </a>
            ) : (
                <span className="inline-flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {children}
                </span>
            )}
        </li>
    )
}

export {Breadcrumbs, SimpleBreadcrumbs, BreadcrumbItem, breadcrumbsVariants}
