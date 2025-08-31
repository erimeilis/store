import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const listVariants = cva(
    'menu',
    {
        variants: {
            // Direction variants
            direction: {
                vertical: '',
                horizontal: 'menu-horizontal',
            },
            // Size variants
            size: {
                xs: 'menu-xs',
                sm: 'menu-sm',
                md: 'menu-md',
                lg: 'menu-lg',
            },
            // Background variants
            background: {
                none: '',
                base100: 'bg-base-100',
                base200: 'bg-base-200',
                base300: 'bg-base-300',
                rounded: 'bg-base-200 rounded-box',
            },
            // Padding variants
            padding: {
                none: 'p-0',
                sm: 'p-2',
                md: 'p-4',
                lg: 'p-6',
            },
        },
        defaultVariants: {
            direction: 'vertical',
            size: 'md',
            background: 'none',
            padding: 'md',
        },
    }
)

const listItemVariants = cva(
    '',
    {
        variants: {
            // State variants
            state: {
                default: '',
                active: 'active',
                disabled: 'disabled',
            },
            // Style variants
            style: {
                default: '',
                bordered: 'bordered',
                hover: 'hover:bg-base-200',
            },
        },
        defaultVariants: {
            state: 'default',
            style: 'default',
        },
    }
)

export interface ListItem {
    /**
     * Unique identifier for the item
     */
    id: string
    /**
     * Item content
     */
    content: React.ReactNode
    /**
     * Item subtitle or description
     */
    subtitle?: React.ReactNode
    /**
     * Leading icon or element
     */
    leading?: React.ReactNode
    /**
     * Trailing icon or element
     */
    trailing?: React.ReactNode
    /**
     * Whether the item is active
     */
    active?: boolean
    /**
     * Whether the item is disabled
     */
    disabled?: boolean
    /**
     * Click handler
     */
    onClick?: () => void
    /**
     * Custom item props
     */
    itemProps?: React.LiHTMLAttributes<HTMLLIElement>
}

