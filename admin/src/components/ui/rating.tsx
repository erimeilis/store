import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ratingVariants = cva(
    'rating',
    {
        variants: {
            // Size variants
            size: {
                xs: 'rating-xs',
                sm: 'rating-sm',
                md: 'rating-md',
                lg: 'rating-lg',
            },
            // Gap variants
            gap: {
                none: '',
                sm: 'gap-1',
                md: 'gap-2',
                lg: 'gap-3',
            },
        },
        defaultVariants: {
            size: 'md',
            gap: 'sm',
        },
    }
)

const ratingItemVariants = cva(
    'mask',
    {
        variants: {
            // Shape variants
            shape: {
                star: 'mask-star-2',
                heart: 'mask-heart',
                circle: 'mask-circle',
                triangle: 'mask-triangle',
                square: 'mask-square',
                hexagon: 'mask-hexagon',
                decagon: 'mask-decagon',
            },
            // Color variants
            color: {
                default: 'bg-orange-400',
                neutral: 'bg-neutral',
                primary: 'bg-primary',
                secondary: 'bg-secondary',
                accent: 'bg-accent',
                info: 'bg-info',
                success: 'bg-success',
                warning: 'bg-warning',
                error: 'bg-error',
            },
            // State variants
            state: {
                default: '',
                half: 'rating-half',
                hidden: 'rating-hidden',
            },
        },
        defaultVariants: {
            shape: 'star',
            color: 'default',
            state: 'default',
        },
    }
)

