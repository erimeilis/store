/**
 * Modules Admin Page
 * Lists all installed modules with management actions
 */

import React, {useState} from 'react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardBody, CardTitle} from '@/components/ui/card'
import {Alert} from '@/components/ui/alert'
import {ModuleInstallModal} from '@/components/modules/install-modal'
import {PageHeader, createBreadcrumbs} from '@/components/page/page-header'
import {
    IconAlertCircle,
    IconApi,
    IconColumns,
    IconPackage,
    IconPlug,
    IconPlugConnected,
    IconPlus,
    IconPower,
    IconRefresh,
    IconSettings,
    IconTrash,
    IconWand,
} from '@tabler/icons-react'
import type {InstalledModule, ModuleCapability, ModuleSource, ModuleStatus, PaginatedModulesResponse,} from '@/types/modules'
import {moduleStatusBadgeVariant, moduleStatusLabel,} from '@/types/modules'

interface ModulesPageProps {
    modules?: PaginatedModulesResponse | null
    apiUrl?: string
    apiToken?: string
}

function getCapabilityIcon(type: string) {
    switch (type) {
        case 'columnType':
            return <IconColumns size={14}/>
        case 'dataGenerator':
            return <IconWand size={14}/>
        case 'api':
            return <IconApi size={14}/>
        default:
            return <IconPackage size={14}/>
    }
}

function getCapabilityId(cap: ModuleCapability): string {
    switch (cap.type) {
        case 'columnType':
            return cap.typeId
        case 'dataGenerator':
            return cap.generatorId
        case 'api':
            return cap.basePath
        default: {
            const _exhaustive: never = cap
            return String(_exhaustive)
        }
    }
}

