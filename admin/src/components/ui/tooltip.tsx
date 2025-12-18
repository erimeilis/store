import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const tooltipVariants = cva(
    'tooltip',
    {
        variants: {
            // Position variants
            position: {
                top: 'tooltip-top',
                bottom: 'tooltip-bottom',
                left: 'tooltip-left',
                right: 'tooltip-right',
            },
            // Color variants
            color: {
                neutral: 'tooltip-neutral',
                primary: 'tooltip-primary',
                secondary: 'tooltip-secondary',
                accent: 'tooltip-accent',
                info: 'tooltip-info',
                success: 'tooltip-success',
                warning: 'tooltip-warning',
                error: 'tooltip-error',
            },
        },
        defaultVariants: {
            position: 'top',
        },
    }
)

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof tooltipVariants> {
    tip?: string
    open?: boolean
    asChild?: boolean
}

function Tooltip({
                     className,
                     position,
                     color,
                     tip,
                     open = false,
                     asChild = false,
                     children,
                     ...props
                 }: TooltipProps) {
    const Comp = asChild ? Slot : 'div'

    const tooltipClasses = cn(
        tooltipVariants({position, color}),
        {
            'tooltip-open': open,
        },
        className
    )

    return (
        <Comp
            className={tooltipClasses}
            data-tip={tip || ''}
            {...props}
        >
            {children}
        </Comp>
    )
}

export {Tooltip, tooltipVariants}
export default Tooltip
