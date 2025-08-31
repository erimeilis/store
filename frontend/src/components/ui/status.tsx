import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusVariants = cva(
    'inline-flex items-center gap-2',
    {
        variants: {
            // Size variants
            size: {
                xs: 'text-xs',
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
            },
            // Status type variants
            variant: {
                default: '',
                dot: '',
                badge: '',
                icon: '',
            },
        },
        defaultVariants: {
            size: 'sm',
            variant: 'dot',
        },
    }
)

const statusDotVariants = cva(
    'rounded-full flex-shrink-0',
    {
        variants: {
            // Size variants
            size: {
                xs: 'w-1.5 h-1.5',
                sm: 'w-2 h-2',
                md: 'w-2.5 h-2.5',
                lg: 'w-3 h-3',
            },
            // Color variants
            color: {
                default: 'bg-base-content',
                primary: 'bg-primary',
                secondary: 'bg-secondary',
                accent: 'bg-accent',
                neutral: 'bg-neutral',
                info: 'bg-info',
                success: 'bg-success',
                warning: 'bg-warning',
                error: 'bg-error',
                online: 'bg-success',
                offline: 'bg-base-300',
                away: 'bg-warning',
                busy: 'bg-error',
                idle: 'bg-accent',
            },
            // Animation variants
            animated: {
                none: '',
                pulse: 'animate-pulse',
                ping: 'animate-ping',
                bounce: 'animate-bounce',
            },
        },
        defaultVariants: {
            size: 'sm',
            color: 'default',
            animated: 'none',
        },
    }
)

export interface StatusProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof statusVariants> {
    /**
     * Status label/text
     */
    label?: React.ReactNode
    /**
     * Status color
     */
    color?: 'default' | 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'online' | 'offline' | 'away' | 'busy' | 'idle'
    /**
     * Custom icon to display
     */
    icon?: React.ReactNode
    /**
     * Whether to animate the status indicator
     * @default false
     */
    animated?: boolean
    /**
     * Animation type
     */
    animation?: 'pulse' | 'ping' | 'bounce'
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Status component for displaying status indicators with labels.
 *
 * Provides flexible status display with dots, badges, icons, and labels.
 * Perfect for showing connection states, user presence, system health,
 * and other status information in telecommunications applications.
 *
 * @example
 * ```tsx
 * <Status
 *   variant="dot"
 *   color="online"
 *   label="Online"
 *   animated
 *   animation="pulse"
 * />
 * ```
 */
function Status({
    className,
    size,
    variant,
    label,
    color = 'default',
    icon,
    animated = false,
    animation = 'pulse',
    asChild = false,
    ...props
}: StatusProps) {
    const Comp = asChild ? Slot : 'span'

    const renderIndicator = () => {
        switch (variant) {
            case 'dot':
                return (
                    <div
                        className={cn(
                            statusDotVariants({
                                size,
                                color,
                                animated: animated ? animation : 'none'
                            })
                        )}
                    />
                )
            case 'badge': {
                const badgeColorMap = {
                    default: 'badge',
                    primary: 'badge badge-primary',
                    secondary: 'badge badge-secondary',
                    accent: 'badge badge-accent',
                    neutral: 'badge badge-neutral',
                    info: 'badge badge-info',
                    success: 'badge badge-success',
                    warning: 'badge badge-warning',
                    error: 'badge badge-error',
                    online: 'badge badge-success',
                    offline: 'badge badge-neutral',
                    away: 'badge badge-warning',
                    busy: 'badge badge-error',
                    idle: 'badge badge-accent',
                }
                return (
                    <div className={cn(badgeColorMap[color], 'badge-xs')}>
                        {label}
                    </div>
                )
            }
            case 'icon':
                return icon && (
                    <div className={cn(
                        'flex-shrink-0',
                        animated && animation === 'pulse' && 'animate-pulse',
                        animated && animation === 'ping' && 'animate-ping',
                        animated && animation === 'bounce' && 'animate-bounce'
                    )}>
                        {icon}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <Comp
            className={cn(statusVariants({ size, variant }), className)}
            {...props}
        >
            {renderIndicator()}
            {variant !== 'badge' && label && (
                <span className="font-medium">{label}</span>
            )}
        </Comp>
    )
}

/**
 * ConnectionStatus component for network/connection status display.
 *
 * @example
 * ```tsx
 * <ConnectionStatus
 *   status="connected"
 *   signal={4}
 *   showSignalBars
 *   animated
 * />
 * ```
 */
export interface ConnectionStatusProps extends Omit<StatusProps, 'color' | 'label'> {
    /**
     * Connection status
     */
    status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'weak'
    /**
     * Signal strength (1-5 bars)
     */
    signal?: 1 | 2 | 3 | 4 | 5
    /**
     * Whether to show signal strength bars
     * @default false
     */
    showSignalBars?: boolean
    /**
     * Custom status labels
     */
    statusLabels?: {
        connected?: string
        connecting?: string
        disconnected?: string
        error?: string
        weak?: string
    }
}

function ConnectionStatus({
    status,
    signal,
    showSignalBars = false,
    statusLabels = {
        connected: 'Connected',
        connecting: 'Connecting...',
        disconnected: 'Disconnected',
        error: 'Connection Error',
        weak: 'Weak Signal',
    },
    animated,
    ...props
}: ConnectionStatusProps) {
    const statusColorMap = {
        connected: 'success' as const,
        connecting: 'warning' as const,
        disconnected: 'neutral' as const,
        error: 'error' as const,
        weak: 'warning' as const,
    }

    const SignalBars = signal && showSignalBars ? (
        <div className="flex items-end gap-0.5 ml-1">
            {Array.from({ length: 5 }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        'w-1 bg-current transition-opacity',
                        `h-${i + 1}`,
                        i < signal ? 'opacity-100' : 'opacity-30'
                    )}
                />
            ))}
        </div>
    ) : null

