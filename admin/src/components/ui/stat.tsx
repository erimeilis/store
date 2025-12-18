import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statsVariants = cva(
    'stats',
    {
        variants: {
            // Direction variants
            direction: {
                horizontal: '',
                vertical: 'stats-vertical',
            },
            // Shadow variants
            shadow: {
                none: '',
                sm: 'shadow-sm',
                md: 'shadow-md',
                lg: 'shadow-lg',
                xl: 'shadow-xl',
            },
        },
        defaultVariants: {
            direction: 'horizontal',
            shadow: 'none',
        },
    }
)

const statVariants = cva(
    'stat',
    {
        variants: {
            // Background variants
            background: {
                none: '',
                base100: 'bg-base-100',
                base200: 'bg-base-200',
                base300: 'bg-base-300',
                primary: 'bg-primary text-primary-content',
                secondary: 'bg-secondary text-secondary-content',
                accent: 'bg-accent text-accent-content',
                neutral: 'bg-neutral text-neutral-content',
                info: 'bg-info text-info-content',
                success: 'bg-success text-success-content',
                warning: 'bg-warning text-warning-content',
                error: 'bg-error text-error-content',
            },
        },
        defaultVariants: {
            background: 'none',
        },
    }
)

const statTitleVariants = cva(
    'stat-title',
    {
        variants: {
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
            color: 'default',
        },
    }
)

const statValueVariants = cva(
    'stat-value',
    {
        variants: {
            // Size variants
            size: {
                sm: 'text-2xl',
                md: 'text-4xl',
                lg: 'text-5xl',
                xl: 'text-6xl',
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
            size: 'md',
            color: 'default',
        },
    }
)

const statDescVariants = cva(
    'stat-desc',
    {
        variants: {
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
            color: 'default',
        },
    }
)

export interface StatItem {
    /**
     * Unique identifier for the stat
     */
    id: string
    /**
     * Stat title/label
     */
    title: React.ReactNode
    /**
     * Main stat value
     */
    value: React.ReactNode
    /**
     * Optional description or change indicator
     */
    description?: React.ReactNode
    /**
     * Optional figure/icon
     */
    figure?: React.ReactNode
    /**
     * Stat background color
     */
    background?: VariantProps<typeof statVariants>['background']
    /**
     * Title color
     */
    titleColor?: VariantProps<typeof statTitleVariants>['color']
    /**
     * Value color
     */
    valueColor?: VariantProps<typeof statValueVariants>['color']
    /**
     * Value size
     */
    valueSize?: VariantProps<typeof statValueVariants>['size']
    /**
     * Description color
     */
    descriptionColor?: VariantProps<typeof statDescVariants>['color']
    /**
     * Custom stat props
     */
    statProps?: React.HTMLAttributes<HTMLDivElement>
}

export interface StatsProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof statsVariants> {
    /**
     * Array of stat items
     */
    stats: StatItem[]
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Stats component for displaying statistics and metrics.
 *
 * Based on DaisyUI's stats component with support for horizontal/vertical
 * layouts, different colors, figures, and comprehensive stat information.
 * Perfect for dashboards, analytics, and displaying key metrics in
 * telecommunications applications.
 *
 * @example
 * ```tsx
 * const statsData = [
 *   {
 *     id: '1',
 *     title: 'Total Users',
 *     value: '89,400',
 *     description: '21% more than last month',
 *     background: 'primary'
 *   },
 *   {
 *     id: '2',
 *     title: 'Active Sessions',
 *     value: '2,100',
 *     description: 'Currently online',
 *     valueColor: 'success'
 *   }
 * ]
 *
 * <Stats
 *   stats={statsData}
 *   direction="horizontal"
 *   shadow="lg"
 * />
 * ```
 */
function Stats({
    className,
    direction,
    shadow,
    stats,
    asChild = false,
    ...props
}: StatsProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(statsVariants({ direction, shadow }), className)}
            {...props}
        >
            {stats.map((stat) => (
                <Stat
                    key={stat.id}
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    figure={stat.figure}
                    background={stat.background}
                    titleColor={stat.titleColor}
                    valueColor={stat.valueColor}
                    valueSize={stat.valueSize}
                    descriptionColor={stat.descriptionColor}
                    {...stat.statProps}
                />
            ))}
        </Comp>
    )
}

/**
 * Individual Stat component for single stat display.
 *
 * @example
 * ```tsx
 * <Stat
 *   title="Downloads"
 *   value="31K"
 *   description="Jan 1st - Feb 1st"
 *   background="info"
 *   figure={<DownloadIcon />}
 * />
 * ```
 */
