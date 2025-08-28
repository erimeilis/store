import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const collapseVariants = cva(
    'collapse',
    {
        variants: {
            // Icon variants
            icon: {
                none: '',
                plus: 'collapse-plus',
                arrow: 'collapse-arrow',
            },
            // Border variants
            border: {
                none: '',
                bordered: 'border border-base-300',
            },
        },
        defaultVariants: {
            icon: 'none',
            border: 'none',
        },
    }
)

export interface CollapseProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
        VariantProps<typeof collapseVariants> {
    /**
     * The title/header content of the collapse
     */
    title: React.ReactNode
    /**
     * The collapsible content
     */
    children: React.ReactNode
    /**
     * Whether the collapse is open by default
     * @default false
     */
    defaultOpen?: boolean
    /**
     * Controlled open state
     */
    open?: boolean
    /**
     * Callback fired when the collapse state changes
     */
    onOpenChange?: (open: boolean) => void
    /**
     * Custom title component props
     */
    titleProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Custom content component props
     */
    contentProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Collapse component for expandable/collapsible content sections.
 *
 * Based on DaisyUI's collapse component with support for different icon styles
 * and border variants. Perfect for FAQ sections, expandable content, and accordions.
 *
 * @example
 * ```tsx
 * <Collapse
 *   title="Question 1"
 *   icon="plus"
 *   border="bordered"
 * >
 *   This is the answer to question 1.
 * </Collapse>
 * ```
 */
function Collapse({
    className,
    icon,
    border,
    title,
    children,
    defaultOpen = false,
    open,
    onOpenChange,
    titleProps,
    contentProps,
    asChild = false,
    ...props
}: CollapseProps) {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : internalOpen

    const handleToggle = () => {
        if (isControlled) {
            onOpenChange?.(!open)
        } else {
            setInternalOpen(!internalOpen)
            onOpenChange?.(!internalOpen)
        }
    }

    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(collapseVariants({ icon, border }), className)}
            {...props}
        >
            <input
                type="checkbox"
                checked={isOpen}
                onChange={handleToggle}
                className="peer"
                aria-hidden="true"
            />
            <div
                className={cn(
                    'collapse-title text-xl font-medium cursor-pointer',
                    titleProps?.className
                )}
                {...titleProps}
                onClick={handleToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleToggle()
                    }
                    titleProps?.onKeyDown?.(e)
                }}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
            >
                {title}
            </div>
            <div
                className={cn(
                    'collapse-content',
                    contentProps?.className
                )}
                {...contentProps}
            >
                <div className="pb-2">
                    {children}
                </div>
            </div>
        </Comp>
    )
}

export { Collapse, collapseVariants }
