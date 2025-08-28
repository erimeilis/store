import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const maskVariants = cva(
    'mask',
    {
        variants: {
            // Shape variants
            shape: {
                circle: 'mask-circle',
                squircle: 'mask-squircle',
                heart: 'mask-heart',
                hexagon: 'mask-hexagon',
                'hexagon-2': 'mask-hexagon-2',
                decagon: 'mask-decagon',
                pentagon: 'mask-pentagon',
                diamond: 'mask-diamond',
                square: 'mask-square',
                star: 'mask-star',
                'star-2': 'mask-star-2',
                triangle: 'mask-triangle',
                'triangle-2': 'mask-triangle-2',
                'triangle-3': 'mask-triangle-3',
                'triangle-4': 'mask-triangle-4',
                parallelogram: 'mask-parallelogram',
                'parallelogram-2': 'mask-parallelogram-2',
                'parallelogram-3': 'mask-parallelogram-3',
                'parallelogram-4': 'mask-parallelogram-4',
                'half-1': 'mask-half-1',
                'half-2': 'mask-half-2',
            },
            // Size variants
            size: {
                xs: 'w-8 h-8',
                sm: 'w-12 h-12',
                md: 'w-16 h-16',
                lg: 'w-24 h-24',
                xl: 'w-32 h-32',
                '2xl': 'w-48 h-48',
            },
        },
        defaultVariants: {
            shape: 'circle',
            size: 'md',
        },
    }
)

