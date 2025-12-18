import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const cardVariants = cva(
    'card',
    {
        variants: {
            // DaisyUI card size variants
            size: {
                xs: 'card-xs',
                sm: 'card-sm',
                md: 'card-md',
                lg: 'card-lg',
                xl: 'card-xl',
            },
            // Color variants (similar to Button)
            color: {
                default: 'bg-base-100',
                neutral: 'badge-neutral',
                primary: 'badge-primary',
                secondary: 'badge-secondary',
                accent: 'badge-accent',
                info: 'badge-info',
                success: 'badge-success',
                warning: 'badge-warning',
                error: 'badge-error',
            },
            // DaisyUI card style variants
            style: {
                default: '',
                border: 'card-border',
                dash: 'card-dash',
                soft: 'badge-soft',
                ghost: 'card-ghost',
            },
            // DaisyUI card modifier variants
            modifier: {
                default: '',
                side: 'card-side',
                image: 'image-full',
            },
            // Shadow variants
            shadow: {
                sm: 'shadow-sm',
                md: 'shadow-md',
                lg: 'shadow-lg',
                xl: 'shadow-xl',
                none: 'shadow-none',
            },
        },
        defaultVariants: {
            size: 'md',
            color: 'default',
            style: 'default',
            modifier: 'default',
            shadow: 'md',
        },
    }
)

const cardBodyVariants = cva('card-body')

const cardTitleVariants = cva('card-title')

const cardActionsVariants = cva(
    'card-actions',
    {
        variants: {
            justify: {
                default: '',
                start: 'justify-start',
                center: 'justify-center',
                end: 'justify-end',
                between: 'justify-between',
                around: 'justify-around',
            },
        },
        defaultVariants: {
            justify: 'default',
        },
    }
)

type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({className, size, color, style, modifier, shadow, ...props}, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({size, color, style, modifier, shadow}), className)}
            {...props}
        />
    )
)
Card.displayName = 'Card'

const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({className, ...props}, ref) => (
        <div
            ref={ref}
            className={cn(cardBodyVariants(), className)}
            {...props}
        />
    )
)
CardBody.displayName = 'CardBody'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({className, ...props}, ref) => (
        <h2
            ref={ref}
            className={cn(cardTitleVariants(), className)}
            {...props}
        />
    )
)
CardTitle.displayName = 'CardTitle'

type CardActionsProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardActionsVariants>

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
    ({className, justify, ...props}, ref) => (
        <div
            ref={ref}
            className={cn(cardActionsVariants({justify}), className)}
            {...props}
        />
    )
)
CardActions.displayName = 'CardActions'

const CardFigure = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({className, ...props}, ref) => (
        <figure
            ref={ref}
            className={cn(className)}
            {...props}
        />
    )
)
CardFigure.displayName = 'CardFigure'

export {
    Card,
    CardBody,
    CardTitle,
    CardActions,
    CardFigure,
    cardVariants
}
