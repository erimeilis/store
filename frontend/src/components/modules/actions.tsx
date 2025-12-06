/**
 * Module Actions Component
 * Provides consistent action buttons for module detail pages
 * Uses the unified PageActions component
 */

import React from 'react'
import { PageActions, type ActionConfig, type ButtonColor, type ButtonStyle } from '@/components/page/action-buttons'
import {
    IconPower,
    IconRefresh,
    IconTrash
} from '@tabler/icons-react'

export type ModuleAction = 'activate' | 'deactivate' | 'reload' | 'uninstall'

/**
 * Centralized action configuration for module pages
 * Single source of truth for labels, colors, icons, and styles
 */
export const MODULE_ACTION_CONFIG: Record<ModuleAction, {
    label: string
    icon: React.ComponentType<{ size?: number | string; className?: string }>
    color: ButtonColor
    style?: ButtonStyle
}> = {
    activate: {
        label: 'Activate',
        icon: IconPower,
        color: 'success'
    },
    deactivate: {
        label: 'Deactivate',
        icon: IconPower,
        color: 'warning'
    },
    reload: {
        label: 'Reload',
        icon: IconRefresh,
        color: 'info',
        style: 'ghost'
    },
    uninstall: {
        label: 'Uninstall',
        icon: IconTrash,
        color: 'error',
        style: 'outline'
    }
}

interface ModuleActionsProps {
    isActive: boolean
    isError: boolean
    actionLoading: string | null
    onAction: (action: ModuleAction) => void
    className?: string
}

export function ModuleActions({
    isActive,
    isError,
    actionLoading,
    onAction,
    className = ''
}: ModuleActionsProps) {
    const actionKeys: ModuleAction[] = isActive
        ? ['deactivate', 'reload', 'uninstall']
        : ['activate', 'reload', 'uninstall']

    const actions: ActionConfig[] = actionKeys.map((key) => {
        const config = MODULE_ACTION_CONFIG[key]
        return {
            key,
            label: config.label,
            icon: config.icon,
            color: config.color,
            style: config.style,
            onClick: () => onAction(key),
            disabled: actionLoading !== null || (key === 'activate' && isError),
            processing: actionLoading === key
        }
    })

    return <PageActions actions={actions} className={className} />
}
