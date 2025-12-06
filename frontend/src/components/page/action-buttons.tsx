/**
 * Page Actions Component
 * Unified action buttons for all page headers
 * Single source of truth for button styling - used by Tables, Modules, etc.
 */

import React from 'react'
import {Button} from '@/components/ui/button'

export type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type ButtonStyle = 'soft' | 'outline' | 'ghost'

export interface ActionConfig {
    key: string
    label: string
    shortLabel?: string
    icon: React.ComponentType<{ size?: number | string; className?: string }>
    color?: ButtonColor
    style?: ButtonStyle
    /** For navigation actions */
    href?: string
    /** For callback actions */
    onClick?: () => void
    /** Is this action currently active/selected */
    isActive?: boolean
    /** Is this action disabled */
    disabled?: boolean
    /** Is this action in loading state */
    processing?: boolean
}

interface PageActionsProps {
    actions: ActionConfig[]
    className?: string
}

/**
 * Unified component for rendering action buttons
 * Handles both navigation (href) and callback (onClick) actions
 */
export function PageActions({actions, className = ''}: PageActionsProps) {
    return (
        <div className={`flex flex-col sm:flex-row gap-2 shrink-0 ${className}`}>
            {actions.map((action) => {
                const IconComponent = action.icon
                const handleClick = action.href
                    ? () => {
                        window.location.href = action.href!
                    }
                    : action.onClick

                return (
                    <Button
                        key={action.key}
                        type="button"
                        icon={IconComponent}
                        color={action.isActive ? 'primary' : (action.color || 'info')}
                        style={action.isActive ? 'soft' : (action.style || 'ghost')}
                        size="sm"
                        onClick={handleClick}
                        disabled={action.disabled}
                        processing={action.processing}
                        className={action.isActive ? 'font-semibold' : ''}
                    >
                        {action.shortLabel ? (
                            <>
                                <span className="hidden sm:inline">{action.label}</span>
                                <span className="sm:hidden">{action.shortLabel}</span>
                            </>
                        ) : (
                            action.label
                        )}
                    </Button>
                )
            })}
        </div>
    )
}