export default function ModulesPage({modules, apiUrl, apiToken}: ModulesPageProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const moduleList = modules?.data || []
    const activeModules = moduleList.filter((m) => m.status === 'active')
    const inactiveModules = moduleList.filter((m) => m.status !== 'active')

    const getApiConfig = () => ({
        baseUrl: apiUrl || window.__API_URL__ || '',
        token: apiToken || window.__ADMIN_TOKEN__ || '',
    })

    const handleAction = async (moduleId: string, action: string) => {
        setActionLoading(moduleId)
        setError(null)
        setSuccessMessage(null)

        try {
            const {baseUrl, token} = getApiConfig()

            const isUninstall = action === 'uninstall'
            const url = isUninstall
                ? `${baseUrl}/api/admin/modules/${encodeURIComponent(moduleId)}`
                : `${baseUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/action`

            const response = await fetch(url, {
                method: isUninstall ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: isUninstall ? undefined : JSON.stringify({action}),
            })

            if (!response.ok) {
                const data = await response.json() as { error?: string }
                throw new Error(data.error || `Failed to ${action} module`)
            }

            setSuccessMessage(`Module ${action}d successfully`)
            window.location.reload()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setActionLoading(null)
        }
    }

    const handleInstall = async (source: ModuleSource, activate: boolean) => {
        const {baseUrl, token} = getApiConfig()

        const response = await fetch(`${baseUrl}/api/admin/modules/install`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({source, activate}),
        })

        if (!response.ok) {
            const data = await response.json() as { error?: string }
            throw new Error(data.error || 'Failed to install module')
        }

        setSuccessMessage('Module installed successfully')
        window.location.reload()
    }

    const handleReloadAll = async () => {
        setActionLoading('reload-all')
        setError(null)

        try {
            const {baseUrl, token} = getApiConfig()

            const response = await fetch(`${baseUrl}/api/admin/modules/reload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const data = await response.json() as { error?: string }
                throw new Error(data.error || 'Failed to reload modules')
            }

            setSuccessMessage('All modules reloaded successfully')
            window.location.reload()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setActionLoading(null)
        }
    }

    const openInstallModal = () => {
        const modal = document.getElementById('install-module-modal') as HTMLDialogElement
        modal?.showModal()
    }

    const closeInstallModal = () => {
        const modal = document.getElementById('install-module-modal') as HTMLDialogElement
        modal?.close()
    }

    const renderModuleCard = (module: InstalledModule) => {
        const isActive = module.status === 'active'
        const isError = module.status === 'error'
        const isThisLoading = actionLoading === module.id

        return (
            <Card key={module.id} className={`transition-all ${isError ? 'border-error' : isActive ? 'border-success' : ''}`}>
                <CardBody>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {isActive ? (
                                <IconPlugConnected className="text-success" size={20}/>
                            ) : (
                                <IconPlug className="text-base-content/50" size={20}/>
                            )}
                            <div>
                                <CardTitle className="text-base">{module.displayName || module.manifest.name}</CardTitle>
                                <div className="text-xs text-base-content/60">v{module.version}</div>
                            </div>
                        </div>
                        <Badge className={moduleStatusBadgeVariant[module.status as ModuleStatus]}>
                            {moduleStatusLabel[module.status as ModuleStatus]}
                        </Badge>
                    </div>

                    {module.description && (
                        <p className="text-sm text-base-content/70 mb-3">{module.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                        {module.manifest.capabilities.map((cap: ModuleCapability, idx: number) => (
                            <Badge key={idx} variant="ghost" size="sm" className="gap-1">
                                {getCapabilityIcon(cap.type)}
                                {getCapabilityId(cap)}
                            </Badge>
                        ))}
                    </div>

                    {isError && module.error && (
                        <Alert color="error" className="mb-3 py-2">
                            <IconAlertCircle size={16}/>
                            <span className="text-xs">{module.error}</span>
                        </Alert>
                    )}

                    <div className="flex gap-2 flex-wrap">
                        {isActive ? (
                            <Button
                                size="sm"
                                color="warning"
                                icon={IconPower}
                                onClick={() => handleAction(module.id, 'deactivate')}
                                disabled={isThisLoading}
                                processing={isThisLoading}
                            >
                                Deactivate
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                color="success"
                                icon={IconPower}
                                onClick={() => handleAction(module.id, 'activate')}
                                disabled={isError || isThisLoading}
                                processing={isThisLoading}
                            >
                                Activate
                            </Button>
                        )}
                        <Button
                            size="sm"
                            style="ghost"
                            icon={IconSettings}
                            onClick={() => window.location.href = `/dashboard/modules/${encodeURIComponent(module.id)}`}
                        >
                            Settings
                        </Button>
                        <Button
                            size="icon"
                            style="soft"
                            color="error"
                            icon={IconTrash}
                            onClick={() => handleAction(module.id, 'uninstall')}
                            disabled={isThisLoading}
                            className="m-1"
                        />
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                breadcrumbs={createBreadcrumbs.section('Modules')}
                icon={IconPlug}
                title="Modules"
                subtitle="Manage installed modules and extensions"
                actions={
                    <>
                        <Button
                            style="ghost"
                            icon={IconRefresh}
                            onClick={handleReloadAll}
                            disabled={actionLoading === 'reload-all'}
                            processing={actionLoading === 'reload-all'}
                        >
                            Reload All
                        </Button>
                        <Button color="primary" icon={IconPlus} onClick={openInstallModal}>
                            Install Module
                        </Button>
                    </>
                }
            />

            {/* Alerts */}
            {error && (
                <Alert color="error">
                    <IconAlertCircle size={16}/>
                    <span>{error}</span>
                </Alert>
            )}
            {successMessage && (
                <Alert color="success">
                    <span>{successMessage}</span>
                </Alert>
            )}

            {/* Stats */}
            <div className="stats stats-horizontal bg-base-100 shadow">
                <div className="stat">
                    <div className="stat-title">Total Modules</div>
                    <div className="stat-value text-2xl">{moduleList.length}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Active</div>
                    <div className="stat-value text-2xl text-success">{activeModules.length}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Inactive</div>
                    <div className="stat-value text-2xl text-base-content/50">{inactiveModules.length}</div>
                </div>
            </div>

            {/* Module Grid */}
            {moduleList.length === 0 ? (
                <Card>
                    <CardBody className="py-12 text-center">
                        <IconPackage size={48} className="mx-auto text-base-content/30 mb-4"/>
                        <h3 className="text-lg font-medium mb-2">No modules installed</h3>
                        <p className="text-base-content/60 mb-4">
                            Install a module to extend your Store with new features.
                        </p>
                        <Button color="primary" icon={IconPlus} onClick={openInstallModal}>
                            Install Your First Module
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {moduleList.map(renderModuleCard)}
                </div>
            )}

            {/* Install Modal */}
            <ModuleInstallModal
                modalId="install-module-modal"
                apiUrl={apiUrl}
                apiToken={apiToken}
                onInstall={handleInstall}
                onClose={closeInstallModal}
            />
        </div>
    )
}

declare global {
    interface Window {
        __API_URL__?: string
        __ADMIN_TOKEN__?: string
    }
}
