import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const loadingVariants = cva(
    'loading',
    {
        variants: {
            // Type variants
            type: {
                spinner: 'loading-spinner',
                dots: 'loading-dots',
                ring: 'loading-ring',
                ball: 'loading-ball',
                bars: 'loading-bars',
                infinity: 'loading-infinity',
            },
            // Size variants
            size: {
                xs: 'loading-xs',
                sm: 'loading-sm',
                md: 'loading-md',
                lg: 'loading-lg',
                xl: 'loading-xl',
            },
        },
        defaultVariants: {
            type: 'spinner',
            size: 'md',
        },
    }
)

export interface LoadingProps extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loadingVariants> {
    color?: string
}

export interface LoadingOverlayProps extends LoadingProps {
    show?: boolean
    children?: React.ReactNode
    overlayClassName?: string
    backdrop?: boolean
}

export interface LoadingButtonProps extends LoadingProps {
    loading?: boolean
    children: React.ReactNode
    buttonClassName?: string
    disabled?: boolean
}

/**
 * DaisyUI Loading Component
 *
 * A flexible loading spinner component with various animation types and sizes.
 * Supports spinner, dots, ring, ball, bars, and infinity animations.
 */
function Loading({
    className,
    type,
    size,
    color,
    ...props
}: LoadingProps) {
    const colorClass = color ? `text-${color}` : ''

    return (
        <span
            className={cn(loadingVariants({type, size}), colorClass, className)}
            {...props}
        />
    )
}

/**
 * Loading Overlay Component
 *
 * Loading spinner with overlay for covering content during loading states.
 */
function LoadingOverlay({
    className,
    type = 'spinner',
    size = 'lg',
    color,
    show = false,
    children,
    overlayClassName,
    backdrop = true,
    ...props
}: LoadingOverlayProps) {
    if (!show) {
        return <>{children}</>
    }

    return (
        <div className="relative">
            {children && (
                <div className={show ? 'opacity-50 pointer-events-none' : ''}>
                    {children}
                </div>
            )}
            <div
                className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    backdrop && 'bg-base-100/80',
                    overlayClassName
                )}
            >
                <Loading
                    type={type}
                    size={size}
                    color={color}
                    className={className}
                    {...props}
                />
            </div>
        </div>
    )
}

/**
 * Loading Button Component
 *
 * Button with integrated loading state and spinner.
 */
function LoadingButton({
    className,
    type = 'spinner',
    size = 'sm',
    color,
    loading = false,
    children,
    buttonClassName,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <button
            className={cn('btn', loading && 'btn-disabled', buttonClassName)}
            disabled={disabled || loading}
        >
            {loading && (
                <Loading
                    type={type}
                    size={size}
                    color={color}
                    className={cn('mr-2', className)}
                    {...props}
                />
            )}
            {children}
        </button>
    )
}

/**
 * Loading Dots Component
 *
 * Pre-configured loading component with dots animation.
 */
function LoadingDots({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="dots"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Spinner Component
 *
 * Pre-configured loading component with spinner animation.
 */
function LoadingSpinner({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="spinner"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Ring Component
 *
 * Pre-configured loading component with ring animation.
 */
function LoadingRing({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="ring"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Ball Component
 *
 * Pre-configured loading component with ball animation.
 */
function LoadingBall({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="ball"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Bars Component
 *
 * Pre-configured loading component with bars animation.
 */
function LoadingBars({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="bars"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Infinity Component
 *
 * Pre-configured loading component with infinity animation.
 */
function LoadingInfinity({
    size = 'md',
    color,
    className,
    ...props
}: Omit<LoadingProps, 'type'>) {
    return (
        <Loading
            type="infinity"
            size={size}
            color={color}
            className={className}
            {...props}
        />
    )
}

/**
 * Loading Text Component
 *
 * Loading spinner with accompanying text.
 */
function LoadingText({
    text = 'Loading...',
    type = 'spinner',
    size = 'md',
    color,
    className,
    textClassName,
    ...props
}: LoadingProps & {
    text?: string
    textClassName?: string
}) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Loading
                type={type}
                size={size}
                color={color}
                {...props}
            />
            <span className={cn('text-base-content/70', textClassName)}>
                {text}
            </span>
        </div>
    )
}

export {
    Loading,
    LoadingOverlay,
    LoadingButton,
    LoadingDots,
    LoadingSpinner,
    LoadingRing,
    LoadingBall,
    LoadingBars,
    LoadingInfinity,
    LoadingText,
    loadingVariants
}
