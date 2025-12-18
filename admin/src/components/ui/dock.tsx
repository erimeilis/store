import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dockVariants = cva(
    'dock',
    {
        variants: {
            // Position variants
            position: {
                top: 'dock-top',
                bottom: 'dock-bottom',
                left: 'dock-left',
                right: 'dock-right',
            },
            // Size variants
            size: {
                sm: 'dock-sm',
                md: 'dock-md',
                lg: 'dock-lg',
            },
            // Background variants
            background: {
                default: '',
                neutral: 'bg-neutral text-neutral-content',
                base100: 'bg-base-100',
                base200: 'bg-base-200',
                base300: 'bg-base-300',
                primary: 'bg-primary text-primary-content',
                secondary: 'bg-secondary text-secondary-content',
                accent: 'bg-accent text-accent-content',
            },
            // Shadow variants
            shadow: {
                none: '',
                sm: 'shadow-sm',
                md: 'shadow-md',
                lg: 'shadow-lg',
                xl: 'shadow-xl',
            },
            // Rounded variants
            rounded: {
                none: '',
                sm: 'rounded',
                md: 'rounded-lg',
                lg: 'rounded-xl',
                full: 'rounded-full',
            },
        },
        defaultVariants: {
            position: 'bottom',
            size: 'md',
            background: 'base200',
            shadow: 'lg',
            rounded: 'lg',
        },
    }
)

const dockItemVariants = cva(
    'dock-item',
    {
        variants: {
            // State variants
            state: {
                default: '',
                active: 'dock-item-active',
                disabled: 'dock-item-disabled',
            },
            // Size variants
            size: {
                sm: 'w-8 h-8',
                md: 'w-12 h-12',
                lg: 'w-16 h-16',
            },
        },
        defaultVariants: {
            state: 'default',
            size: 'md',
        },
    }
)

export interface DockItem {
    /**
     * Unique identifier for the dock item
     */
    id: string
    /**
     * Item label (for tooltips or accessibility)
     */
    label: string
    /**
     * Item icon or content
     */
    icon: React.ReactNode
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
    itemProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export interface DockProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof dockVariants> {
    /**
     * Dock items
     */
    items: DockItem[]
    /**
     * Current active item ID
     */
    activeItem?: string
    /**
     * Callback fired when an item is clicked
     */
    onItemClick?: (itemId: string, item: DockItem) => void
    /**
     * Whether to show labels as tooltips
     * @default true
     */
    showTooltips?: boolean
    /**
     * Whether items should have hover effects
     * @default true
     */
    hoverEffects?: boolean
    /**
     * Custom item size (overrides size variant for items)
     */
    itemSize?: VariantProps<typeof dockItemVariants>['size']
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Dock component for creating macOS-style docks and floating toolbars.
 *
 * Based on DaisyUI's dock utility with support for different positions,
 * sizes, backgrounds, and interactive states. Perfect for navigation bars,
 * floating action buttons, and quick access toolbars.
 *
 * @example
 * ```tsx
 * const dockItems = [
 *   {
 *     id: 'home',
 *     label: 'Home',
 *     icon: <HomeIcon />,
 *     active: true
 *   },
 *   {
 *     id: 'settings',
 *     label: 'Settings',
 *     icon: <SettingsIcon />
 *   },
 *   {
 *     id: 'profile',
 *     label: 'Profile',
 *     icon: <UserIcon />
 *   }
 * ]
 *
 * <Dock
 *   items={dockItems}
 *   position="bottom"
 *   background="neutral"
 *   onItemClick={(id) => navigate(id)}
 * />
 * ```
 */
function Dock({
    className,
    position,
    size,
    background,
    shadow,
    rounded,
    items,
    activeItem,
    onItemClick,
    showTooltips = true,
    hoverEffects = true,
    itemSize,
    asChild = false,
    ...props
}: DockProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(
                'fixed z-50 flex items-center justify-center gap-2 p-2',
                position === 'top' && 'top-4 left-1/2 -translate-x-1/2',
                position === 'bottom' && 'bottom-4 left-1/2 -translate-x-1/2',
                position === 'left' && 'left-4 top-1/2 -translate-y-1/2 flex-col',
                position === 'right' && 'right-4 top-1/2 -translate-y-1/2 flex-col',
                dockVariants({ position, size, background, shadow, rounded }),
                className
            )}
            role="toolbar"
            {...props}
        >
            {items.map((item) => {
                const isActive = activeItem === item.id || item.active

                return (
                    <div key={item.id} className="relative group">
                        <button
                            type="button"
                            disabled={item.disabled}
                            className={cn(
                                'inline-flex items-center justify-center rounded-lg transition-all duration-200',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                dockItemVariants({
                                    state: item.disabled ? 'disabled' : isActive ? 'active' : 'default',
                                    size: itemSize || size
                                }),
                                hoverEffects && !item.disabled && 'hover:scale-110 hover:bg-base-300/50',
                                isActive && 'bg-primary text-primary-content scale-105',
                                item.disabled && 'opacity-50 cursor-not-allowed',
                                item.itemProps?.className
                            )}
                            onClick={() => {
                                if (!item.disabled) {
                                    item.onClick?.()
                                    onItemClick?.(item.id, item)
                                }
                            }}
                            aria-label={item.label}
                            title={!showTooltips ? item.label : undefined}
                            {...item.itemProps}
                        >
                            {React.isValidElement(item.icon) ? (
                                React.cloneElement(item.icon as React.ReactElement<{className?: string}>, {
                                    className: cn('w-6 h-6', (item.icon as React.ReactElement<{className?: string}>).props?.className),
                                })
                            ) : (
                                item.icon
                            )}
                        </button>

                        {/* Tooltip */}
                        {showTooltips && (
                            <div className={cn(
                                'absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 pointer-events-none',
                                'group-hover:opacity-100 transition-opacity duration-200',
                                position === 'top' && 'top-full mt-2 left-1/2 -translate-x-1/2',
                                position === 'bottom' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
                                position === 'left' && 'left-full ml-2 top-1/2 -translate-y-1/2',
                                position === 'right' && 'right-full mr-2 top-1/2 -translate-y-1/2'
                            )}>
                                {item.label}
                                <div className={cn(
                                    'absolute w-1 h-1 bg-gray-900 rotate-45',
                                    position === 'top' && '-top-0.5 left-1/2 -translate-x-1/2',
                                    position === 'bottom' && '-bottom-0.5 left-1/2 -translate-x-1/2',
                                    position === 'left' && '-left-0.5 top-1/2 -translate-y-1/2',
                                    position === 'right' && '-right-0.5 top-1/2 -translate-y-1/2'
                                )}></div>
                            </div>
                        )}
                    </div>
                )
            })}
        </Comp>
    )
}

