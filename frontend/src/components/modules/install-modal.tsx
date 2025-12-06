'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal, ModalBox, ModalAction, ModalBackdrop } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert } from '@/components/ui/alert'
import {
  IconPlus,
  IconRefresh,
  IconUpload,
  IconLink,
  IconFolder,
  IconInfoCircle,
  IconFileCode,
} from '@tabler/icons-react'
import type { ModuleSource, ModuleManifest } from '@/types/modules'

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
  const [sourceType, setSourceType] = useState<'local' | 'url' | 'upload'>('local')
  const [url, setUrl] = useState('')
  const [localPath, setLocalPath] = useState('')
  const [uploadedManifest, setUploadedManifest] = useState<ModuleManifest | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const [autoActivate, setAutoActivate] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState('')
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUrl('')
    setLocalPath('')
    setUploadedManifest(null)
    setUploadFileName('')
    setAutoActivate(true)
    setError('')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploadFileName(file.name)

    try {
      const text = await file.text()
      const manifest = JSON.parse(text) as ModuleManifest

      // Basic validation
      if (!manifest.id || !manifest.name || !manifest.version) {
        throw new Error('Invalid manifest: missing required fields (id, name, version)')
      }

      if (!manifest.engines?.moduleApi) {
        throw new Error('Invalid manifest: missing engines.moduleApi field')
      }

      setUploadedManifest(manifest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse manifest file')
      setUploadedManifest(null)
    }
  }

  const handleInstall = async () => {
    let source: ModuleSource

    switch (sourceType) {
      case 'url':
        if (!url.trim()) {
          setError('Please enter a URL')
          return
        }
        source = {
          type: 'url',
          url: url.trim(),
        }
        break
      case 'local':
        if (!localPath) {
          setError('Please select a module')
          return
        }
        source = {
          type: 'local',
          path: localPath,
        }
        break
      case 'upload':
        if (!uploadedManifest) {
          setError('Please upload a valid manifest file')
          return
        }
        source = {
          type: 'upload',
          manifest: uploadedManifest,
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
      case 'url':
        return url.trim().length > 0 && url.startsWith('http')
      case 'local':
        return localPath.trim().length > 0
      case 'upload':
        return uploadedManifest !== null
    }
  }

  const getSourceIcon = () => {
    switch (sourceType) {
      case 'local':
        return IconFolder
      case 'url':
        return IconLink
      case 'upload':
        return IconUpload
    }
  }

  return (
    <Modal id={modalId}>
      <ModalBox className="w-11/12 max-w-lg">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <IconPlus size={20} />
          Install Module
        </h3>

        <div className="py-4 space-y-4">
          {/* Info Alert */}
          <Alert color="info" className="text-sm">
            <IconInfoCircle size={16} />
            <div>
              <strong>Modules are JSON configuration files</strong> that define column types and table generators.
              They use built-in handlers for validation, formatting, and data generation.
            </div>
          </Alert>

          {/* Source Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Installation Source</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`btn btn-sm ${sourceType === 'local' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSourceType('local')}
                disabled={isInstalling}
              >
                <IconFolder size={16} />
                Local
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sourceType === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSourceType('url')}
                disabled={isInstalling}
              >
                <IconLink size={16} />
                URL
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sourceType === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSourceType('upload')}
                disabled={isInstalling}
              >
                <IconUpload size={16} />
                Upload
              </button>
            </div>
          </div>

          {/* Local Module Selection */}
          {sourceType === 'local' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Bundled Module</span>
                <Button
                  size="xs"
                  style="ghost"
                  icon={IconRefresh}
                  onClick={fetchAvailableModules}
                  disabled={isLoadingModules}
                  processing={isLoadingModules}
                />
              </label>
              <p className="text-xs text-base-content/60 mb-2">
                Pre-packaged modules from the <code className="bg-base-200 px-1 rounded">modules/</code> directory
              </p>
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
                    <p className="text-xs text-base-content/60 mt-2">
                      {availableModules.find((m) => m.path === localPath)?.description}
                    </p>
                  )}
                </>
              ) : (
                <div className="alert alert-warning text-sm">
                  No local modules found. Add modules to the <code>modules/</code> directory and rebuild.
                </div>
              )}
            </div>
          )}

          {/* URL Field */}
          {sourceType === 'url' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Manifest URL</span>
              </label>
              <p className="text-xs text-base-content/60 mb-2">
                Direct URL to a <code className="bg-base-200 px-1 rounded">store-module.json</code> manifest file
              </p>
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/my-module/store-module.json"
                className="w-full"
                disabled={isInstalling}
              />
              <p className="text-xs text-base-content/50 mt-1">
                The URL must return valid JSON with id, name, version, and engines.moduleApi fields.
              </p>
            </div>
          )}

          {/* Upload Field */}
          {sourceType === 'upload' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Upload Manifest File</span>
              </label>
              <p className="text-xs text-base-content/60 mb-2">
                Select a <code className="bg-base-200 px-1 rounded">store-module.json</code> file from your computer
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isInstalling}
              />

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadedManifest
                    ? 'border-success bg-success/10'
                    : 'border-base-300 hover:border-primary hover:bg-base-200'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedManifest ? (
                  <div className="space-y-2">
                    <IconFileCode size={32} className="mx-auto text-success" />
                    <div className="font-medium">{uploadedManifest.name}</div>
                    <div className="text-sm text-base-content/60">
                      v{uploadedManifest.version} • {uploadedManifest.id}
                    </div>
                    <div className="text-xs text-base-content/50">{uploadFileName}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <IconUpload size={32} className="mx-auto text-base-content/40" />
                    <div className="text-sm text-base-content/60">
                      Click to select a manifest file
                    </div>
                    <div className="text-xs text-base-content/40">
                      JSON file with module configuration
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto Activate */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Activate immediately after installation</span>
              <Checkbox
                checked={autoActivate}
                onChange={(e) => setAutoActivate(e.target.checked)}
                disabled={isInstalling}
              />
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <Alert color="error">
              <span className="text-sm">{error}</span>
            </Alert>
          )}
        </div>

        <ModalAction>
          <Button
            color="primary"
            icon={getSourceIcon()}
            onClick={handleInstall}
            processing={isInstalling}
            disabled={!isValid() || isInstalling}
          >
            Install Module
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
