import * as React from 'react'
import {cn} from '@/lib/utils'
import {cva, type VariantProps} from 'class-variance-authority'

const inputVariants = cva(
    'input w-full [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill]:![-webkit-text-fill-color:inherit] [&:-webkit-autofill]:![transition:background-color_9999s_ease-in-out_0s] ' +
    '[&:-webkit-autofill:hover]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill:focus]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill:active]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]',
    {
        variants: {
            style: {
                default: '',
                ghost: 'input-ghost',
            },
            color: {
                default: '',
                neutral: 'input-neutral',
                primary: 'input-primary',
                secondary: 'input-secondary',
                accent: 'input-accent',
                info: 'input-info',
                success: 'input-success',
                warning: 'input-warning',
                error: 'input-error',
            },
            size: {
                xs: 'input-xs',
                sm: 'input-sm',
                md: 'input-md',
                lg: 'input-lg',
                xl: 'input-xl',
            },
        },
        defaultVariants: {
            style: 'default',
            color: 'default',
            size: 'md',
        },
    }
)

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'style' | 'color'>,
    VariantProps<typeof inputVariants> {
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    containerClassName?: string
    label?: React.ReactNode
    labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, type, style, color, size, prefix, suffix, containerClassName, label, labelClassName, ...props}, ref) => {
        // Create the input element
        const inputElement = (() => {
            // If no prefix or suffix, render simple input
            if (!prefix && !suffix) {
                return (
                    <input
                        type={type}
                        className={cn(inputVariants({style, color, size}), className)}
                        ref={ref}
                        {...props}
                    />
                )
            }

            // Render wrapped input with prefix/suffix
            return (
                <label className={cn(inputVariants({style, color, size}), containerClassName)}>
                    {prefix && prefix}
                    <input
                        type={type}
                        className={cn('grow bg-transparent outline-none [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill]:![-webkit-text-fill-color:inherit] [&:-webkit-autofill]:![transition:background-color_9999s_ease-in-out_0s] ' +
                            '[&:-webkit-autofill:hover]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill:focus]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill:active]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]', className)}
                        ref={ref}
                        {...props}
                    />
                    {suffix && suffix}
                </label>
            )
        })()

        // If no external label, return just the input
        if (!label) {
            return inputElement
        }

        // Return input with external label
        return (
            <div className="flex flex-col space-y-1">
                <label className={cn('text-sm font-medium leading-none text-base-content/90', labelClassName)}>
                    {label}
                </label>
                {inputElement}
            </div>
        )
    }
)

Input.displayName = 'Input'

export {Input, inputVariants}
