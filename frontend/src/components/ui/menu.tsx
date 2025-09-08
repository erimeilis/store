import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

// Hook for prefetching pages
function usePrefetch() {
    const prefetchedUrls = React.useRef(new Set<string>())

    const prefetch = React.useCallback((url: string) => {
        if (prefetchedUrls.current.has(url)) return

        // Create prefetch link element
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.as = 'document'
        
        // Add to document head
        document.head.appendChild(link)
        prefetchedUrls.current.add(url)
        
        // Clean up after some time to prevent memory leaks
        setTimeout(() => {
            if (document.head.contains(link)) {
                document.head.removeChild(link)
            }
            prefetchedUrls.current.delete(url)
        }, 60000) // Remove after 1 minute
    }, [])

    return { prefetch }
}

const menuVariants = cva(
    'menu',
    {
        variants: {
            // Size variants
            size: {
                xs: 'menu-xs',
                sm: 'menu-sm',
                md: 'menu-md',
                lg: 'menu-lg',
                xl: 'menu-xl',
            },
            // Direction variants
            direction: {
                vertical: '',
                horizontal: 'menu-horizontal',
            },
        },
        defaultVariants: {
            size: 'md',
            direction: 'vertical',
        },
    }
)

const menuItemVariants = cva(
    '',
    {
        variants: {
            // State variants
            active: {
                false: '',
                true: 'active',
            },
            // Disabled variants
            disabled: {
                false: '',
                true: 'disabled',
            },
            // Focus variants
            focus: {
                false: '',
                true: 'focus',
            },
        },
        defaultVariants: {
            active: false,
            disabled: false,
            focus: false,
        },
    }
)

export interface MenuProps extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof menuVariants> {
    children: React.ReactNode
}

export interface MenuItemProps extends React.LiHTMLAttributes<HTMLLIElement>,
    VariantProps<typeof menuItemVariants> {
    children: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    href?: string
    onClick?: () => void
    prefetch?: boolean
}

export interface MenuTitleProps extends React.HTMLAttributes<HTMLLIElement> {
    children: React.ReactNode
}

export interface MenuDetailsProps extends React.DetailsHTMLAttributes<HTMLDetailsElement> {
    summary: React.ReactNode
    children: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    summaryClassName?: string
}

export interface NavigationMenuProps extends MenuProps {
    items: Array<{
        label: React.ReactNode
        href?: string
        onClick?: () => void
        icon?: React.ComponentType<{ className?: string }>
        active?: boolean
        disabled?: boolean
        children?: Array<{
            label: React.ReactNode
            href?: string
            onClick?: () => void
            active?: boolean
            disabled?: boolean
        }>
    }>
}

/**
 * DaisyUI Menu Component
 *
 * A flexible navigation menu component that supports hierarchical structure,
 * horizontal/vertical layout, icons, and various interactive states.
 */
function Menu({
    className,
    size,
    direction,
    children,
    ...props
}: MenuProps) {
    return (
        <ul
            className={cn(menuVariants({size, direction}), className)}
            {...props}
        >
            {children}
        </ul>
    )
}

/**
 * DaisyUI Menu Item Component
 *
 * Individual menu item with support for links, click handlers, icons, and states.
 */
function MenuItem({
    className,
    active,
    disabled,
    focus,
    children,
    icon: Icon,
    href,
    onClick,
    prefetch = true, // Enable prefetch by default
    ...props
}: MenuItemProps) {
    const itemClasses = cn(menuItemVariants({active, disabled, focus}), className)
    const { prefetch: prefetchUrl } = usePrefetch()

    const handleClick = (event: React.MouseEvent) => {
        if (disabled) {
            event.preventDefault()
            return
        }
        onClick?.()
    }

    const handleMouseEnter = React.useCallback(() => {
        if (href && prefetch && !disabled) {
            prefetchUrl(href)
        }
    }, [href, prefetch, disabled, prefetchUrl])

    const content = (
        <>
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </>
    )

    return (
        <li className={itemClasses} {...props}>
            {href ? (
                <a 
                    href={href} 
                    onClick={handleClick} 
                    onMouseEnter={handleMouseEnter}
                    className={cn('whitespace-nowrap', disabled ? 'pointer-events-none opacity-50' : '')}
                >
                    {content}
                </a>
            ) : (
                <button onClick={handleClick} disabled={disabled ?? undefined} className="w-full text-left whitespace-nowrap">
                    {content}
                </button>
            )}
        </li>
    )
}

