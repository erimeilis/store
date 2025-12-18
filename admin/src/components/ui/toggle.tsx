import * as React from 'react'
import {cn} from '@/lib/utils'
import {cva, type VariantProps} from 'class-variance-authority'

const toggleVariants = cva(
    'toggle',
    {
        variants: {
            color: {
                default: '',
                neutral: 'toggle-neutral',
                primary: 'toggle-primary',
                secondary: 'toggle-secondary',
                accent: 'toggle-accent',
                info: 'toggle-info',
                success: 'toggle-success',
                warning: 'toggle-warning',
                error: 'toggle-error',
            },
            size: {
                xs: 'toggle-xs',
                sm: 'toggle-sm',
                md: 'toggle-md',
                lg: 'toggle-lg',
                xl: 'toggle-xl',
            },
        },
        defaultVariants: {
            color: 'default',
            size: 'md',
        },
    }
)

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'type'>,
    VariantProps<typeof toggleVariants> {
    label?: React.ReactNode
    labelClassName?: string
    indeterminate?: boolean
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
    ({className, color, size, label, labelClassName, indeterminate, ...props}, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null)

        // Combine refs
        React.useImperativeHandle(ref, () => inputRef.current!)

        // Handle indeterminate state
        React.useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = indeterminate ?? false
            }
        }, [indeterminate])

        const toggleElement = (
            <input
                type="checkbox"
                className={cn(toggleVariants({color, size}), className)}
                ref={inputRef}
                {...props}
            />
        )

        // If no label, return just the toggle
        if (!label) {
            return toggleElement
        }

        // Return toggle wrapped in label
        return (
            <label className={cn('label cursor-pointer', labelClassName)}>
                <span className="label-text">{label}</span>
                {toggleElement}
            </label>
        )
    }
)

Toggle.displayName = 'Toggle'

export {Toggle, toggleVariants}
