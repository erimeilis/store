import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const radialProgressVariants = cva(
    'radial-progress',
    {
        variants: {
            // Size variants
            size: {
                xs: 'w-8 h-8 text-xs',
                sm: 'w-12 h-12 text-sm',
                md: 'w-16 h-16 text-base',
                lg: 'w-24 h-24 text-lg',
                xl: 'w-32 h-32 text-xl',
            },
            // Color variants
            color: {
                default: '',
                primary: 'text-primary',
                secondary: 'text-secondary',
                accent: 'text-accent',
                neutral: 'text-neutral',
                info: 'text-info',
                success: 'text-success',
                warning: 'text-warning',
                error: 'text-error',
            },
        },
        defaultVariants: {
            size: 'md',
            color: 'default',
        },
    }
)

export interface RadialProgressProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
        VariantProps<typeof radialProgressVariants> {
    /**
     * Progress value (0-100)
     */
    value?: number
    /**
     * Maximum value
     * @default 100
     */
    max?: number
    /**
     * Whether to show the percentage text
     * @default true
     */
    showValue?: boolean
    /**
     * Custom value formatter
     */
    formatValue?: (value: number, max: number) => string
    /**
     * Custom content to display instead of value
     */
    children?: React.ReactNode
    /**
     * Progress bar thickness (CSS custom property value)
     * @default '0.2rem'
     */
    thickness?: string
    /**
     * Background color for the progress track
     */
    trackColor?: string
    /**
     * Color for the progress bar
     */
    progressColor?: string
    /**
     * Whether to animate progress changes
     * @default true
     */
    animated?: boolean
    /**
     * Animation duration in milliseconds
     * @default 300
     */
    animationDuration?: number
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * RadialProgress component for displaying circular progress indicators.
 *
 * Based on DaisyUI's radial-progress component with support for different sizes,
 * colors, custom formatting, and smooth animations. Perfect for loading states,
 * completion percentages, and circular progress visualization.
 *
 * @example
 * ```tsx
 * <RadialProgress
 *   value={75}
 *   size="lg"
 *   color="primary"
 *   showValue
 *   animated
 * />
 * ```
 */
function RadialProgress({
    className,
    size,
    color,
    value = 0,
    max = 100,
    showValue = true,
    formatValue = (val, maximum) => `${Math.round((val / maximum) * 100)}%`,
    children,
    thickness = '0.2rem',
    trackColor,
    progressColor,
    animated = true,
    animationDuration = 300,
    asChild = false,
    style,
    ...props
}: RadialProgressProps) {
    const [displayValue, setDisplayValue] = React.useState(animated ? 0 : value)
    const progressRef = React.useRef<HTMLDivElement>(null)

    // Animate value changes
    React.useEffect(() => {
        if (!animated) {
            setDisplayValue(value)
            return
        }

        const startValue = displayValue
        const endValue = value
        const duration = animationDuration
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3)

            const currentValue = startValue + (endValue - startValue) * easedProgress
            setDisplayValue(currentValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [value, animated, animationDuration, displayValue])

    const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100)
    const Comp = asChild ? Slot : 'div'

    const progressStyle = {
        '--value': percentage,
        '--size': undefined,
        '--thickness': thickness,
        ...(trackColor && { '--track-color': trackColor }),
        ...(progressColor && { '--progress-color': progressColor }),
        ...style,
    } as React.CSSProperties

    return (
        <Comp
            ref={progressRef}
            className={cn(radialProgressVariants({ size, color }), className)}
            style={progressStyle}
            role="progressbar"
            aria-valuenow={Math.round(displayValue)}
            aria-valuemin={0}
            aria-valuemax={max}
            {...props}
        >
            {children || (showValue && formatValue(displayValue, max))}
        </Comp>
    )
}

/**
 * AnimatedRadialProgress component with built-in animation controls.
 *
 * @example
 * ```tsx
 * <AnimatedRadialProgress
 *   targetValue={85}
 *   duration={2000}
 *   onComplete={() => console.log('Animation complete')}
 *   size="xl"
 *   color="success"
 * />
 * ```
 */
export interface AnimatedRadialProgressProps extends Omit<RadialProgressProps, 'value' | 'animated' | 'onProgress'> {
    /**
     * Target value to animate to
     */
    targetValue: number
    /**
     * Animation duration in milliseconds
     * @default 1000
     */
    duration?: number
    /**
     * Delay before starting animation in milliseconds
     * @default 0
     */
    delay?: number
    /**
     * Callback fired when animation completes
     */
    onComplete?: () => void
    /**
     * Callback fired during animation
     */
    onProgress?: (currentValue: number) => void
    /**
     * Whether to start animation automatically
     * @default true
     */
    autoStart?: boolean
}

function AnimatedRadialProgress({
    targetValue,
    duration = 1000,
    delay = 0,
    onComplete,
    onProgress,
    autoStart = true,
    ...props
}: AnimatedRadialProgressProps) {
    const [currentValue, setCurrentValue] = React.useState(0)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const animationRef = React.useRef<number | undefined>(undefined)

    const startAnimation = React.useCallback(() => {
        if (isAnimating) return

        setIsAnimating(true)
        const startTime = performance.now() + delay
        const startValue = currentValue
        const endValue = targetValue

        const animate = (currentTime: number) => {
            if (currentTime < startTime) {
                animationRef.current = requestAnimationFrame(animate)
                return
            }

            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3)

            const value = startValue + (endValue - startValue) * easedProgress
            setCurrentValue(value)
            onProgress?.(value)

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate)
            } else {
                setIsAnimating(false)
                onComplete?.()
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }, [targetValue, duration, delay, currentValue, isAnimating, onComplete, onProgress])

    React.useEffect(() => {
        if (autoStart) {
            startAnimation()
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [autoStart, startAnimation])

    return (
        <RadialProgress
            value={currentValue}
            animated={false}
            {...props}
        />
    )
}

/**
 * ProgressRing component with customizable appearance.
 *
 * @example
 * ```tsx
 * <ProgressRing
 *   value={60}
 *   size={120}
 *   strokeWidth={8}
 *   strokeColor="hsl(var(--p))"
 *   backgroundColor="hsl(var(--b3))"
 *   showText
 * >
 *   <div className="text-center">
 *     <div className="text-2xl font-bold">60%</div>
 *     <div className="text-xs opacity-70">Complete</div>
 *   </div>
 * </ProgressRing>
 * ```
 */
export interface ProgressRingProps extends Omit<RadialProgressProps, 'size' | 'color'> {
    /**
     * Ring size in pixels
     * @default 64
     */
    size?: number
    /**
     * Stroke width in pixels
     * @default 4
     */
    strokeWidth?: number
    /**
     * Stroke color for progress
     */
    strokeColor?: string
    /**
     * Background color for track
     */
    backgroundColor?: string
    /**
     * Whether to show text content
     * @default false
     */
    showText?: boolean
    /**
     * Text content (overrides default percentage)
     */
    text?: React.ReactNode
}

function ProgressRing({
    className,
    value = 0,
    max = 100,
    size = 64,
    strokeWidth = 4,
    strokeColor = 'currentColor',
    backgroundColor = 'rgba(0,0,0,0.1)',
    showText = false,
    text,
    children,
    formatValue = (val, maximum) => `${Math.round((val / maximum) * 100)}%`,
    ...props
}: ProgressRingProps) {
    const normalizedRadius = (size - strokeWidth) / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div
            className={cn('relative inline-flex items-center justify-center', className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={normalizedRadius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={normalizedRadius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 ease-out"
                />
            </svg>

            {/* Text content */}
            {(showText || children || text) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children || text || formatValue(value, max)}
                </div>
            )}
        </div>
    )
}

/**
 * MultiProgressRing component for displaying multiple progress values.
 *
 * @example
 * ```tsx
 * <MultiProgressRing
 *   size={120}
 *   rings={[
 *     { value: 75, strokeColor: 'hsl(var(--p))', strokeWidth: 6 },
 *     { value: 60, strokeColor: 'hsl(var(--s))', strokeWidth: 4 },
 *     { value: 45, strokeColor: 'hsl(var(--a))', strokeWidth: 2 }
 *   ]}
 * >
 *   <div className="text-center">
 *     <div className="font-bold">Progress</div>
 *   </div>
 * </MultiProgressRing>
 * ```
 */
export interface ProgressRingData {
    value: number
    max?: number
    strokeColor?: string
    strokeWidth?: number
    backgroundColor?: string
}

export interface MultiProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Ring size in pixels
     */
    size: number
    /**
     * Array of progress ring configurations
     */
    rings: ProgressRingData[]
    /**
     * Content to display in the center
     */
    children?: React.ReactNode
    /**
     * Gap between rings in pixels
     * @default 4
     */
    ringGap?: number
}

function MultiProgressRing({
    className,
    size,
    rings,
    children,
    ringGap = 4,
    ...props
}: MultiProgressRingProps) {
    return (
        <div
            className={cn('relative inline-flex items-center justify-center', className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg width={size} height={size} className="transform -rotate-90">
                {rings.map((ring, index) => {
                    const strokeWidth = ring.strokeWidth || 4
                    const offset = index * (strokeWidth + ringGap)
                    const normalizedRadius = (size - strokeWidth - offset * 2) / 2
                    const circumference = normalizedRadius * 2 * Math.PI
                    const percentage = Math.min(Math.max((ring.value / (ring.max || 100)) * 100, 0), 100)
                    const strokeDashoffset = circumference - (percentage / 100) * circumference

                    return (
                        <g key={index}>
                            {/* Background circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={normalizedRadius}
                                stroke={ring.backgroundColor || 'rgba(0,0,0,0.1)'}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {/* Progress circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={normalizedRadius}
                                stroke={ring.strokeColor || 'currentColor'}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-300 ease-out"
                            />
                        </g>
                    )
                })}
            </svg>

            {/* Center content */}
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    )
}

export {
    RadialProgress,
    AnimatedRadialProgress,
    ProgressRing,
    MultiProgressRing,
    radialProgressVariants
}
