import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const radioVariants = cva(
    'radio',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                primary: 'radio-primary',
                secondary: 'radio-secondary',
                accent: 'radio-accent',
                info: 'radio-info',
                success: 'radio-success',
                warning: 'radio-warning',
                error: 'radio-error',
            },
            // Size variants
            size: {
                xs: 'radio-xs',
                sm: 'radio-sm',
                md: 'radio-md',
                lg: 'radio-lg',
                xl: 'radio-xl',
            },
        },
        defaultVariants: {
            color: 'default',
            size: 'md',
        },
    }
)

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color'>,
    VariantProps<typeof radioVariants> {
    label?: React.ReactNode
}

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    orientation?: 'horizontal' | 'vertical'
    error?: boolean
    disabled?: boolean
}

export interface RadioGroupItemProps extends RadioProps {
    value: string
}

export interface RadioWithLabelProps extends RadioProps {
    labelPosition?: 'left' | 'right'
    labelClassName?: string
    containerClassName?: string
}

/**
 * DaisyUI Radio Component
 *
 * A flexible radio button component with various colors and sizes.
 * Follows DaisyUI's radio structure exactly.
 */
function Radio({
    className,
    color,
    size,
    label,
    id,
    ...props
}: RadioProps) {
    const radioId = id || `radio-${Math.random().toString(36).substring(2, 9)}`

    if (label) {
        return (
            <label htmlFor={radioId} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    id={radioId}
                    className={cn(radioVariants({color, size}), className)}
                    {...props}
                />
                <span>{label}</span>
            </label>
        )
    }

    return (
        <input
            type="radio"
            id={radioId}
            className={cn(radioVariants({color, size}), className)}
            {...props}
        />
    )
}

/**
 * DaisyUI Radio Group Component
 *
 * A group of radio buttons with shared state management.
 * Handles value changes and ensures only one radio is selected.
 */
function RadioGroup({
    className,
    name,
    value,
    defaultValue,
    onValueChange,
    children,
    orientation = 'vertical',
    error = false,
    disabled = false,
    ...props
}: RadioGroupProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const currentValue = value !== undefined ? value : internalValue

    const handleChange = (newValue: string) => {
        if (value === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }

    const containerClasses = cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2',
        error && 'text-error',
        className
    )

    return (
        <div className={containerClasses} role="radiogroup" {...props}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement<RadioGroupItemProps>(child)) {
                    return React.cloneElement(child, {
                        name,
                        checked: child.props.value === currentValue,
                        disabled: disabled || child.props.disabled,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.checked) {
                                handleChange(child.props.value)
                            }
                            child.props.onChange?.(e)
                        },
                        color: error ? 'error' : child.props.color,
                    })
                }
                return child
            })}
        </div>
    )
}

/**
 * DaisyUI Radio Group Item Component
 *
 * Individual radio item for use within RadioGroup.
 */
function RadioGroupItem({
    value,
    label,
    ...props
}: RadioGroupItemProps) {
    return (
        <Radio
            value={value}
            label={label}
            {...props}
        />
    )
}

/**
 * Radio with Label Component
 *
 * Radio with configurable label positioning and styling.
 */
function RadioWithLabel({
    className,
    color,
    size,
    label,
    labelPosition = 'right',
    labelClassName,
    containerClassName,
    id,
    ...props
}: RadioWithLabelProps) {
    const radioId = id || `radio-${Math.random().toString(36).substring(2, 9)}`

    const radioElement = (
        <input
            type="radio"
            id={radioId}
            className={cn(radioVariants({color, size}), className)}
            {...props}
        />
    )

    const labelElement = label && (
        <label
            htmlFor={radioId}
            className={cn('cursor-pointer select-none', labelClassName)}
        >
            {label}
        </label>
    )

    return (
        <div className={cn('flex items-center gap-2', containerClassName)}>
            {labelPosition === 'left' && labelElement}
            {radioElement}
            {labelPosition === 'right' && labelElement}
        </div>
    )
}

/**
 * Simple Radio List Component
 *
 * Pre-configured list of radio options.
 */
function RadioList({
    name,
    options,
    value,
    defaultValue,
    onValueChange,
    color,
    size,
    orientation = 'vertical',
    error = false,
    disabled = false,
    className,
}: {
    name: string
    options: Array<{
        value: string
        label: React.ReactNode
        disabled?: boolean
    }>
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    color?: VariantProps<typeof radioVariants>['color']
    size?: VariantProps<typeof radioVariants>['size']
    orientation?: 'horizontal' | 'vertical'
    error?: boolean
    disabled?: boolean
    className?: string
}) {
    return (
        <RadioGroup
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            orientation={orientation}
            error={error}
            disabled={disabled}
            className={className}
        >
            {options.map((option) => (
                <RadioGroupItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    color={color}
                    size={size}
                    disabled={option.disabled}
                />
            ))}
        </RadioGroup>
    )
}

/**
 * Card Radio Component
 *
 * Radio styled as a selectable card.
 */
function CardRadio({
    className,
    color,
    size,
    label,
    description,
    icon: Icon,
    checked,
    ...props
}: RadioProps & {
    description?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
}) {
    const radioId = `radio-${Math.random().toString(36).substring(2, 9)}`

    return (
        <label
            htmlFor={radioId}
            className={cn(
                'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                checked
                    ? 'border-primary bg-primary/5'
                    : 'border-base-300 hover:border-base-400',
                className
            )}
        >
            <input
                type="radio"
                id={radioId}
                checked={checked}
                className={cn(radioVariants({color, size}))}
                {...props}
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{label}</span>
                </div>
                {description && (
                    <p className="text-sm text-base-content/70 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </label>
    )
}

export {
    Radio,
    RadioGroup,
    RadioGroupItem,
    RadioWithLabel,
    RadioList,
    CardRadio,
    radioVariants
}
