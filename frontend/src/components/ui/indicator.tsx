import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const indicatorVariants = cva(
    'indicator',
    {
        variants: {},
        defaultVariants: {},
    }
)

const indicatorItemVariants = cva(
    'indicator-item',
    {
        variants: {
            // Position variants
            position: {
                'top-start': 'indicator-top indicator-start',
                'top-center': 'indicator-top indicator-center',
                'top-end': 'indicator-top indicator-end',
                'middle-start': 'indicator-middle indicator-start',
                'middle-center': 'indicator-middle indicator-center',
                'middle-end': 'indicator-middle indicator-end',
                'bottom-start': 'indicator-bottom indicator-start',
                'bottom-center': 'indicator-bottom indicator-center',
                'bottom-end': 'indicator-bottom indicator-end',
            },
            // Badge variants (when used as badge)
            badge: {
                none: '',
                default: 'badge',
                primary: 'badge badge-primary',
                secondary: 'badge badge-secondary',
                accent: 'badge badge-accent',
                neutral: 'badge badge-neutral',
                info: 'badge badge-info',
                success: 'badge badge-success',
                warning: 'badge badge-warning',
                error: 'badge badge-error',
            },
            // Size variants (for badge indicators)
            size: {
                xs: 'badge-xs',
                sm: 'badge-sm',
                md: 'badge-md',
                lg: 'badge-lg',
            },
        },
        defaultVariants: {
            position: 'top-end',
            badge: 'none',
            size: 'sm',
        },
    }
)

export interface IndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The main content that the indicator will be positioned relative to
     */
    children: React.ReactNode
    /**
     * The indicator items (badges, dots, etc.)
     */
    indicators?: React.ReactNode[]
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Indicator component for positioning badges, notifications, and status markers.
 *
 * Based on DaisyUI's indicator component with support for flexible positioning
 * and multiple indicator items. Perfect for notification badges, status dots,
 * and highlighting elements with overlays.
 *
 * @example
 * ```tsx
 * <Indicator
 *   indicators={[
 *     <IndicatorItem position="top-end" badge="error">5</IndicatorItem>
 *   ]}
 * >
 *   <Button>Messages</Button>
 * </Indicator>
 * ```
 */
function Indicator({
    className,
    children,
    indicators = [],
    asChild = false,
    ...props
}: IndicatorProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(indicatorVariants(), className)}
            {...props}
        >
            {indicators.map((indicator, index) => (
                <React.Fragment key={index}>
                    {indicator}
                </React.Fragment>
            ))}
            {children}
        </Comp>
    )
}

/**
 * IndicatorItem component for individual indicator elements.
 *
 * @example
 * ```tsx
 * <Indicator>
 *   <IndicatorItem position="top-end" badge="error" size="sm">
 *     3
 *   </IndicatorItem>
 *   <Avatar src="/user.jpg" />
 * </Indicator>
 * ```
 */
