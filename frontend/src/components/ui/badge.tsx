import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const badgeVariants = cva(
    'badge',
    {
        variants: {
            variant: {
                default: '',
                primary: 'badge-primary',
                secondary: 'badge-secondary',
                accent: 'badge-accent',
                info: 'badge-info',
                success: 'badge-success',
                warning: 'badge-warning',
                error: 'badge-error',
                neutral: 'badge-neutral',
                ghost: 'badge-ghost',
            },
            styleVariant: {
                default: '',
                outline: 'badge-outline',
                dash: 'badge-dash',
                soft: 'badge-soft',
            },
            size: {
                default: '',
                xs: 'badge-xs',
                sm: 'badge-sm',
                md: 'badge-md',
                lg: 'badge-lg',
                xl: 'badge-xl',
            },
            shape: {
                default: '',
                circle: 'w-3 h-3 rounded-full p-0 min-h-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            styleVariant: 'default',
            size: 'default',
            shape: 'default',
        },
    }
)

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

function Badge({
                   className,
                   variant,
                   styleVariant,
                   size,
                   shape,
                   ...props
               }: BadgeProps) {
    return (
        <span
            className={cn(badgeVariants({variant, styleVariant, size, shape}), className)}
            {...props}
        />
    )
}

export {Badge, badgeVariants}
