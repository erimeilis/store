import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const alertVariants = cva(
    'alert',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                info: 'alert-info',
                success: 'alert-success',
                warning: 'alert-warning',
                error: 'alert-error',
            },
            // Style variants
            style: {
                default: '',
                outline: 'alert-outline',
                dash: 'alert-dash',
                soft: 'alert-soft',
            },
            // Direction variants
            direction: {
                default: '',
                vertical: 'alert-vertical',
                horizontal: 'alert-horizontal',
            },
        },
        defaultVariants: {
            color: 'default',
            style: 'default',
            direction: 'default',
        },
    }
)

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'style'>,
    VariantProps<typeof alertVariants> {
}

/**
 * DaisyUI Alert Component
 *
 * A flexible alert component that follows DaisyUI's alert structure exactly.
 * Supports different colors (info, success, warning, error), styles (outline, dash),
 * and directions (vertical, horizontal).
 */
function Alert({
    className,
    color,
    style,
    direction,
    children,
    ...props
}: AlertProps) {
    return (
        <div
            role="alert"
            className={cn(alertVariants({color, style, direction}), className)}
            {...props}
        >
            {children}
        </div>
    )
}

export {Alert, alertVariants}