export interface StatProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
        VariantProps<typeof statVariants> {
    /**
     * Stat title/label
     */
    title: React.ReactNode
    /**
     * Main stat value
     */
    value: React.ReactNode
    /**
     * Optional description
     */
    description?: React.ReactNode
    /**
     * Optional figure/icon
     */
    figure?: React.ReactNode
    /**
     * Title color
     */
    titleColor?: VariantProps<typeof statTitleVariants>['color']
    /**
     * Value color
     */
    valueColor?: VariantProps<typeof statValueVariants>['color']
    /**
     * Value size
     */
    valueSize?: VariantProps<typeof statValueVariants>['size']
    /**
     * Description color
     */
    descriptionColor?: VariantProps<typeof statDescVariants>['color']
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Stat({
    className,
    background,
    title,
    value,
    description,
    figure,
    titleColor,
    valueColor,
    valueSize,
    descriptionColor,
    asChild = false,
    ...props
}: StatProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(statVariants({ background }), className)}
            {...props}
        >
            {/* Stat Figure */}
            {figure && (
                <div className="stat-figure text-secondary">
                    {figure}
                </div>
            )}

            {/* Stat Title */}
            <div className={cn(statTitleVariants({ color: titleColor }))}>
                {title}
            </div>

            {/* Stat Value */}
            <div className={cn(statValueVariants({ size: valueSize, color: valueColor }))}>
                {value}
            </div>

            {/* Stat Description */}
            {description && (
                <div className={cn(statDescVariants({ color: descriptionColor }))}>
                    {description}
                </div>
            )}
        </Comp>
    )
}

/**
 * StatCard component for card-style stat display.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Revenue"
 *   value="$12,628"
 *   description="+4.75% from last week"
 *   icon={<DollarIcon />}
 *   trend="up"
 * />
 * ```
 */
export interface StatCardProps extends Omit<StatProps, 'figure'> {
    /**
     * Card icon
     */
    icon?: React.ReactNode
    /**
     * Trend direction
     */
    trend?: 'up' | 'down' | 'neutral'
    /**
     * Card border
     */
    bordered?: boolean
    /**
     * Card padding
     */
    padding?: 'sm' | 'md' | 'lg'
}

function StatCard({
    className,
    title,
    value,
    description,
    icon,
    trend,
    bordered = true,
    padding = 'md',
    background = 'base100',
    ...props
}: StatCardProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    const trendColors = {
        up: 'success',
        down: 'error',
        neutral: 'default',
    } as const

    const trendColor = trend ? trendColors[trend] : 'default'

    return (
        <div
            className={cn(
                'stats shadow',
                bordered && 'border border-base-300',
                paddingClasses[padding],
                className
            )}
        >
            <Stat
                title={title}
                value={value}
                description={description}
                figure={icon}
                background={background}
                descriptionColor={trendColor}
                {...props}
            />
        </div>
    )
}

/**
 * MetricCard component specifically for telecommunications metrics.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   metric="Data Usage"
 *   value="15.2"
 *   unit="GB"
 *   change="+12%"
 *   changeType="positive"
 *   period="This month"
 * />
 * ```
 */
export interface MetricCardProps extends Omit<StatCardProps, 'title' | 'value' | 'description'> {
    /**
     * Metric name
     */
    metric: string
    /**
     * Metric value (number or string)
     */
    value: string | number
    /**
     * Value unit (GB, MB, minutes, calls, etc.)
     */
    unit?: string
    /**
     * Change indicator (+/-percentage or value)
     */
    change?: string
    /**
     * Type of change for styling
     */
    changeType?: 'positive' | 'negative' | 'neutral'
    /**
     * Time period for the metric
     */
    period?: string
    /**
     * Metric icon
     */
    metricIcon?: React.ReactNode
    /**
     * Whether to format large numbers
     * @default true
     */
    formatValue?: boolean
}

function MetricCard({
    metric,
    value,
    unit,
    change,
    changeType = 'neutral',
    period,
    metricIcon,
    formatValue = true,
    ...props
}: MetricCardProps) {
    const formatNumber = (num: string | number): string => {
        if (!formatValue) return num.toString()

        const numValue = typeof num === 'string' ? parseFloat(num) : num
        if (isNaN(numValue)) return num.toString()

        if (numValue >= 1000000) {
            return (numValue / 1000000).toFixed(1) + 'M'
        } else if (numValue >= 1000) {
            return (numValue / 1000).toFixed(1) + 'K'
        }
        return numValue.toString()
    }

    const displayValue = formatValue ? formatNumber(value) : value
    const fullValue = unit ? `${displayValue} ${unit}` : displayValue

    const changeColorMap = {
        positive: 'success',
        negative: 'error',
        neutral: 'default',
    } as const

    const trendMap = {
        positive: 'up',
        negative: 'down',
        neutral: 'neutral',
    } as const

    const description = change && period
        ? `${change} ${period}`
        : change || period || undefined

    return (
        <StatCard
            title={metric}
            value={fullValue}
            description={description}
            icon={metricIcon}
            trend={trendMap[changeType]}
            descriptionColor={changeColorMap[changeType]}
            {...props}
        />
    )
}

export {
    Stats,
    Stat,
    StatCard,
    MetricCard,
    statsVariants,
    statVariants,
    statTitleVariants,
    statValueVariants,
    statDescVariants
}
