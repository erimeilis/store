/**
 * Module Detail/Settings Page
 * Shows module details, settings, events, and analytics
 */

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { Tabs, type TabItem } from '@/components/ui/tab'
import { PageHeader, createBreadcrumbs } from '@/components/page/page-header'
import {
  IconPlugConnected,
  IconPlug,
  IconPower,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconColumns,
  IconWand,
  IconApi,
  IconPackage,
  IconExternalLink,
  IconBrandGit,
  IconLicense,
  IconUser,
} from '@tabler/icons-react'
import { ModuleActions, type ModuleAction } from '@/components/modules/actions'
import type {
  InstalledModule,
  ModuleEvent,
  ModuleAnalytics,
  ModuleSettingDefinition,
  ModuleCapability,
  ModuleStatus,
  PaginatedModuleEventsResponse,
} from '@/types/modules'
import {
  moduleStatusBadgeVariant,
  moduleStatusLabel,
  capabilityLabel,
} from '@/types/modules'
import { formatApiDate } from '@/lib/date-utils'

interface ModuleDetailPageProps {
  moduleData?: InstalledModule | null
  moduleEvents?: PaginatedModuleEventsResponse | null
  moduleAnalytics?: ModuleAnalytics | null
  moduleId: string
  apiUrl?: string
  apiToken?: string
}

function getCapabilityIcon(type: string) {
  switch (type) {
    case 'columnType':
      return <IconColumns size={16} />
    case 'dataGenerator':
      return <IconWand size={16} />
    case 'api':
      return <IconApi size={16} />
    default:
      return <IconPackage size={16} />
  }
}

function getCapabilityId(cap: ModuleCapability): string | undefined {
  if (cap.type === 'columnType') return cap.typeId
  if (cap.type === 'dataGenerator') return cap.generatorId
  if (cap.type === 'api') return cap.basePath
  return undefined
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'activate':
      return <IconPower size={14} className="text-success" />
    case 'deactivate':
      return <IconPower size={14} className="text-warning" />
    case 'error':
      return <IconAlertCircle size={14} className="text-error" />
    case 'install':
      return <IconCheck size={14} className="text-info" />
    default:
      return <IconClock size={14} />
  }
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? date : date.toISOString()
  return formatApiDate(d)
}