    return (
        <div className="flex items-center gap-2">
            <Status
                color={statusColorMap[status]}
                label={statusLabels[status]}
                animated={animated && status === 'connecting'}
                animation="pulse"
                {...props}
            />
            {SignalBars}
        </div>
    )
}

/**
 * ServiceStatus component for system/service health display.
 *
 * @example
 * ```tsx
 * <ServiceStatus
 *   service="API Gateway"
 *   status="operational"
 *   uptime="99.9%"
 *   lastChecked={new Date()}
 * />
 * ```
 */
export interface ServiceStatusProps extends Omit<StatusProps, 'color' | 'label'> {
    /**
     * Service name
     */
    service: string
    /**
     * Service status
     */
    status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown'
    /**
     * Service uptime percentage
     */
    uptime?: string
    /**
     * Last check timestamp
     */
    lastChecked?: Date
    /**
     * Whether to show detailed info
     * @default false
     */
    showDetails?: boolean
}

function ServiceStatus({
    service,
    status,
    uptime,
    lastChecked,
    showDetails = false,
    ...props
}: ServiceStatusProps) {
    const statusConfig = {
        operational: { color: 'success' as const, label: 'Operational' },
        degraded: { color: 'warning' as const, label: 'Degraded Performance' },
        outage: { color: 'error' as const, label: 'Service Outage' },
        maintenance: { color: 'info' as const, label: 'Under Maintenance' },
        unknown: { color: 'neutral' as const, label: 'Status Unknown' },
    }

    const config = statusConfig[status]

    const formatTime = (date: Date) => {
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.ceil((date.getTime() - Date.now()) / (1000 * 60)),
            'minute'
        )
    }

    if (!showDetails) {
        return (
            <Status
                color={config.color}
                label={`${service}: ${config.label}`}
                {...props}
            />
        )
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <Status
                    color={config.color}
                    label={service}
                    size="md"
                    {...props}
                />
                <span className="text-sm font-medium">{config.label}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-base-content/70">
                {uptime && <span>Uptime: {uptime}</span>}
                {lastChecked && (
                    <span>Last checked {formatTime(lastChecked)}</span>
                )}
            </div>
        </div>
    )
}

/**
 * UserStatus component for user presence display.
 *
 * @example
 * ```tsx
 * <UserStatus
 *   status="online"
 *   username="John Doe"
 *   lastSeen={new Date()}
 *   showLastSeen
 * />
 * ```
 */
export interface UserStatusProps extends Omit<StatusProps, 'color' | 'label'> {
    /**
     * User presence status
     */
    status: 'online' | 'offline' | 'away' | 'busy' | 'idle'
    /**
     * Username to display
     */
    username?: string
    /**
     * Last seen timestamp
     */
    lastSeen?: Date
    /**
     * Whether to show last seen time
     * @default false
     */
    showLastSeen?: boolean
    /**
     * Custom status messages
     */
    statusMessages?: {
        online?: string
        offline?: string
        away?: string
        busy?: string
        idle?: string
    }
}

function UserStatus({
    status,
    username,
    lastSeen,
    showLastSeen = false,
    statusMessages = {
        online: 'Online',
        offline: 'Offline',
        away: 'Away',
        busy: 'Busy',
        idle: 'Idle',
    },
    animated,
    ...props
}: UserStatusProps) {
    const formatLastSeen = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div className="flex items-center justify-between">
            <Status
                color={status}
                label={username ? `${username} - ${statusMessages[status]}` : statusMessages[status]}
                animated={animated && status === 'online'}
                animation="pulse"
                {...props}
            />
            {showLastSeen && lastSeen && status === 'offline' && (
                <span className="text-xs text-base-content/70">
                    {formatLastSeen(lastSeen)}
                </span>
            )}
        </div>
    )
}

/**
 * StatusList component for displaying multiple status items.
 *
 * @example
 * ```tsx
 * <StatusList
 *   title="System Status"
 *   items={[
 *     { id: '1', service: 'API', status: 'operational' },
 *     { id: '2', service: 'Database', status: 'degraded' },
 *   ]}
 * />
 * ```
 */
export interface StatusListItem {
    id: string
    service: string
    status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown'
    description?: string
    uptime?: string
}

export interface StatusListProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * List title
     */
    title?: string
    /**
     * Status items
     */
    items: StatusListItem[]
    /**
     * Whether to show uptime information
     * @default false
     */
    showUptime?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function StatusList({
    className,
    title,
    items,
    showUptime = false,
    asChild = false,
    ...props
}: StatusListProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp className={cn('space-y-4', className)} {...props}>
            {title && (
                <h3 className="text-lg font-semibold">{title}</h3>
            )}

            <div className="space-y-2">
                {items.map((item) => (
                    <ServiceStatus
                        key={item.id}
                        service={item.service}
                        status={item.status}
                        uptime={item.uptime}
                        showDetails={showUptime}
                    />
                ))}
            </div>
        </Comp>
    )
}

export {
    Status,
    ConnectionStatus,
    ServiceStatus,
    UserStatus,
    StatusList,
    statusVariants,
    statusDotVariants
}
