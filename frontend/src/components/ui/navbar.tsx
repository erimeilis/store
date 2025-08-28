import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const navbarVariants = cva(
    'navbar',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                neutral: 'bg-neutral text-neutral-content',
                primary: 'bg-primary text-primary-content',
                secondary: 'bg-secondary text-secondary-content',
                accent: 'bg-accent text-accent-content',
                info: 'bg-info text-info-content',
                success: 'bg-success text-success-content',
                warning: 'bg-warning text-warning-content',
                error: 'bg-error text-error-content',
                base100: 'bg-base-100',
                base200: 'bg-base-200',
                base300: 'bg-base-300',
            },
            // Size variants
            size: {
                default: '',
                compact: 'navbar-compact',
            },
            // Shadow variants
            shadow: {
                none: '',
                sm: 'shadow-sm',
                md: 'shadow-md',
                lg: 'shadow-lg',
                xl: 'shadow-xl',
            },
            // Position variants
            position: {
                default: '',
                sticky: 'sticky top-0 z-30',
                fixed: 'fixed top-0 left-0 right-0 z-30',
            },
        },
        defaultVariants: {
            color: 'default',
            size: 'default',
            shadow: 'none',
            position: 'default',
        },
    }
)

export interface NavbarProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
        VariantProps<typeof navbarVariants> {
    /**
     * Content for the start (left) section of the navbar
     */
    start?: React.ReactNode
    /**
     * Content for the center section of the navbar
     */
    center?: React.ReactNode
    /**
     * Content for the end (right) section of the navbar
     */
    end?: React.ReactNode
    /**
     * Custom props for the start section
     */
    startProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Custom props for the center section
     */
    centerProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Custom props for the end section
     */
    endProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Navbar component for creating navigation headers.
 *
 * Based on DaisyUI's navbar component with support for different color themes,
 * sizes, shadows, and positioning. Features start, center, and end sections
 * for flexible layout organization.
 *
 * @example
 * ```tsx
 * <Navbar
 *   color="primary"
 *   position="sticky"
 *   shadow="md"
 *   start={<Logo />}
 *   center={<Navigation />}
 *   end={<UserMenu />}
 * />
 * ```
 */
function Navbar({
    className,
    color,
    size,
    shadow,
    position,
    start,
    center,
    end,
    startProps,
    centerProps,
    endProps,
    asChild = false,
    children,
    ...props
}: NavbarProps) {
    const Comp = asChild ? Slot : 'div'

    // If children are provided, render them directly without sections
    if (children) {
        return (
            <Comp
                className={cn(navbarVariants({ color, size, shadow, position }), className)}
                {...props}
            >
                {children}
            </Comp>
        )
    }

    return (
        <Comp
            className={cn(navbarVariants({ color, size, shadow, position }), className)}
            role="navigation"
            {...props}
        >
            {/* Start section */}
            {start && (
                <div
                    className={cn('navbar-start', startProps?.className)}
                    {...startProps}
                >
                    {start}
                </div>
            )}

            {/* Center section */}
            {center && (
                <div
                    className={cn('navbar-center', centerProps?.className)}
                    {...centerProps}
                >
                    {center}
                </div>
            )}

            {/* End section */}
            {end && (
                <div
                    className={cn('navbar-end', endProps?.className)}
                    {...endProps}
                >
                    {end}
                </div>
            )}
        </Comp>
    )
}

/**
 * NavbarBrand component for brand/logo area in navbar.
 *
 * @example
 * ```tsx
 * <NavbarBrand className="text-xl">
 *   <Logo /> Brand Name
 * </NavbarBrand>
 * ```
 */
export interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function NavbarBrand({
    className,
    children,
    asChild = false,
    ...props
}: NavbarBrandProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn('navbar-brand text-xl font-bold p-2', className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * NavbarMenu component for navigation menu items.
 *
 * @example
 * ```tsx
 * <NavbarMenu>
 *   <a href="/" className="btn btn-ghost">Home</a>
 *   <a href="/about" className="btn btn-ghost">About</a>
 * </NavbarMenu>
 * ```
 */
export interface NavbarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
    /**
     * Whether to use horizontal layout
     * @default true
     */
    horizontal?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function NavbarMenu({
    className,
    horizontal = true,
    children,
    asChild = false,
    ...props
}: NavbarMenuProps) {
    const Comp = asChild ? Slot : 'ul'

    return (
        <Comp
            className={cn(
                'menu',
                horizontal ? 'menu-horizontal' : '',
                'px-1',
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * NavbarStart component for the start (left) section of the navbar.
 */
export interface NavbarStartProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function NavbarStart({
    className,
    asChild = false,
    ...props
}: NavbarStartProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn('navbar-start', className)}
            {...props}
        />
    )
}

/**
 * NavbarEnd component for the end (right) section of the navbar.
 */
export interface NavbarEndProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function NavbarEnd({
    className,
    asChild = false,
    ...props
}: NavbarEndProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn('navbar-end', className)}
            {...props}
        />
    )
}

// Add compound component properties
const NavbarWithCompoundComponents = Navbar as typeof Navbar & {
  Start: typeof NavbarStart
  End: typeof NavbarEnd
  Brand: typeof NavbarBrand
  Menu: typeof NavbarMenu
}

NavbarWithCompoundComponents.Start = NavbarStart
NavbarWithCompoundComponents.End = NavbarEnd
NavbarWithCompoundComponents.Brand = NavbarBrand
NavbarWithCompoundComponents.Menu = NavbarMenu

export {
    NavbarWithCompoundComponents as Navbar,
    NavbarStart,
    NavbarEnd,
    NavbarBrand,
    NavbarMenu,
    navbarVariants
}
