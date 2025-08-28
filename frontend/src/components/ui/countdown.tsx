import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const countdownVariants = cva(
    'countdown font-mono text-6xl',
    {
        variants: {
            // Size variants
            size: {
                xs: 'text-xs',
                sm: 'text-sm',
                md: 'text-2xl',
                lg: 'text-4xl',
                xl: 'text-6xl',
                '2xl': 'text-8xl',
            },
            // Color variants
            color: {
                default: '',
                neutral: 'text-neutral',
                primary: 'text-primary',
                secondary: 'text-secondary',
                accent: 'text-accent',
                info: 'text-info',
                success: 'text-success',
                warning: 'text-warning',
                error: 'text-error',
            },
        },
        defaultVariants: {
            size: 'xl',
            color: 'default',
        },
    }
)

export interface CountdownProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
        VariantProps<typeof countdownVariants> {
    /**
     * Target date/time to countdown to
     */
    target?: Date | string | number
    /**
     * Current value to display (for manual control)
     */
    value?: number
    /**
     * Whether to format as time units (hours, minutes, seconds)
     * @default false
     */
    formatAsTime?: boolean
    /**
     * Whether to show leading zeros
     * @default true
     */
    showLeadingZeros?: boolean
    /**
     * Maximum digits to display
     * @default 2
     */
    maxDigits?: number
    /**
     * Update interval in milliseconds
     * @default 1000
     */
    updateInterval?: number
    /**
     * Callback fired when countdown reaches zero
     */
    onComplete?: () => void
    /**
     * Callback fired on each update
     */
    onUpdate?: (timeLeft: number) => void
    /**
     * Custom time formatter
     */
    formatter?: (value: number) => string
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Countdown component for displaying countdown timers and time-sensitive content.
 *
 * Based on DaisyUI's countdown component with support for different sizes,
 * colors, automatic countdown to target dates, and custom formatting.
 * Perfect for promotions, events, launches, and time-limited offers.
 *
 * @example
 * ```tsx
 * <Countdown
 *   target={new Date('2024-12-31T23:59:59')}
 *   size="xl"
 *   color="primary"
 *   formatAsTime
 *   onComplete={() => alert('Time is up!')}
 * />
 * ```
 */
function Countdown({
    className,
    size,
    color,
    target,
    value,
    formatAsTime = false,
    showLeadingZeros = true,
    maxDigits = 2,
    updateInterval = 1000,
    onComplete,
    onUpdate,
    formatter,
    asChild = false,
    ...props
}: CountdownProps) {
    const [timeLeft, setTimeLeft] = React.useState<number>(0)
    const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

    // Calculate time left
    React.useEffect(() => {
        if (!target && value === undefined) return

        const updateTimeLeft = () => {
            if (value !== undefined) {
                setTimeLeft(value)
                return
            }

            if (target) {
                const targetTime = new Date(target).getTime()
                const now = Date.now()
                const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))

                setTimeLeft(remaining)
                onUpdate?.(remaining)

                if (remaining === 0 && onComplete) {
                    onComplete()
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                    }
                }
            }
        }

        // Initial calculation
        updateTimeLeft()

        // Set up interval for target-based countdown
        if (target && value === undefined) {
            intervalRef.current = setInterval(updateTimeLeft, updateInterval)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [target, value, updateInterval, onComplete, onUpdate])

    // Format the display value
    const formatValue = (val: number): string => {
        if (formatter) {
            return formatter(val)
        }

        if (formatAsTime) {
            const hours = Math.floor(val / 3600)
            const minutes = Math.floor((val % 3600) / 60)
            const seconds = val % 60

            const pad = (num: number) => showLeadingZeros ? num.toString().padStart(2, '0') : num.toString()

            if (hours > 0) {
                return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            } else {
                return `${pad(minutes)}:${pad(seconds)}`
            }
        }

        const strVal = val.toString()
        return showLeadingZeros ? strVal.padStart(maxDigits, '0') : strVal
    }

    const displayValue = formatValue(timeLeft)
    const Comp = asChild ? Slot : 'span'

    return (
        <Comp
            className={cn(countdownVariants({ size, color }), className)}
            {...props}
        >
            <span style={{ '--value': timeLeft } as React.CSSProperties}>
                {displayValue}
            </span>
        </Comp>
    )
}

