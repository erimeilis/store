import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const accordionVariants = cva(
    'collapse',
    {
        variants: {
            // Icon variants
            icon: {
                none: '',
                arrow: 'collapse-arrow',
                plus: 'collapse-plus',
            },
            // Close variants
            close: {
                default: '',
                close: 'collapse-close',
            },
        },
        defaultVariants: {
            icon: 'none',
            close: 'default',
        },
    }
)

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof accordionVariants> {
    title: React.ReactNode
    name: string
    defaultOpen?: boolean
    disabled?: boolean
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactElement<AccordionItemProps>[]
    name?: string
}

/**
 * DaisyUI Accordion Item Component
 *
 * Individual accordion item that uses radio input for state management.
 * Only one item in an accordion group can be open at a time.
 */
function AccordionItem({
    className,
    icon,
    close,
    title,
    name,
    defaultOpen = false,
    disabled = false,
    children,
    ...props
}: AccordionItemProps) {
    return (
        <div
            className={cn(accordionVariants({icon, close}), className)}
            {...props}
        >
            <input
                type="radio"
                name={name}
                defaultChecked={defaultOpen}
                disabled={disabled}
            />
            <div className="collapse-title">
                {title}
            </div>
            <div className="collapse-content">
                {children}
            </div>
        </div>
    )
}

/**
 * DaisyUI Accordion Component
 *
 * A collapsible content component where only one item can be open at a time.
 * Uses radio inputs for state management following DaisyUI's structure exactly.
 */
function Accordion({
    className,
    name = 'accordion',
    children,
    ...props
}: AccordionProps) {
    // Clone children to inject the name prop
    const clonedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                name: child.props.name || name,
            })
        }
        return child
    })

    return (
        <div className={cn('space-y-1', className)} {...props}>
            {clonedChildren}
        </div>
    )
}

export {Accordion, AccordionItem, accordionVariants}
