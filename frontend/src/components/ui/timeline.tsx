import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const timelineVariants = cva(
    'timeline',
    {
        variants: {
            // Orientation variants
            orientation: {
                vertical: 'timeline-vertical',
                horizontal: 'timeline-horizontal',
            },
            // Alignment variants (for vertical timeline)
            align: {
                start: 'timeline-start',
                center: 'timeline-center',
                end: 'timeline-end',
            },
            // Snap variants
            snap: {
                none: '',
                start: 'timeline-snap-start',
                center: 'timeline-snap-center',
                end: 'timeline-snap-end',
            },
        },
        defaultVariants: {
            orientation: 'vertical',
            align: 'start',
            snap: 'none',
        },
    }
)

export interface TimelineEvent {
    /**
     * Unique identifier for the event
     */
    id: string
    /**
     * Event title
     */
    title: React.ReactNode
    /**
     * Event description/content
     */
    description?: React.ReactNode
    /**
     * Event timestamp or date
     */
    timestamp?: React.ReactNode
    /**
     * Custom icon for the event
     */
    icon?: React.ReactNode
    /**
     * Event status/type for styling
     */
    status?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
    /**
     * Custom props for the timeline item
     */
    itemProps?: React.HTMLAttributes<HTMLLIElement>
}

export interface TimelineProps
    extends React.HTMLAttributes<HTMLUListElement>,
        VariantProps<typeof timelineVariants> {
    /**
     * Array of timeline events
     */
    events: TimelineEvent[]
    /**
     * Whether to show timestamps
     * @default true
     */
    showTimestamps?: boolean
    /**
     * Whether to show icons
     * @default true
     */
    showIcons?: boolean
    /**
     * Default icon to use when no custom icon is provided
     */
    defaultIcon?: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Timeline component for displaying chronological events and processes.
 *
 * Based on DaisyUI's timeline component with support for vertical/horizontal
 * orientations, custom icons, timestamps, and different event statuses.
 * Perfect for order tracking, service history, and activity feeds.
 *
 * @example
 * ```tsx
 * const events = [
 *   {
 *     id: '1',
 *     title: 'Order Placed',
 *     description: 'Your order has been received',
 *     timestamp: '2023-01-01 10:00 AM',
 *     status: 'success'
 *   },
 *   {
 *     id: '2',
 *     title: 'Processing',
 *     description: 'Order is being prepared',
 *     timestamp: '2023-01-01 11:30 AM',
 *     status: 'primary'
 *   }
 * ]
 *
 * <Timeline
 *   events={events}
 *   orientation="vertical"
 *   showTimestamps
 * />
 * ```
 */
function Timeline({
    className,
    orientation,
    align,
    snap,
    events,
    showTimestamps = true,
    showIcons = true,
    defaultIcon,
    asChild = false,
    ...props
}: TimelineProps) {
    const Comp = asChild ? Slot : 'ul'

    return (
        <Comp
            className={cn(timelineVariants({ orientation, align, snap }), className)}
            {...props}
        >
            {events.map((event, index) => {
                const isLast = index === events.length - 1
                const statusColorMap = {
                    default: 'text-base-content',
                    primary: 'text-primary',
                    secondary: 'text-secondary',
                    accent: 'text-accent',
                    success: 'text-success',
                    warning: 'text-warning',
                    error: 'text-error',
                    info: 'text-info',
                }

                const iconColorClass = statusColorMap[event.status || 'default']

                return (
                    <li
                        key={event.id}
                        className={cn('timeline-item', event.itemProps?.className)}
                        {...event.itemProps}
                    >
                        {/* Timeline start (timestamp) */}
                        {showTimestamps && event.timestamp && (
                            <div className="timeline-start timeline-box">
                                {event.timestamp}
                            </div>
                        )}

                        {/* Timeline middle (icon) */}
                        {showIcons && (
                            <div className="timeline-middle">
                                <div className={cn('timeline-icon', iconColorClass)}>
                                    {event.icon || defaultIcon || (
                                        <div className="w-4 h-4 rounded-full bg-current" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Timeline end (content) */}
                        <div className="timeline-end timeline-box">
                            <div className="font-semibold">
                                {event.title}
                            </div>
                            {event.description && (
                                <div className="text-sm opacity-70 mt-1">
                                    {event.description}
                                </div>
                            )}
                        </div>

                        {/* Connector line (hidden for last item) */}
                        {!isLast && <hr className="timeline-hr" />}
                    </li>
                )
            })}
        </Comp>
    )
}

/**
 * SimpleTimeline component for basic timeline display without complex data structure.
 *
 * @example
 * ```tsx
 * <SimpleTimeline orientation="vertical">
 *   <TimelineItem timestamp="10:00 AM" status="success">
 *     Order Placed
 *   </TimelineItem>
 *   <TimelineItem timestamp="11:30 AM" status="primary">
 *     Processing Order
 *   </TimelineItem>
 * </SimpleTimeline>
 * ```
 */
export interface SimpleTimelineProps
    extends Omit<TimelineProps, 'events' | 'showTimestamps' | 'showIcons'> {
    /**
     * Timeline items as children
     */
    children: React.ReactNode
}

function SimpleTimeline({
    className,
    orientation,
    align,
    snap,
    children,
    asChild = false,
    ...props
}: SimpleTimelineProps) {
    const Comp = asChild ? Slot : 'ul'

    return (
        <Comp
            className={cn(timelineVariants({ orientation, align, snap }), className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * TimelineItem component for individual timeline entries.
 *
 * @example
 * ```tsx
 * <TimelineItem
 *   timestamp="10:00 AM"
 *   icon={<CheckIcon />}
 *   status="success"
 *   description="Order confirmed"
 * >
 *   Order Placed
 * </TimelineItem>
 * ```
 */
export interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
    /**
     * Item content/title
     */
    children: React.ReactNode
    /**
     * Item timestamp
     */
    timestamp?: React.ReactNode
    /**
     * Item description
     */
    description?: React.ReactNode
    /**
     * Custom icon
     */
    icon?: React.ReactNode
    /**
     * Item status for styling
     */
    status?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
    /**
     * Whether to show timestamp
     * @default true
     */
    showTimestamp?: boolean
    /**
     * Whether to show icon
     * @default true
     */
    showIcon?: boolean
    /**
     * Whether this is the last item (affects connector display)
     */
    isLast?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function TimelineItem({
    className,
    children,
    timestamp,
    description,
    icon,
    status = 'default',
    showTimestamp = true,
    showIcon = true,
    isLast = false,
    asChild = false,
    ...props
}: TimelineItemProps) {
    const Comp = asChild ? Slot : 'li'

    const statusColorMap = {
        default: 'text-base-content',
        primary: 'text-primary',
        secondary: 'text-secondary',
        accent: 'text-accent',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        info: 'text-info',
    }

    const iconColorClass = statusColorMap[status]

    return (
        <Comp
            className={cn('timeline-item', className)}
            {...props}
        >
            {/* Timeline start (timestamp) */}
            {showTimestamp && timestamp && (
                <div className="timeline-start timeline-box">
                    {timestamp}
                </div>
            )}

            {/* Timeline middle (icon) */}
            {showIcon && (
                <div className="timeline-middle">
                    <div className={cn('timeline-icon', iconColorClass)}>
                        {icon || <div className="w-4 h-4 rounded-full bg-current" />}
                    </div>
                </div>
            )}

            {/* Timeline end (content) */}
            <div className="timeline-end timeline-box">
                <div className="font-semibold">
                    {children}
                </div>
                {description && (
                    <div className="text-sm opacity-70 mt-1">
                        {description}
                    </div>
                )}
            </div>

            {/* Connector line (hidden for last item) */}
            {!isLast && <hr className="timeline-hr" />}
        </Comp>
    )
}

/**
 * CompactTimeline component for condensed timeline display.
 *
 * @example
 * ```tsx
 * <CompactTimeline
 *   events={events}
 *   maxItems={5}
 *   showMoreText="View all events"
 * />
 * ```
 */
export interface CompactTimelineProps extends TimelineProps {
    /**
     * Maximum number of items to show initially
     */
    maxItems?: number
    /**
     * Text for show more button
     */
    showMoreText?: string
    /**
     * Text for show less button
     */
    showLessText?: string
    /**
     * Custom show more button props
     */
    showMoreProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

function CompactTimeline({
    events,
    maxItems = 3,
    showMoreText = 'Show more',
    showLessText = 'Show less',
    showMoreProps,
    ...props
}: CompactTimelineProps) {
    const [expanded, setExpanded] = React.useState(false)
    const displayEvents = expanded ? events : events.slice(0, maxItems)
    const hasMore = events.length > maxItems

    return (
        <div className="space-y-4">
            <Timeline
                events={displayEvents}
                {...props}
            />

            {hasMore && (
                <div className="text-center">
                    <button
                        type="button"
                        className={cn('btn btn-outline btn-sm', showMoreProps?.className)}
                        onClick={() => setExpanded(!expanded)}
                        {...showMoreProps}
                    >
                        {expanded ? showLessText : showMoreText}
                    </button>
                </div>
            )}
        </div>
    )
}

export {
    Timeline,
    SimpleTimeline,
    TimelineItem,
    CompactTimeline,
    timelineVariants
}
