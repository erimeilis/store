'use client'

import React, { useState, useEffect } from 'react'
import { Modal, ModalBox, ModalAction, ModalBackdrop } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import type { ModuleSource } from '@/types/modules'

interface AvailableModule {
  path: string
  name: string
  version: string
  description?: string
}

export interface ModuleInstallModalProps {
  modalId: string
  apiUrl?: string
  apiToken?: string
  onInstall: (source: ModuleSource, activate: boolean) => Promise<void>
  onClose: () => void
}

export function ModuleInstallModal({ modalId, apiUrl, apiToken, onInstall, onClose }: ModuleInstallModalProps) {
  const [sourceType, setSourceType] = useState<'npm' | 'url' | 'local'>('local')
  const [packageName, setPackageName] = useState('')
  const [packageVersion, setPackageVersion] = useState('')
  const [url, setUrl] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [autoActivate, setAutoActivate] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState('')
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(false)

  const getApiConfig = () => ({
    baseUrl: apiUrl || window.__API_URL__ || '',
    token: apiToken || window.__ADMIN_TOKEN__ || '',
  })

  const fetchAvailableModules = async () => {
    setIsLoadingModules(true)
    try {
      const { baseUrl, token } = getApiConfig()
      const response = await fetch(`${baseUrl}/api/admin/modules/available`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json() as { data: AvailableModule[] }
        setAvailableModules(data.data || [])
        // Auto-select first module if available
        if (data.data?.length > 0 && !localPath) {
          setLocalPath(data.data[0].path)
        }
      }
    } catch (err) {
      console.error('Failed to fetch available modules:', err)
    } finally {
      setIsLoadingModules(false)
    }
  }

  useEffect(() => {
    if (sourceType === 'local') {
      fetchAvailableModules()
    }
  }, [sourceType])

  const resetForm = () => {
    setSourceType('local')
    setPackageName('')
    setPackageVersion('')
    setUrl('')
    setLocalPath('')
    setAutoActivate(true)
    setError('')
  }

  const handleInstall = async () => {
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

    setIsInstalling(true)
    setError('')

    try {
      await onInstall(source, autoActivate)
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install module')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onClose()
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
      <ModalBox className="w-11/12 max-w-md">
        <h3 className="font-bold text-lg">Install Module</h3>

        <div className="py-4 space-y-4">
          {/* Source Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source Type</span>
            </label>
            <Select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as 'npm' | 'url' | 'local')}
              disabled={isInstalling}
              options={[
                { value: 'npm', label: 'NPM Package' },
                { value: 'url', label: 'URL' },
                { value: 'local', label: 'Local Path' },
              ]}
            />
          </div>

          {/* NPM Fields */}
          {sourceType === 'npm' && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Package Name *</span>
                </label>
                <Input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="@store/module-name"
                  className="w-full"
                  disabled={isInstalling}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <Input
                  type="text"
                  value={packageVersion}
                  onChange={(e) => setPackageVersion(e.target.value)}
                  placeholder="latest"
                  className="w-full"
                  disabled={isInstalling}
                />
              </div>
            </>
          )}

          {/* URL Field */}
          {sourceType === 'url' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Module URL *</span>
              </label>
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/module.tar.gz"
                className="w-full"
                disabled={isInstalling}
              />
            </div>
          )}

          {/* Local Module Selection */}
          {sourceType === 'local' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Available Module *</span>
                <Button
                  size="xs"
                  style="ghost"
                  icon={IconRefresh}
                  onClick={fetchAvailableModules}
                  disabled={isLoadingModules}
                  processing={isLoadingModules}
                />
              </label>
              {availableModules.length > 0 ? (
                <>
                  <Select
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    disabled={isInstalling || isLoadingModules}
                    options={availableModules.map((m) => ({
                      value: m.path,
                      label: `${m.name} (v${m.version})`,
                    }))}
                  />
                  {localPath && (
                    <p className="text-xs text-base-content/60 mt-1 break-words">
                      {availableModules.find((m) => m.path === localPath)?.description}
                    </p>
                  )}
                </>
              ) : (
                <div className="alert alert-warning text-sm">
                  No local modules found in /modules directory
                </div>
              )}
            </div>
          )}

          {/* Auto Activate */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Activate after installation</span>
              <Checkbox
                checked={autoActivate}
                onChange={(e) => setAutoActivate(e.target.checked)}
                disabled={isInstalling}
              />
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error">
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <ModalAction>
          <Button
            color="primary"
            icon={IconPlus}
            onClick={handleInstall}
            processing={isInstalling}
            disabled={!isValid() || isInstalling}
          >
            Install
          </Button>
          <Button
            style="ghost"
            onClick={handleCancel}
            disabled={isInstalling}
          >
            Cancel
          </Button>
        </ModalAction>
      </ModalBox>
      <ModalBackdrop />
    </Modal>
  )
}
