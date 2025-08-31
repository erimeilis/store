import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const swapVariants = cva(
    'swap',
    {
        variants: {
            // Animation variants
            animation: {
                none: '',
                rotate: 'swap-rotate',
                flip: 'swap-flip',
            },
        },
        defaultVariants: {
            animation: 'none',
        },
    }
)

export interface SwapProps
    extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange' | 'onToggle'>,
        VariantProps<typeof swapVariants> {
    /**
     * Content to show in the default state
     */
    on: React.ReactNode
    /**
     * Content to show in the swapped state
     */
    off: React.ReactNode
    /**
     * Whether the swap is currently active
     */
    active?: boolean
    /**
     * Default active state (for uncontrolled mode)
     */
    defaultActive?: boolean
    /**
     * Callback fired when swap state changes
     */
    onToggle?: (active: boolean) => void
    /**
     * Whether the swap is disabled
     * @default false
     */
    disabled?: boolean
    /**
     * Custom input props
     */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Swap component for animated toggle states and content transitions.
 *
 * Based on DaisyUI's swap component with support for different animations,
 * controlled and uncontrolled modes, and smooth transitions between states.
 * Perfect for toggle buttons, theme switchers, and animated state indicators.
 *
 * @example
 * ```tsx
 * <Swap
 *   animation="rotate"
 *   on={<MenuIcon />}
 *   off={<CloseIcon />}
 *   active={isMenuOpen}
 *   onToggle={setIsMenuOpen}
 * />
 * ```
 */
function Swap({
    className,
    animation,
    on,
    off,
    active,
    defaultActive = false,
    onToggle,
    disabled = false,
    inputProps,
    asChild = false,
    ...props
}: SwapProps) {
    const [internalActive, setInternalActive] = React.useState(defaultActive)
    const isControlled = active !== undefined
    const currentActive = isControlled ? active : internalActive

    const handleToggle = () => {
        if (disabled) return

        if (isControlled) {
            onToggle?.(!active)
        } else {
            setInternalActive(!internalActive)
            onToggle?.(!internalActive)
        }
    }

    const Comp = asChild ? Slot : 'label'

    return (
        <Comp
            className={cn(
                swapVariants({ animation }),
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && 'cursor-pointer',
                className
            )}
            {...props}
        >
            <input
                type="checkbox"
                checked={currentActive}
                onChange={handleToggle}
                disabled={disabled}
                className="sr-only"
                {...inputProps}
            />

            {/* Off state content */}
            <div className="swap-off">
                {off}
            </div>

            {/* On state content */}
            <div className="swap-on">
                {on}
            </div>
        </Comp>
    )
}

/**
 * IconSwap component specifically for swapping between icons.
 *
 * @example
 * ```tsx
 * <IconSwap
 *   onIcon={<SunIcon />}
 *   offIcon={<MoonIcon />}
 *   animation="rotate"
 *   active={isDarkMode}
 *   onToggle={setIsDarkMode}
 *   size="lg"
 * />
 * ```
 */
export interface IconSwapProps extends Omit<SwapProps, 'on' | 'off'> {
    /**
     * Icon to show when active
     */
    onIcon: React.ReactNode
    /**
     * Icon to show when inactive
     */
    offIcon: React.ReactNode
    /**
     * Icon size
     */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /**
     * Icon color
     */
    color?: 'default' | 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'
}

function IconSwap({
    onIcon,
    offIcon,
    size = 'md',
    color = 'default',
    className,
    ...props
}: IconSwapProps) {
    const sizeClasses = {
        xs: 'w-4 h-4',
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    }

    const colorClasses = {
        default: '',
        primary: 'text-primary',
        secondary: 'text-secondary',
        accent: 'text-accent',
        neutral: 'text-neutral',
        info: 'text-info',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
    }

    const iconClass = cn(sizeClasses[size], colorClasses[color])

    const wrappedOnIcon = React.isValidElement(onIcon) ? (
        React.cloneElement(onIcon as React.ReactElement<{className?: string}>, {
            className: cn(iconClass, (onIcon as React.ReactElement<{className?: string}>).props.className),
        })
    ) : onIcon

    const wrappedOffIcon = React.isValidElement(offIcon) ? (
        React.cloneElement(offIcon as React.ReactElement<{className?: string}>, {
            className: cn(iconClass, (offIcon as React.ReactElement<{className?: string}>).props.className),
        })
    ) : offIcon

    return (
        <Swap
            on={wrappedOnIcon}
            off={wrappedOffIcon}
            className={cn('inline-flex items-center justify-center', className)}
            {...props}
        />
    )
}

/**
 * ThemeSwap component for theme switching with sun/moon icons.
 *
 * @example
 * ```tsx
 * <ThemeSwap
 *   isDark={isDarkTheme}
 *   onToggle={setIsDarkTheme}
 *   animation="rotate"
 *   size="md"
 * />
 * ```
 */
export interface ThemeSwapProps extends Omit<IconSwapProps, 'onIcon' | 'offIcon' | 'active' | 'onToggle'> {
    /**
     * Whether dark theme is active
     */
    isDark?: boolean
    /**
     * Default dark theme state
     */
    defaultIsDark?: boolean
    /**
     * Callback fired when theme is toggled
     */
    onToggle?: (isDark: boolean) => void
    /**
     * Custom light theme icon
     */
    lightIcon?: React.ReactNode
    /**
     * Custom dark theme icon
     */
    darkIcon?: React.ReactNode
}

function ThemeSwap({
    isDark,
    defaultIsDark,
    onToggle,
    lightIcon,
    darkIcon,
    ...props
}: ThemeSwapProps) {
    // Default icons
    const defaultLightIcon = (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    )

    const defaultDarkIcon = (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    )

    return (
        <IconSwap
            onIcon={darkIcon || defaultDarkIcon}
            offIcon={lightIcon || defaultLightIcon}
            active={isDark}
            defaultActive={defaultIsDark}
            onToggle={onToggle}
            {...props}
        />
    )
}

/**
 * MenuSwap component for hamburger menu toggle.
 *
 * @example
 * ```tsx
 * <MenuSwap
 *   isOpen={isMenuOpen}
 *   onToggle={setIsMenuOpen}
 *   animation="rotate"
 *   size="lg"
 * />
 * ```
 */
export interface MenuSwapProps extends Omit<IconSwapProps, 'onIcon' | 'offIcon' | 'active' | 'onToggle'> {
    /**
     * Whether menu is open
     */
    isOpen?: boolean
    /**
     * Default menu open state
     */
    defaultIsOpen?: boolean
    /**
     * Callback fired when menu is toggled
     */
    onToggle?: (isOpen: boolean) => void
    /**
     * Custom hamburger icon
     */
    hamburgerIcon?: React.ReactNode
    /**
     * Custom close icon
     */
    closeIcon?: React.ReactNode
}

function MenuSwap({
    isOpen,
    defaultIsOpen,
    onToggle,
    hamburgerIcon,
    closeIcon,
    ...props
}: MenuSwapProps) {
    // Default icons
    const defaultHamburgerIcon = (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    )

    const defaultCloseIcon = (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )

    return (
        <IconSwap
            onIcon={closeIcon || defaultCloseIcon}
            offIcon={hamburgerIcon || defaultHamburgerIcon}
            active={isOpen}
            defaultActive={defaultIsOpen}
            onToggle={onToggle}
            {...props}
        />
    )
}

/**
 * PlayPauseSwap component for media controls.
 *
 * @example
 * ```tsx
 * <PlayPauseSwap
 *   isPlaying={isPlaying}
 *   onToggle={setIsPlaying}
 *   animation="flip"
 *   size="xl"
 *   color="primary"
 * />
 * ```
 */
export interface PlayPauseSwapProps extends Omit<IconSwapProps, 'onIcon' | 'offIcon' | 'active' | 'onToggle'> {
    /**
     * Whether media is playing
     */
    isPlaying?: boolean
    /**
     * Default playing state
     */
    defaultIsPlaying?: boolean
    /**
     * Callback fired when play/pause is toggled
     */
    onToggle?: (isPlaying: boolean) => void
    /**
     * Custom play icon
     */
    playIcon?: React.ReactNode
    /**
     * Custom pause icon
     */
    pauseIcon?: React.ReactNode
}

function PlayPauseSwap({
    isPlaying,
    defaultIsPlaying,
    onToggle,
    playIcon,
    pauseIcon,
    ...props
}: PlayPauseSwapProps) {
    // Default icons
    const defaultPlayIcon = (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
    )

    const defaultPauseIcon = (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    )

    return (
        <IconSwap
            onIcon={pauseIcon || defaultPauseIcon}
            offIcon={playIcon || defaultPlayIcon}
            active={isPlaying}
            defaultActive={defaultIsPlaying}
            onToggle={onToggle}
            {...props}
        />
    )
}

/**
 * TextSwap component for swapping between text content.
 *
 * @example
 * ```tsx
 * <TextSwap
 *   onText="Hide Details"
 *   offText="Show Details"
 *   active={showDetails}
 *   onToggle={setShowDetails}
 *   animation="flip"
 * />
 * ```
 */
export interface TextSwapProps extends Omit<SwapProps, 'on' | 'off'> {
    /**
     * Text to show when active
     */
    onText: string
    /**
     * Text to show when inactive
     */
    offText: string
    /**
     * Text size
     */
    textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    /**
     * Text color
     */
    textColor?: 'default' | 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'
}

function TextSwap({
    onText,
    offText,
    textSize = 'base',
    textColor = 'default',
    className,
    ...props
}: TextSwapProps) {
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    }

    const colorClasses = {
        default: '',
        primary: 'text-primary',
        secondary: 'text-secondary',
        accent: 'text-accent',
        neutral: 'text-neutral',
        info: 'text-info',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
    }

    const textClass = cn(sizeClasses[textSize], colorClasses[textColor])

    return (
        <Swap
            on={<span className={textClass}>{onText}</span>}
            off={<span className={textClass}>{offText}</span>}
            className={cn('select-none', className)}
            {...props}
        />
    )
}

export {
    Swap,
    IconSwap,
    ThemeSwap,
    MenuSwap,
    PlayPauseSwap,
    TextSwap,
    swapVariants
}
