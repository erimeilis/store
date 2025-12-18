import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const drawerVariants = cva(
    'drawer',
    {
        variants: {
            // Position variants
            side: {
                left: '',
                right: 'drawer-end',
            },
            // Mobile behavior variants
            mobile: {
                default: '',
                open: 'drawer-mobile',
            },
        },
        defaultVariants: {
            side: 'left',
            mobile: 'default',
        },
    }
)

const drawerSideVariants = cva(
    'drawer-side',
    {
        variants: {
            // Overlay variants
            overlay: {
                default: '',
                dark: 'z-20',
            },
        },
        defaultVariants: {
            overlay: 'default',
        },
    }
)

export interface DrawerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'side'>,
        VariantProps<typeof drawerVariants> {
    /**
     * The main content area of the drawer
     */
    children: React.ReactNode
    /**
     * The sidebar content
     */
    sidebarContent: React.ReactNode
    /**
     * Whether the drawer is open
     */
    open?: boolean
    /**
     * Callback fired when the drawer open state changes
     */
    onOpenChange?: (open: boolean) => void
    /**
     * Custom sidebar props
     */
    sidebarProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Custom content props
     */
    contentProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Custom overlay props
     */
    overlayProps?: React.HTMLAttributes<HTMLLabelElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
    /**
     * Drawer toggle input id (for label association)
     */
    toggleId?: string
}

/**
 * Drawer component for creating sliding side panels and mobile navigation.
 *
 * Based on DaisyUI's drawer component with support for left/right positioning,
 * mobile behavior, and overlay customization. Perfect for navigation menus,
 * filters, and mobile-first responsive layouts.
 *
 * @example
 * ```tsx
 * <Drawer
 *   sidebarContent={<Navigation />}
 *   side="left"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * >
 *   <main>Main content goes here</main>
 * </Drawer>
 * ```
 */
function Drawer({
    className,
    side,
    mobile,
    children,
    sidebarContent,
    open = false,
    onOpenChange,
    sidebarProps,
    contentProps,
    overlayProps,
    asChild = false,
    toggleId = 'drawer-toggle',
    ...props
}: DrawerProps) {
    const handleToggle = () => {
        onOpenChange?.(!open)
    }

    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(drawerVariants({ side, mobile }), className)}
            {...props}
        >
            {/* Hidden checkbox for drawer state */}
            <input
                id={toggleId}
                type="checkbox"
                className="drawer-toggle"
                checked={open}
                onChange={handleToggle}
                aria-hidden="true"
            />

            {/* Main content area */}
            <div
                className={cn('drawer-content flex flex-col', contentProps?.className)}
                {...contentProps}
            >
                {children}
            </div>

            {/* Sidebar */}
            <div
                className={cn(drawerSideVariants({}), sidebarProps?.className)}
                {...sidebarProps}
            >
                {/* Overlay - clicking closes the drawer */}
                <label
                    htmlFor={toggleId}
                    className={cn(
                        'drawer-overlay',
                        overlayProps?.className
                    )}
                    {...overlayProps}
                    onClick={(e) => {
                        handleToggle()
                        overlayProps?.onClick?.(e)
                    }}
                    aria-label="Close drawer"
                />

                {/* Sidebar content */}
                <aside className="bg-base-200 text-base-content min-h-full w-80 p-4">
                    {sidebarContent}
                </aside>
            </div>
        </Comp>
    )
}

/**
 * DrawerToggle component for triggering drawer open/close.
 *
 * @example
 * ```tsx
 * <DrawerToggle htmlFor="my-drawer" className="btn btn-square btn-ghost">
 *   <MenuIcon />
 * </DrawerToggle>
 * ```
 */
export interface DrawerToggleProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /**
     * The drawer toggle input id to associate with
     */
    htmlFor: string
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function DrawerToggle({
    className,
    children,
    asChild = false,
    ...props
}: DrawerToggleProps) {
    const Comp = asChild ? Slot : 'label'

    return (
        <Comp
            className={cn('drawer-button', className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

export { Drawer, DrawerToggle, drawerVariants, drawerSideVariants }
