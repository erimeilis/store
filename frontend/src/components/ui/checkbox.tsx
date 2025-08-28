import * as React from 'react'
import {cn} from '@/lib/utils'
import {cva, type VariantProps} from 'class-variance-authority'

const checkboxVariants = cva(
    'checkbox',
    {
        variants: {
            variant: {
                default: '',
            },
            size: {
                xs: 'checkbox-xs',
                sm: 'checkbox-sm',
                md: 'checkbox-md',
                lg: 'checkbox-lg',
                xl: 'checkbox-xl',
            },
            color: {
                default: '',
                primary: 'checkbox-primary',
                secondary: 'checkbox-secondary',
                accent: 'checkbox-accent',
                neutral: 'checkbox-neutral',
                info: 'checkbox-info',
                success: 'checkbox-success',
                warning: 'checkbox-warning',
                error: 'checkbox-error'
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            color: 'default',
        },
    }
)

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'type'>,
    VariantProps<typeof checkboxVariants> {
    label?: React.ReactNode
    labelClassName?: string
    indeterminate?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({className, variant, size, color, label, labelClassName, indeterminate, ...props}, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null)

        // Combine refs
        React.useImperativeHandle(ref, () => inputRef.current!)

        // Handle indeterminate state
        React.useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = indeterminate ?? false
            }
        }, [indeterminate])

        const checkboxElement = (
            <input
                type="checkbox"
                className={cn(checkboxVariants({variant, size, color}), className)}
                ref={inputRef}
                {...props}
            />
        )

        // If no label, return just the checkbox
        if (!label) {
            return checkboxElement
        }

        // Return checkbox wrapped in label
        return (
            <label className={cn('label cursor-pointer', labelClassName)}>
                <span className="label-text">{label}</span>
                {checkboxElement}
            </label>
        )
    }
)

Checkbox.displayName = 'Checkbox'

export {Checkbox, checkboxVariants}