function SettingsContent({
  module,
  onSaveSettings,
  isSaving,
}: {
  module: InstalledModule
  onSaveSettings: (settings: Record<string, unknown>) => void
  isSaving: boolean
}) {
  const [settings, setSettings] = useState<Record<string, unknown>>(module.settings || {})
  const [hasChanges, setHasChanges] = useState(false)

  const settingsDefs = module.manifest.settings || []

  const handleChange = (settingId: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [settingId]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSaveSettings(settings)
    setHasChanges(false)
  }

  if (settingsDefs.length === 0) {
    return (
      <Card>
        <CardBody className="py-8 text-center">
          <p className="text-base-content/60">This module has no configurable settings.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Module Settings</CardTitle>
        <div className="space-y-4">
          {settingsDefs.map((def: ModuleSettingDefinition) => (
            <div key={def.id} className="form-control">
              <label className="label">
                <span className="label-text">
                  {def.displayName}
                  {def.required && <span className="text-error ml-1">*</span>}
                </span>
              </label>
              {def.description && (
                <p className="text-xs text-base-content/60 mb-2">{def.description}</p>
              )}

              {def.type === 'string' && (
                <Input
                  value={(settings[def.id] as string) || (def.default as string) || ''}
                  onChange={(e) => handleChange(def.id, e.target.value)}
                />
              )}

              {def.type === 'number' && (
                <Input
                  type="number"
                  value={(settings[def.id] as number) ?? (def.default as number) ?? ''}
                  onChange={(e) => handleChange(def.id, parseFloat(e.target.value))}
                />
              )}

              {def.type === 'boolean' && (
                <Toggle
                  checked={(settings[def.id] as boolean) ?? (def.default as boolean) ?? false}
                  onChange={(e) => handleChange(def.id, e.target.checked)}
                />
              )}

              {def.type === 'select' && (
                <Select
                  value={(settings[def.id] as string) || (def.default as string) || ''}
                  onChange={(e) => handleChange(def.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {def.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              color="primary"
              icon={IconCheck}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              processing={isSaving}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function EventsContent({ events }: { events: ModuleEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardBody className="py-8 text-center">
          <p className="text-base-content/60">No events recorded yet.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Recent Events</CardTitle>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 rounded-lg bg-base-200 ${
                event.eventType === 'error' ? 'border-l-4 border-error' : ''
              }`}
            >
              {getEventIcon(event.eventType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{event.eventType}</span>
                  {event.newStatus && (
                    <Badge size="xs" variant="ghost">
                      {event.previousStatus} → {event.newStatus}
                    </Badge>
                  )}
                </div>
                {event.details && (
                  <p className="text-sm text-base-content/70">
                    {JSON.stringify(event.details)}
                  </p>
                )}
                <p className="text-xs text-base-content/50 mt-1">
                  {formatDate(event.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

function AnalyticsContent({ analytics }: { analytics: ModuleAnalytics | null }) {
  if (!analytics) {
    return (
      <Card>
        <CardBody className="py-8 text-center">
          <p className="text-base-content/60">No analytics data available.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="stats stats-horizontal bg-base-100 shadow w-full">
        <div className="stat">
          <div className="stat-title">Generator Calls</div>
          <div className="stat-value text-xl">{analytics.generatorInvocations}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Activations</div>
          <div className="stat-value text-xl">{analytics.activeInstances}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Avg API Response</div>
          <div className="stat-value text-xl">{analytics.avgApiResponseTimeMs.toFixed(0)}ms</div>
        </div>
        <div className="stat">
          <div className="stat-title">Errors</div>
          <div className="stat-value text-xl text-error">{analytics.errorCount}</div>
        </div>
      </div>

      {/* Column type usage */}
      {Object.keys(analytics.columnTypeUsage).length > 0 && (
        <Card>
          <CardBody>
            <CardTitle className="mb-4">Column Type Usage</CardTitle>
            <div className="space-y-2">
              {Object.entries(analytics.columnTypeUsage).map(([typeId, count]) => (
                <div key={typeId} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconColumns size={14} />
                    {typeId}
                  </span>
                  <Badge variant="ghost">{String(count)} uses</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Last error */}
      {analytics.lastError && (
        <Alert color="error">
          <IconAlertCircle size={16} />
          <span>
            <strong>Last Error:</strong> {analytics.lastError.message}
          </span>
        </Alert>
      )}
    </div>
  )
}

export default function ModuleDetailPage({
  moduleData,
  moduleEvents,
  moduleAnalytics,
  moduleId,
  apiUrl,
  apiToken,
}: ModuleDetailPageProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!moduleData) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={createBreadcrumbs.detail('Modules', '/dashboard/modules', 'Not Found')}
          icon={IconPlug}
          title="Module Not Found"
          subtitle={`The module "${moduleId}" could not be found`}
        />
        <Alert color="error">
          <IconAlertCircle size={16} />
          <span>Module not found: {moduleId}</span>
        </Alert>
      </div>
    )
  }

  const isActive = moduleData.status === 'active'
  const isError = moduleData.status === 'error'

  const handleAction = async (action: string) => {
    setActionLoading(action)
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

      if (action === 'uninstall') {
        window.location.href = '/dashboard/modules'
      } else {
        setSuccessMessage(`Module ${action}d successfully`)
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveSettings = async (settings: Record<string, unknown>) => {
    setActionLoading('save-settings')
    setError(null)

    try {
      const baseUrl = apiUrl || window.__API_URL__ || ''
      const token = apiToken || window.__ADMIN_TOKEN__ || ''

      const response = await fetch(
        `${baseUrl}/api/admin/modules/${encodeURIComponent(moduleId)}/settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ settings }),
        }
      )

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccessMessage('Settings saved successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const events = moduleEvents?.data || []

  // Build tab items
  const tabItems: TabItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <SettingsContent
          module={moduleData}
          onSaveSettings={handleSaveSettings}
          isSaving={actionLoading === 'save-settings'}
        />
      ),
    },
    {
      id: 'events',
      label: `Events (${events.length})`,
      content: <EventsContent events={events} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: <AnalyticsContent analytics={moduleAnalytics ?? null} />,
    },
  ]

  const moduleName = moduleData.displayName || moduleData.manifest.name

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumbs={createBreadcrumbs.detail('Modules', '/dashboard/modules', moduleName)}
        icon={isActive ? IconPlugConnected : IconPlug}
        title={moduleName}
        subtitle={moduleData.description || `Module v${moduleData.version}`}
        badge={
          <div className="flex items-center gap-2">
            <Badge className={moduleStatusBadgeVariant[moduleData.status as ModuleStatus]}>
              {moduleStatusLabel[moduleData.status as ModuleStatus]}
            </Badge>
            <span className="text-sm text-base-content/60">v{moduleData.version}</span>
          </div>
        }
        actions={
          <ModuleActions
            isActive={isActive}
            isError={isError}
            actionLoading={actionLoading}
            onAction={(action: ModuleAction) => handleAction(action)}
          />
        }
      />

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

      {/* Error details */}
      {isError && moduleData.error && (
        <Alert color="error">
          <IconAlertCircle size={16} />
          <span>
            <strong>Module Error:</strong> {moduleData.error}
          </span>
        </Alert>
      )}

      {/* Module info cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Capabilities */}
        <Card>
          <CardBody>
            <CardTitle className="text-sm mb-3">Capabilities</CardTitle>
            <div className="space-y-2">
              {moduleData.manifest.capabilities.map((cap: ModuleCapability, idx: number) => {
                const capId = getCapabilityId(cap)
                return (
                  <div key={idx} className="flex items-center gap-2">
                    {getCapabilityIcon(cap.type)}
                    <span className="text-sm">
                      {capabilityLabel[cap.type]}
                      {capId && (
                        <span className="text-base-content/60 ml-1">
                          ({capId})
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Metadata */}
        <Card>
          <CardBody>
            <CardTitle className="text-sm mb-3">Module Info</CardTitle>
            <div className="space-y-2">
              {moduleData.author && (
                <div className="flex items-center gap-2 text-sm">
                  <IconUser size={14} className="text-base-content/50" />
                  {moduleData.author.name}
                </div>
              )}
              {moduleData.manifest.license && (
                <div className="flex items-center gap-2 text-sm">
                  <IconLicense size={14} className="text-base-content/50" />
                  {moduleData.manifest.license}
                </div>
              )}
              {moduleData.manifest.repository && (
                <a
                  href={moduleData.manifest.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <IconBrandGit size={14} />
                  Repository
                  <IconExternalLink size={12} />
                </a>
              )}
              {moduleData.manifest.homepage && (
                <a
                  href={moduleData.manifest.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <IconExternalLink size={14} />
                  Homepage
                </a>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardBody>
            <CardTitle className="text-sm mb-3">Timeline</CardTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/60">Installed</span>
                <span>{formatDate(moduleData.installedAt)}</span>
              </div>
              {moduleData.activatedAt && (
                <div className="flex justify-between">
                  <span className="text-base-content/60">Activated</span>
                  <span>{formatDate(moduleData.activatedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-content/60">Source</span>
                <Badge variant="ghost" size="sm">
                  {moduleData.source.type}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs items={tabItems} variant="boxed" />
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
