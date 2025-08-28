import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const selectVariants = cva(
    'select',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                primary: 'select-primary',
                secondary: 'select-secondary',
                accent: 'select-accent',
                neutral: 'select-neutral',
                info: 'select-info',
                success: 'select-success',
                warning: 'select-warning',
                error: 'select-error',
            },
            // Style variants
            style: {
                default: '',
                ghost: 'select-ghost',
            },
            // Size variants
            size: {
                xs: 'select-xs',
                sm: 'select-sm',
                md: 'select-md',
                lg: 'select-lg',
                xl: 'select-xl',
            },
            // Behavior variants
            behaviour: {
                default: '',
                disabled: 'select-disabled',
            },
        },
        defaultVariants: {
            color: 'default',
            style: 'default',
            size: 'md',
            behaviour: 'default',
        },
    }
)

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'color' | 'style' | 'size'>,
        VariantProps<typeof selectVariants> {
    options?: Array<{ value: string; label: string; disabled?: boolean }>
    placeholder?: string
    error?: string
}

function Select({
    className,
    color,
    style,
    size,
    behaviour,
    options = [],
    placeholder,
    disabled,
    children,
    error,
    ...props
}: SelectProps) {
    // Automatically set behaviour to 'disabled' if select is disabled
    const effectiveBehaviour = disabled ? 'disabled' : behaviour

    // If error is provided, override color to error
    const effectiveColor = error ? 'error' : color

    return (
        <div className="form-control w-full">
            <select
                className={cn(selectVariants({
                    color: effectiveColor,
                    style,
                    size,
                    behaviour: effectiveBehaviour
                }), className)}
                disabled={disabled}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.length > 0 ? (
                    options.map((option, index) => (
                        <option
                            key={option.value || index}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))
                ) : (
                    children
                )}
            </select>
            {error && (
                <div className="label">
                    <span className="label-text-alt text-error">{error}</span>
                </div>
            )}
        </div>
    )
}

export { Select, selectVariants }
