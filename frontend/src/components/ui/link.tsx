import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const linkVariants = cva(
    'link',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                neutral: 'link-neutral',
                primary: 'link-primary',
                secondary: 'link-secondary',
                accent: 'link-accent',
                info: 'link-info',
                success: 'link-success',
                warning: 'link-warning',
                error: 'link-error',
            },
            // Hover variants
            hover: {
                default: '',
                hover: 'link-hover',
            },
        },
        defaultVariants: {
            color: 'default',
            hover: 'default',
        },
    }
)

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>,
    VariantProps<typeof linkVariants> {
    children: React.ReactNode
    external?: boolean
    disabled?: boolean
}

export interface ExternalLinkProps extends Omit<LinkProps, 'external'> {
    showIcon?: boolean
    iconClassName?: string
}

export interface ButtonLinkProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'onClick' | 'type'>,
    VariantProps<typeof linkVariants> {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
}

/**
 * DaisyUI Link Component
 *
 * A flexible link component that restores default link styling with various color variants.
 * Supports hover states and external link handling.
 */
function Link({
    className,
    color,
    hover,
    children,
    external = false,
    disabled = false,
    href,
    target,
    rel,
    ...props
}: LinkProps) {
    // Auto-detect external links
    const isExternal = external || (href && (href.startsWith('http') || href.startsWith('//')))

    // Set appropriate target and rel for external links
    const linkTarget = isExternal ? target || '_blank' : target
    const linkRel = isExternal ? rel || 'noopener noreferrer' : rel

    if (disabled) {
        return (
            <span
                className={cn(linkVariants({color, hover}), 'opacity-50 cursor-not-allowed', className)}
                {...props}
            >
                {children}
            </span>
        )
    }

    return (
        <a
            href={href}
            target={linkTarget}
            rel={linkRel}
            className={cn(linkVariants({color, hover}), className)}
            {...props}
        >
            {children}
        </a>
    )
}

/**
 * External Link Component
 *
 * Pre-configured link for external URLs with optional external link icon.
 */
function ExternalLink({
    className,
    color,
    hover,
    children,
    showIcon = false,
    iconClassName,
    ...props
}: ExternalLinkProps) {
    return (
        <Link
            external={true}
            color={color}
            hover={hover}
            className={cn('inline-flex items-center gap-1', className)}
            {...props}
        >
            {children}
            {showIcon && (
                <svg
                    className={cn('w-3 h-3', iconClassName)}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                </svg>
            )}
        </Link>
    )
}

/**
 * Button Link Component
 *
 * Link component that behaves like a button for JavaScript interactions.
 */
function ButtonLink({
    className,
    color,
    hover,
    children,
    onClick,
    type = 'button',
    disabled = false,
    ...props
}: ButtonLinkProps) {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            event.preventDefault()
            return
        }
        onClick?.()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) {
            event.preventDefault()
            return
        }
        // Handle Enter and Space like a button
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.()
        }
    }

    return (
        <button
            type={type}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
                linkVariants({color, hover}),
                'bg-transparent border-none p-0 font-inherit cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

/**
 * Navigation Link Component
 *
 * Link component optimized for navigation menus with active state support.
 */
function NavLink({
    className,
    color,
    hover = 'hover',
    children,
    active = false,
    disabled = false,
    ...props
}: LinkProps & { active?: boolean }) {
    return (
        <Link
            color={active ? 'primary' : color}
            hover={hover}
            disabled={disabled}
            className={cn(
                'block py-2 px-3 rounded transition-colors',
                active && 'bg-base-200',
                className
            )}
            {...props}
        >
            {children}
        </Link>
    )
}

/**
 * Breadcrumb Link Component
 *
 * Link component specifically styled for breadcrumb navigation.
 */
function BreadcrumbLink({
    className,
    color = 'primary',
    hover = 'hover',
    children,
    current = false,
    ...props
}: LinkProps & { current?: boolean }) {
    if (current) {
        return (
            <span className={cn('text-base-content/70', className)}>
                {children}
            </span>
        )
    }

    return (
        <Link
            color={color}
            hover={hover}
            className={cn('text-sm', className)}
            {...props}
        >
            {children}
        </Link>
    )
}

export {
    Link,
    ExternalLink,
    ButtonLink,
    NavLink,
    BreadcrumbLink,
    linkVariants
}