export interface MaskProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>,
        VariantProps<typeof maskVariants> {
    /**
     * Content to be masked (image, div, etc.)
     */
    children?: React.ReactNode
    /**
     * Background image URL for mask
     */
    src?: string
    /**
     * Alt text for accessibility when using src
     */
    alt?: string
    /**
     * Background color when not using an image
     */
    backgroundColor?: string
    /**
     * Custom width (overrides size variant)
     */
    width?: string | number
    /**
     * Custom height (overrides size variant)
     */
    height?: string | number
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Mask component for creating masked images and visual elements.
 *
 * Based on DaisyUI's mask utilities with support for different shapes,
 * sizes, and background options. Perfect for avatars, decorative elements,
 * and creative visual effects in telecommunications applications.
 *
 * @example
 * ```tsx
 * <Mask shape="circle" size="lg" src="/user-avatar.jpg" alt="User Avatar" />
 *
 * <Mask shape="hexagon" backgroundColor="bg-primary">
 *   <div className="flex items-center justify-center h-full text-white">
 *     <PhoneIcon />
 *   </div>
 * </Mask>
 * ```
 */
function Mask({
    className,
    shape,
    size,
    children,
    src,
    alt,
    backgroundColor,
    width,
    height,
    asChild = false,
    style,
    ...props
}: MaskProps) {
    const Comp = asChild ? Slot : 'div'

    const maskStyle = {
        ...style,
        ...(width && { width }),
        ...(height && { height }),
        ...(src && {
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }),
    }

    return (
        <Comp
            className={cn(
                maskVariants({ shape, size }),
                backgroundColor,
                className
            )}
            style={maskStyle}
            role={src ? 'img' : undefined}
            aria-label={alt}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * Avatar component using mask for profile pictures and user representations.
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/user.jpg"
 *   alt="John Doe"
 *   size="lg"
 *   fallback="JD"
 *   status="online"
 * />
 * ```
 */
export interface AvatarProps extends Omit<MaskProps, 'shape' | 'children'> {
    /**
     * Avatar image source
     */
    src?: string
    /**
     * Alt text for the avatar
     */
    alt?: string
    /**
     * Fallback content when image fails to load (initials, icon, etc.)
     */
    fallback?: React.ReactNode
    /**
     * Status indicator
     */
    status?: 'online' | 'offline' | 'away' | 'busy'
    /**
     * Whether to show status indicator
     * @default false
     */
    showStatus?: boolean
    /**
     * Custom status indicator props
     */
    statusProps?: React.HTMLAttributes<HTMLDivElement>
}

function Avatar({
    className,
    src,
    alt,
    fallback,
    size = 'md',
    status,
    showStatus = false,
    statusProps,
    backgroundColor = 'bg-neutral text-neutral-content',
    ...props
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false)
    const [imageLoaded, setImageLoaded] = React.useState(false)

    React.useEffect(() => {
        if (src) {
            setImageError(false)
            setImageLoaded(false)

            const img = new Image()
            img.onload = () => setImageLoaded(true)
            img.onerror = () => setImageError(true)
            img.src = src
        }
    }, [src])

    const statusColorMap = {
        online: 'bg-success',
        offline: 'bg-base-300',
        away: 'bg-warning',
        busy: 'bg-error',
    }

    const statusPositionMap = {
        xs: 'w-2 h-2 -bottom-0 -right-0',
        sm: 'w-3 h-3 -bottom-0 -right-0',
        md: 'w-3 h-3 -bottom-0 -right-0',
        lg: 'w-4 h-4 -bottom-1 -right-1',
        xl: 'w-5 h-5 -bottom-1 -right-1',
        '2xl': 'w-6 h-6 -bottom-2 -right-2',
    }

    return (
        <div className="relative inline-block">
            <Mask
                shape="circle"
                size={size}
                src={src && !imageError ? src : undefined}
                alt={alt}
                backgroundColor={!src || imageError ? backgroundColor : undefined}
                className={className}
                {...props}
            >
                {(!src || imageError || !imageLoaded) && fallback && (
                    <div className="flex items-center justify-center w-full h-full text-sm font-medium">
                        {fallback}
                    </div>
                )}
            </Mask>

            {/* Status Indicator */}
            {showStatus && status && (
                <div
                    className={cn(
                        'absolute rounded-full border-2 border-base-100',
                        statusColorMap[status],
                        statusPositionMap[size || 'md'],
                        statusProps?.className
                    )}
                    {...statusProps}
                />
            )}
        </div>
    )
}

/**
 * IconMask component for masked icons and decorative elements.
 *
 * @example
 * ```tsx
 * <IconMask shape="hexagon" size="lg" backgroundColor="bg-primary">
 *   <SignalIcon className="w-8 h-8 text-white" />
 * </IconMask>
 * ```
 */
export interface IconMaskProps extends Omit<MaskProps, 'src' | 'alt'> {
    /**
     * Icon or content to display inside the mask
     */
    icon?: React.ReactNode
    /**
     * Icon size (for proper centering)
     */
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

function IconMask({
    className,
    icon,
    iconSize = 'md',
    backgroundColor = 'bg-primary text-primary-content',
    children,
    ...props
}: IconMaskProps) {
    const iconSizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    }

    return (
        <Mask
            backgroundColor={backgroundColor}
            className={cn('flex items-center justify-center', className)}
            {...props}
        >
            {icon && React.isValidElement(icon) ? (
                React.cloneElement(icon as React.ReactElement<{className?: string}>, {
                    className: cn(iconSizeClasses[iconSize], (icon as React.ReactElement<{className?: string}>).props.className),
                })
            ) : (
                icon || children
            )}
        </Mask>
    )
}

/**
 * MaskGroup component for displaying multiple masked elements.
 *
 * @example
 * ```tsx
 * <MaskGroup spacing="sm" overlap>
 *   <Avatar src="/user1.jpg" alt="User 1" />
 *   <Avatar src="/user2.jpg" alt="User 2" />
 *   <Avatar src="/user3.jpg" alt="User 3" />
 * </MaskGroup>
 * ```
 */
export interface MaskGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Masked elements as children
     */
    children: React.ReactNode
    /**
     * Spacing between elements
     */
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
    /**
     * Whether elements should overlap
     * @default false
     */
    overlap?: boolean
    /**
     * Maximum number of elements to show
     */
    max?: number
    /**
     * Text to show when there are more elements than max
     */
    moreText?: string
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function MaskGroup({
    className,
    children,
    spacing = 'sm',
    overlap = false,
    max,
    moreText = '+{count}',
    asChild = false,
    ...props
}: MaskGroupProps) {
    const Comp = asChild ? Slot : 'div'
    const childArray = React.Children.toArray(children)

    const spacingClasses = {
        none: '',
        xs: overlap ? '-space-x-1' : 'gap-1',
        sm: overlap ? '-space-x-2' : 'gap-2',
        md: overlap ? '-space-x-3' : 'gap-3',
        lg: overlap ? '-space-x-4' : 'gap-4',
    }

    const displayChildren = max ? childArray.slice(0, max) : childArray
    const remainingCount = max ? Math.max(0, childArray.length - max) : 0

    return (
        <Comp
            className={cn(
                'flex items-center',
                spacingClasses[spacing],
                className
            )}
            {...props}
        >
            {displayChildren}

            {remainingCount > 0 && (
                <div className="mask mask-circle bg-base-300 text-base-content flex items-center justify-center w-12 h-12 text-xs font-medium">
                    {moreText.replace('{count}', remainingCount.toString())}
                </div>
            )}
        </Comp>
    )
}

/**
 * DecorativeMask component for purely decorative masked elements.
 *
 * @example
 * ```tsx
 * <DecorativeMask
 *   shape="hexagon"
 *   size="xl"
 *   gradient="from-primary to-secondary"
 *   animate="pulse"
 * />
 * ```
 */
export interface DecorativeMaskProps extends Omit<MaskProps, 'children' | 'src' | 'alt'> {
    /**
     * Gradient background
     */
    gradient?: string
    /**
     * Animation class
     */
    animate?: 'none' | 'spin' | 'ping' | 'pulse' | 'bounce'
    /**
     * Pattern overlay
     */
    pattern?: 'dots' | 'lines' | 'grid'
}

function DecorativeMask({
    className,
    gradient,
    animate = 'none',
    pattern,
    backgroundColor,
    ...props
}: DecorativeMaskProps) {
    const animationClasses = {
        none: '',
        spin: 'animate-spin',
        ping: 'animate-ping',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
    }

    const patternClasses = {
        dots: 'bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[length:8px_8px]',
        lines: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,currentColor_4px,currentColor_6px)]',
        grid: 'bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[length:10px_10px]',
    }

    return (
        <Mask
            backgroundColor={gradient ? `bg-gradient-to-r ${gradient}` : backgroundColor}
            className={cn(
                animationClasses[animate],
                pattern && patternClasses[pattern],
                className
            )}
            {...props}
        />
    )
}

export {
    Mask,
    Avatar,
    IconMask,
    MaskGroup,
    DecorativeMask,
    maskVariants
}
