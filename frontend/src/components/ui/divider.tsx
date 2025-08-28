import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dividerVariants = cva(
    'divider',
    {
        variants: {
            // Orientation variants
            orientation: {
                horizontal: '',
                vertical: 'divider-vertical',
            },
            // Color variants
            color: {
                default: '',
                neutral: 'divider-neutral',
                primary: 'divider-primary',
                secondary: 'divider-secondary',
                accent: 'divider-accent',
                info: 'divider-info',
                success: 'divider-success',
                warning: 'divider-warning',
                error: 'divider-error',
            },
            // Position variants (for vertical dividers)
            position: {
                default: '',
                start: 'divider-start',
                end: 'divider-end',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
            color: 'default',
            position: 'default',
        },
    }
)

export interface DividerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
        VariantProps<typeof dividerVariants> {
    /**
     * Text content to display on the divider
     */
    children?: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Divider component for creating visual separators with optional text content.
 *
 * Based on DaisyUI's divider component with support for horizontal/vertical
 * orientations, different colors, and text content. Perfect for separating
 * sections, content groups, and creating visual breaks in layouts.
 *
 * @example
 * ```tsx
 * <Divider>OR</Divider>
 *
 * <Divider orientation="vertical" />
 *
 * <Divider color="primary">Section Break</Divider>
 * ```
 */
function Divider({
    className,
    orientation,
    color,
    position,
    children,
    asChild = false,
    ...props
}: DividerProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(dividerVariants({ orientation, color, position }), className)}
            role="separator"
            aria-orientation={orientation || undefined}
            {...props}
        >
            {children}
        </Comp>
    )
}

export { Divider, dividerVariants }