export interface ListProps
    extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onClick'>,
        VariantProps<typeof listVariants> {
    /**
     * Array of list items
     */
    items?: ListItem[]
    /**
     * List content as children (alternative to items prop)
     */
    children?: React.ReactNode
    /**
     * Whether items are selectable
     * @default false
     */
    selectable?: boolean
    /**
     * Currently selected item ID (for controlled mode)
     */
    selectedId?: string
    /**
     * Default selected item ID (for uncontrolled mode)
     */
    defaultSelectedId?: string
    /**
     * Callback fired when an item is selected
     */
    onSelectionChange?: (itemId: string) => void
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * List component for displaying structured data and navigation items.
 *
 * Based on DaisyUI's menu component with support for different orientations,
 * sizes, backgrounds, and interactive states. Perfect for navigation menus,
 * data lists, and structured content display.
 *
 * @example
 * ```tsx
 * const listItems = [
 *   {
 *     id: '1',
 *     content: 'Mobile Plan - Unlimited',
 *     subtitle: '$45/month',
 *     leading: <PhoneIcon />,
 *     trailing: <ChevronRightIcon />
 *   },
 *   {
 *     id: '2',
 *     content: 'Internet Package - Fiber',
 *     subtitle: '$65/month',
 *     leading: <WifiIcon />,
 *     trailing: <ChevronRightIcon />
 *   }
 * ]
 *
 * <List
 *   items={listItems}
 *   background="rounded"
 *   selectable
 *   onSelectionChange={handleSelection}
 * />
 * ```
 */
function List({
    className,
    direction,
    size,
    background,
    padding,
    items = [],
    children,
    selectable = false,
    selectedId,
    defaultSelectedId,
    onSelectionChange,
    asChild = false,
    ...props
}: ListProps) {
    const [internalSelectedId, setInternalSelectedId] = React.useState(defaultSelectedId)
    const isControlled = selectedId !== undefined
    const currentSelectedId = isControlled ? selectedId : internalSelectedId

    const handleItemClick = (itemId: string, onClick?: () => void) => {
        if (selectable) {
            if (isControlled) {
                onSelectionChange?.(itemId)
            } else {
                setInternalSelectedId(itemId)
                onSelectionChange?.(itemId)
            }
        }
        onClick?.()
    }

    const Comp = asChild ? Slot : 'ul'

    return (
        <Comp
            className={cn(listVariants({ direction, size, background, padding }), className)}
            {...props}
        >
            {children || items.map((item) => (
                <ListItem
                    key={item.id}
                    item={item}
                    isSelected={selectable && currentSelectedId === item.id}
                    onClick={() => handleItemClick(item.id, item.onClick)}
                />
            ))}
        </Comp>
    )
}

/**
 * Individual ListItem component.
 *
 * @example
 * ```tsx
 * <ListItem
 *   item={{
 *     id: '1',
 *     content: 'Settings',
 *     leading: <SettingsIcon />,
 *     trailing: <ChevronRightIcon />
 *   }}
 *   onClick={() => navigate('/settings')}
 * />
 * ```
 */
export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
    /**
     * Item data
     */
    item: ListItem
    /**
     * Whether the item is selected
     */
    isSelected?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function ListItem({
    className,
    item,
    isSelected = false,
    onClick,
    asChild = false,
    ...props
}: ListItemProps) {
    const Comp = asChild ? Slot : 'li'

    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
        if (!item.disabled) {
            onClick?.(event)
        }
    }

    return (
        <Comp
            className={cn(
                listItemVariants({
                    state: item.disabled ? 'disabled' : isSelected || item.active ? 'active' : 'default',
                    style: onClick && !item.disabled ? 'hover' : 'default'
                }),
                className
            )}
            onClick={handleClick}
            {...props}
            {...item.itemProps}
        >
            <a className={cn(
                'flex items-center gap-3 w-full',
                item.disabled && 'opacity-50 cursor-not-allowed',
                (onClick && !item.disabled) && 'cursor-pointer'
            )}>
                {/* Leading element */}
                {item.leading && (
                    <div className="flex-shrink-0">
                        {item.leading}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1">
                    <div className="font-medium">
                        {item.content}
                    </div>
                    {item.subtitle && (
                        <div className="text-sm opacity-70">
                            {item.subtitle}
                        </div>
                    )}
                </div>

                {/* Trailing element */}
                {item.trailing && (
                    <div className="flex-shrink-0">
                        {item.trailing}
                    </div>
                )}
            </a>
        </Comp>
    )
}

/**
 * SimpleList component for basic list layouts.
 *
 * @example
 * ```tsx
 * <SimpleList
 *   title="Services"
 *   items={[
 *     'Mobile Plans',
 *     'Internet Service',
 *     'Business Solutions'
 *   ]}
 * />
 * ```
 */
export interface SimpleListProps extends VariantProps<typeof listVariants> {
    /**
     * List title
     */
    title?: string
    /**
     * Simple array of items (strings or ReactNodes)
     */
    items: Array<React.ReactNode>
    /**
     * Whether items should be clickable
     */
    clickable?: boolean
    /**
     * Callback fired when an item is clicked
     */
    onItemClick?: (index: number, item: React.ReactNode) => void
    /**
     * Additional CSS classes
     */
    className?: string
}

function SimpleList({
    title,
    items,
    clickable = false,
    onItemClick,
    ...props
}: SimpleListProps) {
    const listItems: ListItem[] = items.map((item, index) => ({
        id: index.toString(),
        content: item,
        onClick: clickable ? () => onItemClick?.(index, item) : undefined,
    }))

    return (
        <div>
            {title && (
                <div className="text-lg font-semibold mb-2 px-4">
                    {title}
                </div>
            )}
            <List items={listItems} {...props} />
        </div>
    )
}

/**
 * NavigationList component for navigation menus.
 *
 * @example
 * ```tsx
 * <NavigationList
 *   items={[
 *     { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
 *     { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
 *     { label: 'Profile', href: '/profile', icon: <UserIcon /> }
 *   ]}
 *   currentPath="/dashboard"
 * />
 * ```
 */
export interface NavigationItem {
    /**
     * Navigation label
     */
    label: React.ReactNode
    /**
     * Navigation href
     */
    href?: string
    /**
     * Navigation icon
     */
    icon?: React.ReactNode
    /**
     * Whether the item is disabled
     */
    disabled?: boolean
    /**
     * Click handler (alternative to href)
     */
    onClick?: () => void
    /**
     * Badge or count to display
     */
    badge?: React.ReactNode
}

export interface NavigationListProps extends Omit<ListProps, 'items'> {
    /**
     * Array of navigation items
     */
    items: NavigationItem[]
    /**
     * Current path for highlighting active item
     */
    currentPath?: string
    /**
     * Whether to show icons
     * @default true
     */
    showIcons?: boolean
    /**
     * Whether to show badges
     * @default true
     */
    showBadges?: boolean
}

function NavigationList({
    items,
    currentPath,
    showIcons = true,
    showBadges = true,
    ...props
}: NavigationListProps) {
    const listItems: ListItem[] = items.map((item, index) => ({
        id: index.toString(),
        content: item.label,
        leading: showIcons && item.icon ? item.icon : undefined,
        trailing: showBadges && item.badge ? (
            <div className="badge badge-sm">
                {item.badge}
            </div>
        ) : undefined,
        active: currentPath === item.href,
        disabled: item.disabled,
        onClick: item.onClick,
    }))

    return <List items={listItems} {...props} />
}

/**
 * DataList component for displaying structured data.
 *
 * @example
 * ```tsx
 * <DataList
 *   data={[
 *     { label: 'Account Number', value: '1234567890' },
 *     { label: 'Monthly Usage', value: '15.2 GB' },
 *     { label: 'Next Bill Date', value: 'Jan 15, 2024' }
 *   ]}
 *   title="Account Information"
 * />
 * ```
 */
export interface DataItem {
    /**
     * Data label
     */
    label: React.ReactNode
    /**
     * Data value
     */
    value: React.ReactNode
    /**
     * Optional description
     */
    description?: React.ReactNode
    /**
     * Optional icon
     */
    icon?: React.ReactNode
    /**
     * Custom styling for the value
     */
    valueClassName?: string
}

export interface DataListProps extends VariantProps<typeof listVariants> {
    /**
     * Array of data items
     */
    data: DataItem[]
    /**
     * List title
     */
    title?: string
    /**
     * Whether to show icons
     * @default false
     */
    showIcons?: boolean
    /**
     * Additional CSS classes
     */
    className?: string
}

function DataList({
    data,
    title,
    showIcons = false,
    ...props
}: DataListProps) {
    const listItems: ListItem[] = data.map((item, index) => ({
        id: index.toString(),
        content: (
            <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                    <div className="font-medium text-sm opacity-70">
                        {item.label}
                    </div>
                    {item.description && (
                        <div className="text-xs opacity-50 mt-1">
                            {item.description}
                        </div>
                    )}
                </div>
                <div className={cn('font-semibold text-right', item.valueClassName)}>
                    {item.value}
                </div>
            </div>
        ),
        leading: showIcons && item.icon ? item.icon : undefined,
    }))

    return (
        <div>
            {title && (
                <div className="text-lg font-semibold mb-2 px-4">
                    {title}
                </div>
            )}
            <List items={listItems} background="base200" {...props} />
        </div>
    )
}

export {
    List,
    ListItem,
    SimpleList,
    NavigationList,
    DataList,
    listVariants,
    listItemVariants
}