/**
 * MultiUnitCountdown component for displaying countdown with separate units.
 *
 * @example
 * ```tsx
 * <MultiUnitCountdown
 *   target={targetDate}
 *   units={['days', 'hours', 'minutes', 'seconds']}
 *   size="lg"
 *   showLabels
 * />
 * ```
 */
export interface MultiUnitCountdownProps extends Omit<CountdownProps, 'formatAsTime' | 'formatter'> {
    /**
     * Time units to display
     */
    units?: ('days' | 'hours' | 'minutes' | 'seconds')[]
    /**
     * Whether to show unit labels
     * @default true
     */
    showLabels?: boolean
    /**
     * Custom unit labels
     */
    unitLabels?: {
        days?: string
        hours?: string
        minutes?: string
        seconds?: string
    }
    /**
     * Separator between units
     * @default ':'
     */
    separator?: string
    /**
     * Custom props for unit containers
     */
    unitProps?: React.HTMLAttributes<HTMLDivElement>
}

function MultiUnitCountdown({
    className,
    target,
    units = ['hours', 'minutes', 'seconds'],
    showLabels = true,
    unitLabels = {
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds',
    },
    separator = ':',
    unitProps,
    onComplete,
    onUpdate,
    updateInterval = 1000,
    ...props
}: MultiUnitCountdownProps) {
    const [timeUnits, setTimeUnits] = React.useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    React.useEffect(() => {
        if (!target) return

        const updateTimeUnits = () => {
            const targetTime = new Date(target).getTime()
            const now = Date.now()
            const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))

            const days = Math.floor(remaining / 86400)
            const hours = Math.floor((remaining % 86400) / 3600)
            const minutes = Math.floor((remaining % 3600) / 60)
            const seconds = remaining % 60

            setTimeUnits({ days, hours, minutes, seconds })
            onUpdate?.(remaining)

            if (remaining === 0 && onComplete) {
                onComplete()
            }
        }

        updateTimeUnits()
        const interval = setInterval(updateTimeUnits, updateInterval)

        return () => clearInterval(interval)
    }, [target, updateInterval, onComplete, onUpdate])

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {units.map((unit, index) => (
                <React.Fragment key={unit}>
                    <div
                        className={cn('flex flex-col items-center', unitProps?.className)}
                        {...unitProps}
                    >
                        <Countdown
                            value={timeUnits[unit]}
                            showLeadingZeros
                            maxDigits={unit === 'days' ? 3 : 2}
                            {...props}
                        />
                        {showLabels && (
                            <div className="text-xs opacity-70 mt-1">
                                {unitLabels[unit]}
                            </div>
                        )}
                    </div>
                    {index < units.length - 1 && !showLabels && (
                        <span className={cn(countdownVariants({ size: props.size, color: props.color }))}>
                            {separator}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

/**
 * CircularCountdown component for circular progress countdown.
 *
 * @example
 * ```tsx
 * <CircularCountdown
 *   target={targetDate}
 *   size="lg"
 *   showProgress
 *   progressColor="primary"
 * />
 * ```
 */
export interface CircularCountdownProps extends CountdownProps {
    /**
     * Whether to show circular progress
     * @default false
     */
    showProgress?: boolean
    /**
     * Progress circle color
     */
    progressColor?: string
    /**
     * Total duration for progress calculation (in seconds)
     */
    totalDuration?: number
}

function CircularCountdown({
    className,
    target,
    showProgress = false,
    progressColor = 'hsl(var(--p))',
    totalDuration,
    ...props
}: CircularCountdownProps) {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        if (!target || !totalDuration || !showProgress) return

        const updateProgress = () => {
            const targetTime = new Date(target).getTime()
            const now = Date.now()
            const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))
            const progressPercentage = Math.max(0, Math.min(100, ((totalDuration - remaining) / totalDuration) * 100))

            setProgress(progressPercentage)
        }

        updateProgress()
        const interval = setInterval(updateProgress, 1000)

        return () => clearInterval(interval)
    }, [target, totalDuration, showProgress])

    if (showProgress) {
        return (
            <div className={cn('relative inline-flex items-center justify-center', className)}>
                <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="opacity-20"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={progressColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${progress * 2.51327} 251.327`}
                        className="transition-all duration-300"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Countdown target={target} {...props} />
                </div>
            </div>
        )
    }

    return <Countdown target={target} className={className} {...props} />
}

export { Countdown, MultiUnitCountdown, CircularCountdown, countdownVariants }