export interface IndicatorItemProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
        VariantProps<typeof indicatorItemVariants> {
    /**
     * Indicator content
     */
    children?: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function IndicatorItem({
    className,
    position,
    badge,
    size,
    children,
    asChild = false,
    ...props
}: IndicatorItemProps) {
    const Comp = asChild ? Slot : 'span'

    return (
        <Comp
            className={cn(
                indicatorItemVariants({ position, badge, size }),
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * NotificationIndicator component for notification badges.
 *
 * @example
 * ```tsx
 * <NotificationIndicator
 *   count={5}
 *   maxCount={99}
 *   color="error"
 *   position="top-end"
 * >
 *   <Button>Messages</Button>
 * </NotificationIndicator>
 * ```
 */
export interface NotificationIndicatorProps extends Omit<IndicatorProps, 'indicators'> {
    /**
     * Notification count
     */
    count?: number
    /**
     * Maximum count to display (shows "maxCount+" when exceeded)
     */
    maxCount?: number
    /**
     * Whether to show indicator when count is 0
     * @default false
     */
    showZero?: boolean
    /**
     * Indicator color theme
     */
    color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Indicator position
     */
    position?: VariantProps<typeof indicatorItemVariants>['position']
    /**
     * Indicator size
     */
    size?: VariantProps<typeof indicatorItemVariants>['size']
    /**
     * Custom dot indicator when no count provided
     */
    showDot?: boolean
    /**
     * Custom indicator content (overrides count)
     */
    indicatorContent?: React.ReactNode
}

function NotificationIndicator({
    count,
    maxCount = 99,
    showZero = false,
    color = 'error',
    position = 'top-end',
    size = 'sm',
    showDot = false,
    indicatorContent,
    children,
    ...props
}: NotificationIndicatorProps) {
    const shouldShow = indicatorContent !== undefined ||
                      showDot ||
                      (count !== undefined && (count > 0 || showZero))

    if (!shouldShow) {
        return <>{children}</>
    }

    let content: React.ReactNode = null

    if (indicatorContent !== undefined) {
        content = indicatorContent
    } else if (showDot && count === undefined) {
        content = null // Empty badge for dot indicator
    } else if (count !== undefined) {
        content = maxCount && count > maxCount ? `${maxCount}+` : count
    }

    const indicators = [
        <IndicatorItem
            key="notification"
            position={position}
            badge={color}
            size={size}
        >
            {content}
        </IndicatorItem>
    ]

    return (
        <Indicator indicators={indicators} {...props}>
            {children}
        </Indicator>
    )
}

/**
 * StatusIndicator component for status dots and markers.
 *
 * @example
 * ```tsx
 * <StatusIndicator
 *   status="online"
 *   position="bottom-end"
 *   size="md"
 * >
 *   <Avatar src="/user.jpg" />
 * </StatusIndicator>
 * ```
 */
export interface StatusIndicatorProps extends Omit<IndicatorProps, 'indicators'> {
    /**
     * Status type
     */
    status?: 'online' | 'offline' | 'away' | 'busy' | 'neutral'
    /**
     * Custom status color
     */
    statusColor?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Indicator position
     */
    position?: VariantProps<typeof indicatorItemVariants>['position']
    /**
     * Indicator size
     */
    size?: VariantProps<typeof indicatorItemVariants>['size']
    /**
     * Whether to add a border to the status indicator
     * @default true
     */
    bordered?: boolean
    /**
     * Whether to animate the status indicator
     * @default false
     */
    animated?: boolean
}

function StatusIndicator({
    status = 'neutral',
    statusColor,
    position = 'bottom-end',
    size = 'sm',
    bordered = true,
    animated = false,
    children,
    ...props
}: StatusIndicatorProps) {
    const statusColorMap = {
        online: 'success',
        offline: 'neutral',
        away: 'warning',
        busy: 'error',
        neutral: 'neutral',
    } as const

    const effectiveColor = statusColor || statusColorMap[status]

    const indicators = [
        <IndicatorItem
            key="status"
            position={position}
            badge={effectiveColor}
            size={size}
            className={cn(
                'rounded-full',
                bordered && 'border-2 border-base-100',
                animated && status === 'online' && 'animate-pulse'
            )}
        />
    ]

    return (
        <Indicator indicators={indicators} {...props}>
            {children}
        </Indicator>
    )
}

/**
 * MultiIndicator component for multiple indicator items.
 *
 * @example
 * ```tsx
 * <MultiIndicator
 *   indicators={[
 *     { type: 'notification', count: 5, position: 'top-end' },
 *     { type: 'status', status: 'online', position: 'bottom-end' }
 *   ]}
 * >
 *   <Avatar src="/user.jpg" />
 * </MultiIndicator>
 * ```
 */
export interface MultiIndicatorItem {
    type: 'notification' | 'status' | 'custom'
    // Notification props
    count?: number
    maxCount?: number
    showZero?: boolean
    // Status props
    status?: 'online' | 'offline' | 'away' | 'busy' | 'neutral'
    // Common props
    color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'
    position?: VariantProps<typeof indicatorItemVariants>['position']
    size?: VariantProps<typeof indicatorItemVariants>['size']
    // Custom content
    content?: React.ReactNode
    className?: string
}

export interface MultiIndicatorProps extends Omit<IndicatorProps, 'indicators'> {
    /**
     * Array of indicator configurations
     */
    indicators: MultiIndicatorItem[]
}

function MultiIndicator({
    indicators: indicatorConfigs,
    children,
    ...props
}: MultiIndicatorProps) {
    const indicators = indicatorConfigs.map((config, index) => {
        const {
            type,
            count,
            maxCount,
            showZero,
            status,
            color,
            position,
            size,
            content,
            className
        } = config

        if (type === 'notification') {
            const shouldShow = content !== undefined ||
                              (count !== undefined && (count > 0 || showZero))

            if (!shouldShow) return null

            let notificationContent: React.ReactNode = null
            if (content !== undefined) {
                notificationContent = content
            } else if (count !== undefined) {
                notificationContent = maxCount && count > maxCount ? `${maxCount}+` : count
            }

            return (
                <IndicatorItem
                    key={index}
                    position={position}
                    badge={color || 'error'}
                    size={size}
                    className={className}
                >
                    {notificationContent}
                </IndicatorItem>
            )
        }

        if (type === 'status') {
            const statusColorMap = {
                online: 'success',
                offline: 'neutral',
                away: 'warning',
                busy: 'error',
                neutral: 'neutral',
            } as const

            const effectiveColor = color || statusColorMap[status || 'neutral']

            return (
                <IndicatorItem
                    key={index}
                    position={position}
                    badge={effectiveColor}
                    size={size}
                    className={cn(
                        'rounded-full border-2 border-base-100',
                        status === 'online' && 'animate-pulse',
                        className
                    )}
                />
            )
        }

        if (type === 'custom') {
            return (
                <IndicatorItem
                    key={index}
                    position={position}
                    className={className}
                >
                    {content}
                </IndicatorItem>
            )
        }

        return null
    }).filter(Boolean)

    return (
        <Indicator indicators={indicators} {...props}>
            {children}
        </Indicator>
    )
}

export {
    Indicator,
    IndicatorItem,
    NotificationIndicator,
    StatusIndicator,
    MultiIndicator,
    indicatorVariants,
    indicatorItemVariants
}