/**
 * DaisyUI Menu Title Component
 *
 * Title/header for menu sections to group related items.
 */
function MenuTitle({
    className,
    children,
    ...props
}: MenuTitleProps) {
    return (
        <li className={cn('menu-title', className)} {...props}>
            <span>{children}</span>
        </li>
    )
}

/**
 * DaisyUI Menu Details Component
 *
 * Collapsible menu section using native HTML details/summary elements.
 * Useful for nested navigation or grouped menu items.
 */
function MenuDetails({
    className,
    summary,
    children,
    icon: Icon,
    summaryClassName,
    ...props
}: MenuDetailsProps) {
    return (
        <li>
            <details className={className} {...props}>
                <summary className={cn('flex items-center gap-2', summaryClassName)}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {summary}
                </summary>
                <ul>
                    {children}
                </ul>
            </details>
        </li>
    )
}

/**
 * Navigation Menu Component
 *
 * Pre-configured menu with items array for quick setup.
 */
function NavigationMenu({
    className,
    size,
    direction,
    items,
    ...props
}: NavigationMenuProps) {
    return (
        <Menu size={size} direction={direction} className={className} {...props}>
            {items.map((item, index) => {
                if (item.children && item.children.length > 0) {
                    return (
                        <MenuDetails
                            key={index}
                            summary={item.label}
                            icon={item.icon}
                        >
                            {item.children.map((childItem, childIndex) => (
                                <MenuItem
                                    key={childIndex}
                                    href={childItem.href}
                                    onClick={childItem.onClick}
                                    active={childItem.active}
                                    disabled={childItem.disabled}
                                >
                                    {childItem.label}
                                </MenuItem>
                            ))}
                        </MenuDetails>
                    )
                }

                return (
                    <MenuItem
                        key={index}
                        href={item.href}
                        onClick={item.onClick}
                        icon={item.icon}
                        active={item.active}
                        disabled={item.disabled}
                    >
                        {item.label}
                    </MenuItem>
                )
            })}
        </Menu>
    )
}

/**
 * Horizontal Menu Component
 *
 * Pre-configured horizontal menu for navigation bars.
 */
function HorizontalMenu({
    size,
    children,
    className,
    ...props
}: Omit<MenuProps, 'direction'>) {
    return (
        <Menu
            direction="horizontal"
            size={size}
            className={className}
            {...props}
        >
            {children}
        </Menu>
    )
}

/**
 * Sidebar Menu Component
 *
 * Pre-configured vertical menu optimized for sidebars.
 */
function SidebarMenu({
    size,
    children,
    className,
    ...props
}: Omit<MenuProps, 'direction'>) {
    return (
        <Menu
            direction="vertical"
            size={size}
            className={cn('bg-base-200 rounded-box', className)}
            {...props}
        >
            {children}
        </Menu>
    )
}

/**
 * Breadcrumb Menu Component
 *
 * Menu configured for breadcrumb navigation.
 */
function BreadcrumbMenu({
    items,
    size = 'sm',
    className,
    separator = '/',
    ...props
}: {
    items: Array<{
        label: React.ReactNode
        href?: string
        active?: boolean
    }>
    size?: VariantProps<typeof menuVariants>['size']
    className?: string
    separator?: string
} & Omit<MenuProps, 'size' | 'direction' | 'children'>) {
    return (
        <div className="text-sm breadcrumbs">
            <HorizontalMenu size={size} className={cn('p-0', className)} {...props}>
                {items.map((item, index) => (
                    <MenuItem
                        key={index}
                        href={item.active ? undefined : item.href}
                        active={item.active}
                        className="px-1"
                    >
                        <span className="flex items-center gap-2">
                            {item.label}
                            {index < items.length - 1 && (
                                <span className="opacity-50">{separator}</span>
                            )}
                        </span>
                    </MenuItem>
                ))}
            </HorizontalMenu>
        </div>
    )
}

export {
    Menu,
    MenuItem,
    MenuTitle,
    MenuDetails,
    NavigationMenu,
    HorizontalMenu,
    SidebarMenu,
    BreadcrumbMenu,
    menuVariants,
    menuItemVariants
}