/**
 * DockItem component for individual dock items when building custom docks.
 *
 * @example
 * ```tsx
 * <div className="dock dock-bottom">
 *   <DockItem
 *     icon={<HomeIcon />}
 *     label="Home"
 *     active
 *     onClick={() => navigate('/')}
 *   />
 *   <DockItem
 *     icon={<SettingsIcon />}
 *     label="Settings"
 *     onClick={() => navigate('/settings')}
 *   />
 * </div>
 * ```
 */
export interface DockItemProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
        VariantProps<typeof dockItemVariants> {
    /**
     * Item icon or content
     */
    icon: React.ReactNode
    /**
     * Item label
     */
    label: string
    /**
     * Whether the item is active
     */
    active?: boolean
    /**
     * Whether to show tooltip
     */
    showTooltip?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function DockItem({
    className,
    size = 'md',
    icon,
    label,
    active = false,
    disabled = false,
    showTooltip = false,
    asChild = false,
    ...props
}: DockItemProps) {
    const Comp = asChild ? Slot : 'button'
    const effectiveState = disabled ? 'disabled' : active ? 'active' : 'default'

    return (
        <div className="relative group">
            <Comp
                type="button"
                disabled={disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'hover:scale-110 hover:bg-base-300/50',
                    dockItemVariants({ state: effectiveState, size }),
                    active && 'bg-primary text-primary-content scale-105',
                    disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
                    className
                )}
                aria-label={label}
                title={!showTooltip ? label : undefined}
                {...props}
            >
                {React.isValidElement(icon) ? (
                    React.cloneElement(icon as React.ReactElement<{className?: string}>, {
                        className: cn('w-6 h-6', (icon as React.ReactElement<{className?: string}>).props?.className),
                    })
                ) : (
                    icon
                )}
            </Comp>

            {showTooltip && (
                <div className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-2 left-1/2 -translate-x-1/2">
                    {label}
                    <div className="absolute w-1 h-1 bg-gray-900 rotate-45 -bottom-0.5 left-1/2 -translate-x-1/2"></div>
                </div>
            )}
        </div>
    )
}

export { Dock, DockItem, dockVariants, dockItemVariants }