export interface RatingProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
        VariantProps<typeof ratingVariants> {
    /**
     * Current rating value
     */
    value?: number
    /**
     * Default rating value for uncontrolled mode
     */
    defaultValue?: number
    /**
     * Maximum rating value
     * @default 5
     */
    max?: number
    /**
     * Whether the rating is interactive
     * @default true
     */
    interactive?: boolean
    /**
     * Whether to allow half ratings
     * @default false
     */
    allowHalf?: boolean
    /**
     * Shape of the rating items
     * @default 'star'
     */
    shape?: 'star' | 'heart' | 'circle' | 'triangle' | 'square' | 'hexagon' | 'decagon'
    /**
     * Color of filled rating items
     */
    color?: 'default' | 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Color of empty rating items
     */
    emptyColor?: string
    /**
     * Callback fired when rating changes
     */
    onRatingChange?: (rating: number) => void
    /**
     * Custom props for rating items
     */
    itemProps?: React.InputHTMLAttributes<HTMLInputElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Rating component for collecting user feedback and displaying ratings.
 *
 * Based on DaisyUI's rating component with support for different shapes,
 * colors, sizes, and both interactive and display-only modes. Perfect for
 * product reviews, service ratings, and feedback collection.
 *
 * @example
 * ```tsx
 * <Rating
 *   shape="star"
 *   color="warning"
 *   size="lg"
 *   max={5}
 *   value={rating}
 *   onRatingChange={setRating}
 *   allowHalf
 * />
 * ```
 */
function Rating({
    className,
    size,
    gap,
    value,
    defaultValue,
    max = 5,
    interactive = true,
    allowHalf = false,
    shape = 'star',
    color = 'default',
    emptyColor = 'bg-base-300',
    onRatingChange,
    itemProps,
    asChild = false,
    ...props
}: RatingProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? 0)
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue
    const displayValue = hoverValue !== null ? hoverValue : currentValue

    const handleRatingChange = (newValue: number) => {
        if (!interactive) return

        if (!isControlled) {
            setInternalValue(newValue)
        }

        onRatingChange?.(newValue)
    }

    const handleMouseEnter = (itemValue: number) => {
        if (!interactive) return
        setHoverValue(itemValue)
    }

    const handleMouseLeave = () => {
        if (!interactive) return
        setHoverValue(null)
    }

    const Comp = asChild ? Slot : 'div'

    // Generate rating items
    const items = []
    const step = allowHalf ? 0.5 : 1

    for (let i = step; i <= max; i += step) {
        const isActive = displayValue >= i
        const isHalf = allowHalf && displayValue >= i - 0.5 && displayValue < i

        items.push(
            <input
                key={i}
                type="radio"
                name={`rating-${Math.random()}`}
                className={cn(
                    ratingItemVariants({
                        shape,
                        color: isActive ? color : undefined,
                        state: isHalf ? 'half' : 'default'
                    }),
                    !isActive && emptyColor,
                    interactive && 'cursor-pointer',
                    itemProps?.className
                )}
                checked={currentValue === i}
                onChange={() => handleRatingChange(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                disabled={!interactive}
                aria-label={`Rate ${i} out of ${max}`}
                {...itemProps}
            />
        )
    }

    return (
        <Comp
            className={cn(ratingVariants({ size, gap }), className)}
            {...props}
        >
            {/* Hidden radio for zero rating */}
            {interactive && (
                <input
                    type="radio"
                    name={`rating-${Math.random()}`}
                    className="rating-hidden"
                    checked={currentValue === 0}
                    onChange={() => handleRatingChange(0)}
                    aria-label="No rating"
                />
            )}

            {items}
        </Comp>
    )
}

/**
 * SimpleRating component for display-only ratings with custom styling.
 *
 * @example
 * ```tsx
 * <SimpleRating
 *   value={4.5}
 *   max={5}
 *   shape="star"
 *   showValue
 *   showCount
 *   count={1234}
 * />
 * ```
 */
export interface SimpleRatingProps extends Omit<RatingProps, 'onRatingChange'> {
    /**
     * Whether to show the rating value as text
     */
    showValue?: boolean
    /**
     * Whether to show the rating count
     */
    showCount?: boolean
    /**
     * Total number of ratings
     */
    count?: number
    /**
     * Custom value formatter
     */
    formatValue?: (value: number) => string
}

function SimpleRating({
    value = 0,
    showValue = false,
    showCount = false,
    count,
    formatValue = (val) => val.toFixed(1),
    className,
    ...props
}: SimpleRatingProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Rating
                value={value}
                interactive={false}
                {...props}
            />

            {showValue && (
                <span className="text-sm font-medium">
                    {formatValue(value)}
                </span>
            )}

            {showCount && count !== undefined && (
                <span className="text-sm text-base-content/60">
                    ({count.toLocaleString()})
                </span>
            )}
        </div>
    )
}

/**
 * RatingDistribution component for showing rating breakdown.
 *
 * @example
 * ```tsx
 * <RatingDistribution
 *   distribution={[
 *     { stars: 5, count: 150, percentage: 60 },
 *     { stars: 4, count: 75, percentage: 30 },
 *     { stars: 3, count: 25, percentage: 10 },
 *     { stars: 2, count: 0, percentage: 0 },
 *     { stars: 1, count: 0, percentage: 0 },
 *   ]}
 * />
 * ```
 */
export interface RatingDistributionItem {
    stars: number
    count: number
    percentage: number
}

export interface RatingDistributionProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Array of rating distribution data
     */
    distribution: RatingDistributionItem[]
    /**
     * Whether to show percentages
     * @default true
     */
    showPercentages?: boolean
    /**
     * Whether to show counts
     * @default true
     */
    showCounts?: boolean
}

function RatingDistribution({
    distribution,
    showPercentages = true,
    showCounts = true,
    className,
    ...props
}: RatingDistributionProps) {
    return (
        <div className={cn('space-y-2', className)} {...props}>
            {distribution
                .sort((a, b) => b.stars - a.stars)
                .map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                        <span className="text-sm w-2">{item.stars}</span>
                        <SimpleRating
                            value={item.stars}
                            max={item.stars}
                            size="xs"
                            interactive={false}
                        />
                        <div className="flex-1 bg-base-300 rounded-full h-2">
                            <div
                                className="bg-warning h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                        <div className="text-sm text-base-content/60 min-w-0 flex gap-1">
                            {showCounts && (
                                <span>{item.count}</span>
                            )}
                            {showPercentages && (
                                <span>({item.percentage}%)</span>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    )
}

export { Rating, SimpleRating, RatingDistribution, ratingVariants, ratingItemVariants }
