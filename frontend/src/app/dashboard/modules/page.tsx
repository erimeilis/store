/**
 * Modules Admin Page
 * Lists all installed modules with management actions
 */

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Modal, ModalBox, ModalAction } from '@/components/ui/modal'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  IconPlug,
  IconPlugConnected,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconPlus,
  IconPower,
  IconAlertCircle,
  IconPackage,
  IconColumns,
  IconWand,
  IconApi,
} from '@tabler/icons-react'
import type {
  InstalledModule,
  ModuleState,
  ModuleCapability,
  PaginatedModulesResponse,
  ModuleSource,
} from '@/types/modules'
import {
  moduleStateBadgeVariant,
  moduleStateLabel,
  capabilityLabel,
} from '@/types/modules'

interface ModulesPageProps {
  modules?: PaginatedModulesResponse | null
  apiUrl?: string
  apiToken?: string
}

function getCapabilityIcon(type: string) {
  switch (type) {
    case 'columnType':
      return <IconColumns size={14} />
    case 'dataGenerator':
      return <IconWand size={14} />
    case 'api':
      return <IconApi size={14} />
    default:
      return <IconPackage size={14} />
  }
}

function ModuleCard({
  module,
  onAction,
  onViewDetails,
  isLoading,
}: {
  module: InstalledModule
  onAction: (moduleId: string, action: string) => void
  onViewDetails: (moduleId: string) => void
  isLoading: string | null
}) {
  const isActive = module.state === 'active'
  const isError = module.state === 'error'
  const isTransitioning = ['installing', 'activating', 'deactivating', 'updating', 'uninstalling'].includes(module.state)
  const isThisLoading = isLoading === module.moduleId

  return (
    <Card className={`transition-all ${isError ? 'border-error' : isActive ? 'border-success' : ''}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isActive ? (
              <IconPlugConnected className="text-success" size={20} />
            ) : (
              <IconPlug className="text-base-content/50" size={20} />
            )}
            <div>
              <CardTitle className="text-base">{module.manifest.name}</CardTitle>
              <div className="text-xs text-base-content/60">v{module.version}</div>
            </div>
          </div>
          <Badge className={moduleStateBadgeVariant[module.state as ModuleState]}>
            {moduleStateLabel[module.state as ModuleState]}
          </Badge>
        </div>

        {/* Description */}
        {module.manifest.description && (
          <p className="text-sm text-base-content/70 mb-3">{module.manifest.description}</p>
        )}

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {module.manifest.capabilities.map((cap: ModuleCapability, idx: number) => (
            <Badge key={idx} variant="ghost" size="sm" className="gap-1">
              {getCapabilityIcon(cap.type)}
              {cap.typeId || cap.generatorId || capabilityLabel[cap.type]}
            </Badge>
          ))}
        </div>

        {/* Error message */}
        {isError && module.lastError && (
          <Alert color="error" className="mb-3 py-2">
            <IconAlertCircle size={16} />
            <span className="text-xs">{module.lastError}</span>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {isActive ? (
            <Button
              size="sm"
              color="warning"
              onClick={() => onAction(module.moduleId, 'deactivate')}
              disabled={isTransitioning || isThisLoading}
              processing={isThisLoading}
            >
              <IconPower size={14} />
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              color="success"
              onClick={() => onAction(module.moduleId, 'activate')}
              disabled={isTransitioning || isError || isThisLoading}
              processing={isThisLoading}
            >
              <IconPower size={14} />
              Activate
            </Button>
          )}
          <Button
            size="sm"
            style="ghost"
            onClick={() => onViewDetails(module.moduleId)}
          >
            <IconSettings size={14} />
            Settings
          </Button>
          <Button
            size="sm"
            style="ghost"
            onClick={() => onAction(module.moduleId, 'uninstall')}
            disabled={isTransitioning || isThisLoading}
            className="text-error hover:bg-error/10"
          >
            <IconTrash size={14} />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function InstallModuleModal({
  modalId,
  onInstall,
  isInstalling,
}: {
  modalId: string
  onInstall: (source: ModuleSource, activate: boolean) => void
  isInstalling: boolean
}) {
  const [sourceType, setSourceType] = useState<'npm' | 'url' | 'local'>('npm')
  const [packageName, setPackageName] = useState('')
  const [packageVersion, setPackageVersion] = useState('')
  const [url, setUrl] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [autoActivate, setAutoActivate] = useState(true)

  const handleInstall = () => {
    let source: ModuleSource

    switch (sourceType) {
      case 'npm':
        source = {
          type: 'npm',
          package: packageName,
          version: packageVersion || undefined,
        }
        break
      case 'url':
        source = {
          type: 'url',
          url: url,
        }
        break
      case 'local':
        source = {
          type: 'local',
          path: localPath,
        }
        break
    }

    onInstall(source, autoActivate)
  }

  const isValid = () => {
    switch (sourceType) {
      case 'npm':
        return packageName.trim().length > 0
      case 'url':
        return url.trim().length > 0 && url.startsWith('http')
      case 'local':
        return localPath.trim().length > 0
    }
  }

  return (
    <Modal id={modalId}>
      <ModalBox>
        <h3 className="font-bold text-lg mb-4">Install Module</h3>

        <div className="space-y-4">
          {/* Source type selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source Type</span>
            </label>
            <Select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as 'npm' | 'url' | 'local')}
            >
              <option value="npm">NPM Package</option>
              <option value="url">URL</option>
              <option value="local">Local Path</option>
            </Select>
          </div>

          {/* NPM source fields */}
          {sourceType === 'npm' && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Package Name</span>
                </label>
                <Input
                  placeholder="@store/module-name"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version (optional)</span>
                </label>
                <Input
                  placeholder="latest"
                  value={packageVersion}
                  onChange={(e) => setPackageVersion(e.target.value)}
                />
              </div>
            </>
          )}

          {/* URL source field */}
          {sourceType === 'url' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Module URL</span>
              </label>
              <Input
                placeholder="https://example.com/module.tar.gz"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {/* Local path field */}
          {sourceType === 'local' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Local Path</span>
              </label>
              <Input
                placeholder="/path/to/module"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
              />
            </div>
          )}

          {/* Auto-activate checkbox */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={autoActivate}
                onChange={(e) => setAutoActivate(e.target.checked)}
              />
              <span className="label-text">Activate after installation</span>
            </label>
          </div>
        </div>

        <ModalAction>
          <form method="dialog">
            <Button style="ghost" disabled={isInstalling}>
              Cancel
            </Button>
          </form>
          <Button
            color="primary"
            onClick={handleInstall}
            disabled={!isValid() || isInstalling}
            processing={isInstalling}
          >
            <IconPlus size={16} />
            Install
          </Button>
        </ModalAction>
      </ModalBox>
    </Modal>
  )
}

export default function ModulesPage({ modules, apiUrl, apiToken }: ModulesPageProps) {
  const [isInstalling, setIsInstalling] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const moduleList = modules?.data || []
  const activeModules = moduleList.filter((m) => m.state === 'active')
  const inactiveModules = moduleList.filter((m) => m.state !== 'active')

  const handleAction = async (moduleId: string, action: string) => {
    setActionLoading(moduleId)
    setError(null)
    setSuccessMessage(null)

    try {
      const baseUrl = apiUrl || window.__API_URL__ || ''
      const token = apiToken || window.__ADMIN_TOKEN__ || ''

      let url: string
      let method: string
      let body: string | undefined

      if (action === 'uninstall') {
        url = `${baseUrl}/api/admin/modules/${encodeURIComponent(moduleId)}`
        method = 'DELETE'
      } else {
        url = `${baseUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/action`
        method = 'POST'
        body = JSON.stringify({ action })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error || `Failed to ${action} module`)
      }

      setSuccessMessage(`Module ${action}d successfully`)
      // Reload page to show updated state
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleInstall = async (source: ModuleSource, activate: boolean) => {
    setIsInstalling(true)
    setError(null)

    try {
      const baseUrl = apiUrl || window.__API_URL__ || ''
      const token = apiToken || window.__ADMIN_TOKEN__ || ''

      const response = await fetch(`${baseUrl}/api/admin/modules/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ source, activate }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error || 'Failed to install module')
      }

      setSuccessMessage('Module installed successfully')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleReloadAll = async () => {
    setActionLoading('reload-all')
    setError(null)

    try {
      const baseUrl = apiUrl || window.__API_URL__ || ''
      const token = apiToken || window.__ADMIN_TOKEN__ || ''

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

  const handleViewDetails = (moduleId: string) => {
    window.location.href = `/dashboard/modules/${encodeURIComponent(moduleId)}`
  }

  const openInstallModal = () => {
    const modal = document.getElementById('install-module-modal') as HTMLDialogElement
    modal?.showModal()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-base-content/60">
            Manage installed modules and extensions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            style="ghost"
            onClick={handleReloadAll}
            disabled={actionLoading === 'reload-all'}
            processing={actionLoading === 'reload-all'}
          >
            <IconRefresh size={16} />
            Reload All
          </Button>
          <Button color="primary" onClick={openInstallModal}>
            <IconPlus size={16} />
            Install Module
          </Button>
        </div>
      </div>

      {/* Error/Success alerts */}
      {error && (
        <Alert color="error">
          <IconAlertCircle size={16} />
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

      {/* Module grid */}
      {moduleList.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <IconPackage size={48} className="mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No modules installed</h3>
            <p className="text-base-content/60 mb-4">
              Install a module to extend your Store with new features.
            </p>
            <Button color="primary" onClick={openInstallModal}>
              <IconPlus size={16} />
              Install Your First Module
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moduleList.map((module) => (
            <ModuleCard
              key={module.moduleId}
              module={module}
              onAction={handleAction}
              onViewDetails={handleViewDetails}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Install modal */}
      <InstallModuleModal
        modalId="install-module-modal"
        onInstall={handleInstall}
        isInstalling={isInstalling}
      />
    </div>
  )
}

// Declare global window types
declare global {
  interface Window {
    __API_URL__?: string
    __ADMIN_TOKEN__?: string
  }
}
