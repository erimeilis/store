import * as React from 'react'
import {cn} from '@/lib/utils'
import {cva, type VariantProps} from 'class-variance-authority'

const inputVariants = cva(
    'input [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)] [&:-webkit-autofill]:![-webkit-text-fill-color:inherit] [&:-webkit-autofill]:![transition:background-color_9999s_ease-in-out_0s] ' +
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
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, type, style, color, size, prefix, suffix, containerClassName, ...props}, ref) => {
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
    }
)

Input.displayName = 'Input'

export {Input, inputVariants}
