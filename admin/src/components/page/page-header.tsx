/**
 * Unified Page Header Component
 * Provides consistent header structure across all dashboard pages
 *
 * Supports: breadcrumbs, title, subtitle, description, icon, actions, badge
 */

import React from 'react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

export interface PageHeaderBreadcrumb {
    label: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
    current?: boolean
}

export interface PageHeaderProps {
    /** Page title - required */
    title: string
    /** Subtitle text or ReactNode - optional */
    subtitle?: string | React.ReactNode
    /** Additional description text - optional */
    description?: string
    /** Icon component to display before title - optional */
    icon?: React.ComponentType<{ className?: string; size?: number }>
    /** Breadcrumb navigation items - optional */
    breadcrumbs?: PageHeaderBreadcrumb[]
    /** Action buttons/elements to display on the right - optional */
    actions?: React.ReactNode
    /** Badge to display next to title - optional */
    badge?: React.ReactNode
    /** Additional className for the container */
    className?: string
    /** Whether to use compact spacing (for pages with dense content) */
    compact?: boolean
}

/**
 * PageHeader - Universal page header component
 *
 * @example Basic usage:
 * ```tsx
 * <PageHeader title="Users" subtitle="Manage user accounts" />
 * ```
 *
 * @example With breadcrumbs:
 * ```tsx
 * <PageHeader
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Users', current: true }
 *   ]}
 *   title="Users"
 *   subtitle="Manage user accounts"
 * />
 * ```
 *
 * @example With icon and actions:
 * ```tsx
 * <PageHeader
 *   icon={IconUsers}
 *   title="Modules"
 *   subtitle="Manage installed modules"
 *   actions={
 *     <>
 *       <Button icon={IconRefresh}>Reload</Button>
 *       <Button color="primary" icon={IconPlus}>Add</Button>
 *     </>
 *   }
 * />
 * ```
 *
 * @example With badge:
 * ```tsx
 * <PageHeader
 *   title="Phone Numbers Module"
 *   badge={<Badge color="success">Active</Badge>}
 *   subtitle="Custom column type for phone validation"
 * />
 * ```
 */
export function PageHeader({
    title,
    subtitle,
    description,
    icon: Icon,
    breadcrumbs,
    actions,
    badge,
    className = '',
    compact = false
}: PageHeaderProps) {
    const spacingClass = compact ? 'mb-4' : 'mb-4 sm:mb-6'

    return (
        <div className={`${spacingClass} ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs
                    className="mb-2"
                    items={breadcrumbs.map(item => ({
                        label: item.label,
                        href: item.href,
                        icon: item.icon,
                        current: item.current
                    }))}
                />
            )}

            {/* Main header row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                {/* Left side: Icon + Title + Subtitle + Description */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        {Icon && (
                            <div className="shrink-0 mt-1">
                                <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-base-content/70" size={32} />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            {/* Title row with optional badge */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-base-content truncate">
                                    {title}
                                </h1>
                                {badge}
                            </div>

                            {/* Subtitle */}
                            {subtitle && (
                                <p className="text-base-content/70 mt-1 text-sm sm:text-base">
                                    {subtitle}
                                </p>
                            )}

                            {/* Description */}
                            {description && (
                                <p className="text-base-content/50 text-xs sm:text-sm mt-1 line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Actions */}
                {actions && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Helper to create breadcrumbs for common patterns
 */
export const createBreadcrumbs = {
    /** Dashboard > Section */
    section: (sectionLabel: string): PageHeaderBreadcrumb[] => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: sectionLabel, current: true }
    ],

    /** Dashboard > Section > Detail */
    detail: (
        sectionLabel: string,
        sectionHref: string,
        detailLabel: string
    ): PageHeaderBreadcrumb[] => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: sectionLabel, href: sectionHref },
        { label: detailLabel, current: true }
    ],

    /** Dashboard > Section > Item > Action */
    action: (
        sectionLabel: string,
        sectionHref: string,
        itemLabel: string,
        itemHref: string,
        actionLabel: string
    ): PageHeaderBreadcrumb[] => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: sectionLabel, href: sectionHref },
        { label: itemLabel, href: itemHref },
        { label: actionLabel, current: true }
    ]
}
