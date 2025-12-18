import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const progressVariants = cva(
    'progress',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                primary: 'progress-primary',
                secondary: 'progress-secondary',
                accent: 'progress-accent',
                info: 'progress-info',
                success: 'progress-success',
                warning: 'progress-warning',
                error: 'progress-error',
            },
            // Size variants
            size: {
                xs: 'progress-xs',
                sm: 'progress-sm',
                md: 'progress-md',
                lg: 'progress-lg',
                xl: 'progress-xl',
            },
        },
        defaultVariants: {
            color: 'default',
            size: 'md',
        },
    }
)

export interface ProgressProps
    extends VariantProps<typeof progressVariants>,
    Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, 'size' | 'color'> {
    value?: number
    max?: number
    indeterminate?: boolean
    showValue?: boolean
    label?: string
}

export interface ProgressWithLabelProps extends ProgressProps {
    labelPosition?: 'top' | 'bottom' | 'inline'
    labelClassName?: string
}

export interface CircularProgressProps extends Omit<ProgressProps, 'showValue'> {
    strokeWidth?: number
    radius?: number
    showValue?: boolean
    valueClassName?: string
}

/**
 * DaisyUI Progress Component
 *
 * A flexible progress bar component that supports various colors, sizes,
 * and can display determinate or indeterminate progress.
 */
function Progress({
    className,
    color,
    size,
    value,
    max = 100,
    indeterminate = false,
    showValue = false,
    label,
    ...props
}: ProgressProps) {
    const progressValue = indeterminate ? undefined : value
    const progressMax = indeterminate ? undefined : max

    const percentage = value !== undefined && max > 0 ? Math.round((value / max) * 100) : 0

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1">
                    {label && (
                        <span className="text-sm font-medium text-base-content/70">
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className="text-sm text-base-content/70">
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <progress
                className={cn(progressVariants({color, size}), className)}
                value={progressValue}
                max={progressMax}
                {...props}
            />
        </div>
    )
}

/**
 * Progress with Label Component
 *
 * Progress bar with configurable label positioning.
 */
function ProgressWithLabel({
    className,
    color,
    size,
    value,
    max = 100,
    indeterminate = false,
    label,
    labelPosition = 'top',
    labelClassName,
    ...props
}: ProgressWithLabelProps) {
    const percentage = value !== undefined && max > 0 ? Math.round((value / max) * 100) : 0
    const progressValue = indeterminate ? undefined : value
    const progressMax = indeterminate ? undefined : max

    const labelElement = label && (
        <span className={cn('text-sm font-medium text-base-content/70', labelClassName)}>
            {label}
        </span>
    )

    const valueElement = (
        <span className="text-sm text-base-content/70">
            {percentage}%
        </span>
    )

    if (labelPosition === 'inline') {
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    {labelElement}
                    {valueElement}
                </div>
                <progress
                    className={cn(progressVariants({color, size}), className)}
                    value={progressValue}
                    max={progressMax}
                    {...props}
                />
            </div>
        )
    }

    return (
        <div className="w-full">
            {labelPosition === 'top' && (
                <div className="flex justify-between items-center mb-1">
                    {labelElement}
                    {valueElement}
                </div>
            )}
            <progress
                className={cn(progressVariants({color, size}), className)}
                value={progressValue}
                max={progressMax}
                {...props}
            />
            {labelPosition === 'bottom' && (
                <div className="flex justify-between items-center mt-1">
                    {labelElement}
                    {valueElement}
                </div>
            )}
        </div>
    )
}

/**
 * Indeterminate Progress Component
 *
 * Progress bar that shows indeterminate/loading state.
 */
function IndeterminateProgress({
    color = 'primary' as const,
    size = 'md' as const,
    className,
    ...props
}: Omit<ProgressProps, 'value' | 'indeterminate'>) {
    return (
        <progress
            className={cn(progressVariants({color, size}), className)}
            {...props}
        />
    )
}

/**
 * Circular Progress Component
 *
 * SVG-based circular progress indicator.
 */
function CircularProgress({
    className,
    color = 'primary' as const,
    value = 0,
    max = 100,
    strokeWidth = 4,
    radius = 20,
    showValue = false,
    valueClassName,
    indeterminate = false,
}: CircularProgressProps) {
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const percentage = Math.min(Math.max(value, 0), max)
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = indeterminate ? 0 : circumference - (percentage / max) * circumference

    const colorClasses: Record<string, string> = {
        default: 'stroke-base-content',
        primary: 'stroke-primary',
        secondary: 'stroke-secondary',
        accent: 'stroke-accent',
        info: 'stroke-info',
        success: 'stroke-success',
        warning: 'stroke-warning',
        error: 'stroke-error',
    }

    const progressColor = (color && colorClasses[color]) || colorClasses.default

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg
                height={radius * 2}
                width={radius * 2}
                className={cn('transform -rotate-90', indeterminate && 'animate-spin')}
            >
                {/* Background circle */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="opacity-20"
                />
                {/* Progress circle */}
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn(progressColor, 'transition-all duration-300 ease-in-out')}
                    style={{
                        strokeDashoffset: indeterminate ? circumference * 0.75 : strokeDashoffset,
                    }}
                />
            </svg>
            {showValue && !indeterminate && (
                <div className={cn(
                    'absolute inset-0 flex items-center justify-center text-xs font-medium',
                    valueClassName
                )}>
                    {Math.round((percentage / max) * 100)}%
                </div>
            )}
        </div>
    )
}

/**
 * Step Progress Component
 *
 * Progress bar with discrete steps/milestones.
 */
function StepProgress({
    steps,
    currentStep = 0,
    color = 'primary' as const,
    size = 'md' as const,
    className,
    stepClassName,
    showLabels = false,
}: {
    steps: string[]
    currentStep?: number
    color?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    stepClassName?: string
    showLabels?: boolean
}) {
    const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0

    return (
        <div className={cn('w-full', className)}>
            {showLabels && (
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <span
                            key={index}
                            className={cn(
                                'text-xs',
                                index <= currentStep ? 'text-base-content' : 'text-base-content/50',
                                stepClassName
                            )}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            )}
            <Progress
                value={progress}
                color={color}
                size={size}
                showValue={false}
            />
            <div className="flex justify-between mt-1">
                {steps.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            'w-2 h-2 rounded-full',
                            index <= currentStep ? 'bg-current' : 'bg-base-content/20'
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

export {
    Progress,
    ProgressWithLabel,
    IndeterminateProgress,
    CircularProgress,
    StepProgress,
    progressVariants
}
