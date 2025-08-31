import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const skeletonVariants = cva(
    'skeleton',
    {
        variants: {
            // Shape variants
            shape: {
                default: '',
                circle: 'rounded-full',
                square: 'rounded-none',
                rounded: 'rounded',
                'rounded-lg': 'rounded-lg',
                'rounded-xl': 'rounded-xl',
            },
            // Animation variants
            animation: {
                default: '',
                pulse: 'animate-pulse',
                none: 'animate-none',
            },
        },
        defaultVariants: {
            shape: 'default',
            animation: 'default',
        },
    }
)

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
    width?: string | number
    height?: string | number
}

export interface SkeletonTextProps extends Omit<SkeletonProps, 'shape'> {
    lines?: number
    lineHeight?: string
    lastLineWidth?: string
}

export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'shape'> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
    showAvatar?: boolean
    showImage?: boolean
    textLines?: number
    imageHeight?: string
    avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * DaisyUI Skeleton Component
 *
 * A loading placeholder component that shows a shimmer animation
 * while content is being loaded. Supports various shapes and sizes.
 */
function Skeleton({
    className,
    shape,
    animation,
    width,
    height,
    style,
    ...props
}: SkeletonProps) {
    const skeletonStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
    }

    return (
        <div
            className={cn(skeletonVariants({shape, animation}), className)}
            style={skeletonStyle}
            {...props}
        />
    )
}

/**
 * Skeleton Text Component
 *
 * Creates multiple skeleton lines to simulate text content.
 */
function SkeletonText({
    className,
    animation,
    lines = 3,
    lineHeight = '1rem',
    lastLineWidth = '75%',
    ...props
}: SkeletonTextProps) {
    return (
        <div className={cn('space-y-2', className)} {...props}>
            {Array.from({length: lines}).map((_, index) => (
                <Skeleton
                    key={index}
                    animation={animation}
                    height={lineHeight}
                    width={index === lines - 1 ? lastLineWidth : '100%'}
                />
            ))}
        </div>
    )
}

/**
 * Skeleton Avatar Component
 *
 * Circular skeleton placeholder for avatar images.
 */
function SkeletonAvatar({
    className,
    animation,
    size = 'md',
    ...props
}: SkeletonAvatarProps) {
    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
    }

    return (
        <Skeleton
            shape="circle"
            animation={animation}
            className={cn(sizeClasses[size], className)}
            {...props}
        />
    )
}

/**
 * Skeleton Image Component
 *
 * Rectangular skeleton placeholder for images.
 */
function SkeletonImage({
    className,
    animation,
    width = '100%',
    height = '200px',
    ...props
}: Omit<SkeletonProps, 'shape'>) {
    return (
        <Skeleton
            shape="rounded"
            animation={animation}
            width={width}
            height={height}
            className={className}
            {...props}
        />
    )
}

/**
 * Skeleton Button Component
 *
 * Button-shaped skeleton placeholder.
 */
function SkeletonButton({
    className,
    animation,
    size = 'md',
    ...props
}: Omit<SkeletonProps, 'shape' | 'width' | 'height'> & {
    size?: 'sm' | 'md' | 'lg'
}) {
    const sizeClasses = {
        sm: 'h-8 w-20',
        md: 'h-10 w-24',
        lg: 'h-12 w-28',
    }

    return (
        <Skeleton
            shape="rounded"
            animation={animation}
            className={cn(sizeClasses[size], className)}
            {...props}
        />
    )
}

/**
 * Skeleton Card Component
 *
 * Complete card skeleton with optional avatar, image, and text lines.
 */
function SkeletonCard({
    className,
    showAvatar = false,
    showImage = false,
    textLines = 3,
    imageHeight = '200px',
    avatarSize = 'md',
    ...props
}: SkeletonCardProps) {
    return (
        <div className={cn('space-y-4', className)} {...props}>
            {showImage && (
                <SkeletonImage height={imageHeight} />
            )}

            {showAvatar && (
                <div className="flex items-center space-x-3">
                    <SkeletonAvatar size={avatarSize} />
                    <div className="flex-1">
                        <Skeleton height="1rem" width="60%" className="mb-2" />
                        <Skeleton height="0.875rem" width="40%" />
                    </div>
                </div>
            )}

            <SkeletonText lines={textLines} />
        </div>
    )
}

/**
 * Skeleton List Component
 *
 * List of skeleton items, useful for loading states in lists.
 */
function SkeletonList({
    items = 3,
    showAvatar = false,
    className,
    itemClassName,
    ...props
}: {
    items?: number
    showAvatar?: boolean
    className?: string
    itemClassName?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('space-y-4', className)} {...props}>
            {Array.from({length: items}).map((_, index) => (
                <div key={index} className={cn('flex items-center space-x-3', itemClassName)}>
                    {showAvatar && <SkeletonAvatar size="sm" />}
                    <div className="flex-1">
                        <Skeleton height="1rem" width="80%" className="mb-2" />
                        <Skeleton height="0.75rem" width="60%" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton Table Component
 *
 * Table skeleton with rows and columns.
 */
function SkeletonTable({
    rows = 3,
    columns = 4,
    className,
    showHeader = true,
    ...props
}: {
    rows?: number
    columns?: number
    className?: string
    showHeader?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('space-y-2', className)} {...props}>
            {showHeader && (
                <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${columns}, 1fr)`}}>
                    {Array.from({length: columns}).map((_, index) => (
                        <Skeleton key={`header-${index}`} height="1rem" width="80%" />
                    ))}
                </div>
            )}

            {Array.from({length: rows}).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="grid gap-4"
                    style={{gridTemplateColumns: `repeat(${columns}, 1fr)`}}
                >
                    {Array.from({length: columns}).map((_, colIndex) => (
                        <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            height="0.875rem"
                            width={colIndex === 0 ? "60%" : "90%"}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton Feed Component
 *
 * Social media feed-like skeleton layout.
 */
function SkeletonFeed({
    posts = 3,
    className,
    ...props
}: {
    posts?: number
    className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('space-y-6', className)} {...props}>
            {Array.from({length: posts}).map((_, index) => (
                <div key={index} className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                        <SkeletonAvatar size="sm" />
                        <div className="flex-1">
                            <Skeleton height="1rem" width="30%" className="mb-1" />
                            <Skeleton height="0.75rem" width="20%" />
                        </div>
                    </div>

                    {/* Content */}
                    <SkeletonText lines={2} />

                    {/* Image */}
                    <SkeletonImage height="240px" />

                    {/* Actions */}
                    <div className="flex space-x-4">
                        <Skeleton height="0.875rem" width="15%" />
                        <Skeleton height="0.875rem" width="15%" />
                        <Skeleton height="0.875rem" width="15%" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonImage,
    SkeletonButton,
    SkeletonCard,
    SkeletonList,
    SkeletonTable,
    SkeletonFeed,
    skeletonVariants
}
