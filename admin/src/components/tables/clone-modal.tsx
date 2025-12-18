'use client'

import React, { useState } from 'react'
import { Modal, ModalBox, ModalAction, ModalBackdrop } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { UserTable, TableVisibility } from '@/types/dynamic-tables'

export interface TableCloneModalProps {
  modalId: string
  sourceTable: UserTable | null
  user?: { id: string; email: string; name: string }
  onClose: () => void
  onSuccess: () => void
}

export function TableCloneModal({ modalId, sourceTable, user, onClose, onSuccess }: TableCloneModalProps) {
  const [newTableName, setNewTableName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<TableVisibility>('private')
  const [forSale, setForSale] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [error, setError] = useState('')

  // Initialize form when source table changes
  React.useEffect(() => {
    if (sourceTable) {
      setNewTableName(`${sourceTable.name} Copy`)
      setDescription(`Clone of ${sourceTable.name}`)
      // Preserve source table properties by default
      setVisibility(sourceTable.visibility)
      setForSale(sourceTable.forSale)
    }
    setError('')
  }, [sourceTable])

  const handleClone = async () => {
    if (!sourceTable || !newTableName.trim()) {
      setError('Table name is required')
      return
    }

    setIsCloning(true)
    setError('')

    try {
      // Use frontend server endpoint which will proxy to backend
      const cloneUrl = '/api/tables/clone'
      console.log('🔄 Clone API call:', { cloneUrl, sourceTable: sourceTable.id, user })

      const response = await fetch(cloneUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include user session info for proper authentication
          ...(user?.email && { 'X-User-Email': user.email }),
          ...(user?.name && { 'X-User-Name': user.name }),
          ...(user?.id && { 'X-User-Id': user.id }),
        },
        credentials: 'include', // Include cookies for session auth
        body: JSON.stringify({
          sourceTableId: sourceTable.id,
          newTableName: newTableName.trim(),
          description: description.trim() || undefined,
          visibility,
          forSale
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Clone failed' })) as { message?: string }
        throw new Error(errorData.message || 'Failed to clone table')
      }

      const result = await response.json()
      console.log('✅ Clone API success:', result)
      onSuccess()
      onClose()
      // Reset form
      setNewTableName('')
      setDescription('')
      setVisibility('private')
      setForSale(false)
    } catch (err) {
      console.error('❌ Clone API error:', err)
      setError(err instanceof Error ? err.message : 'Failed to clone table')
    } finally {
      setIsCloning(false)
    }
  }

  const handleCancel = () => {
    onClose()
    setError('')
  }

  return (
    <Modal id={modalId}>
      <ModalBox className="w-11/12 max-w-md">
        <h3 className="font-bold text-lg">Clone Table</h3>

        {sourceTable && (
          <div className="py-2">
            <div className="text-sm text-base-content/70 mb-4">
              Cloning: <strong>{sourceTable.name}</strong>
            </div>

            <div className="space-y-4">
              {/* Table Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Table Name *</span>
                </label>
                <Input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter table name..."
                  className="w-full"
                  disabled={isCloning}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full"
                  disabled={isCloning}
                />
              </div>

              {/* Visibility */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Visibility</span>
                </label>
                <Select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as TableVisibility)}
                  disabled={isCloning}
                  options={[
                    { value: 'private', label: 'Private (Only you can access)' },
                    { value: 'public', label: 'Public (Everyone can view)' },
                    { value: 'shared', label: 'Shared (All users can edit)' }
                  ]}
                />
              </div>

              {/* For Sale */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">For Sale</span>
                  <Checkbox
                    checked={forSale}
                    onChange={(e) => setForSale(e.target.checked)}
                    disabled={isCloning}
                  />
                </label>
                <div className="text-xs text-base-content/60 mt-1">
                  Enable e-commerce functionality for this table
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-error">
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <ModalAction>
          <Button
            color="success"
            onClick={handleClone}
            processing={isCloning}
            disabled={!newTableName.trim() || isCloning}
          >
            {isCloning ? 'Cloning...' : 'Clone Table'}
          </Button>
          <Button
            style="ghost"
            onClick={handleCancel}
            disabled={isCloning}
          >
            Cancel
          </Button>
        </ModalAction>
      </ModalBox>
      <ModalBackdrop />
    </Modal>
  )
}