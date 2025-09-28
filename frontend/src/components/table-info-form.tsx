/**
 * Table Information Form Component
 * Reusable form for table name, description, and public checkbox
 */

import React from 'react'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ForSaleToggle } from '@/components/for-sale-toggle'

type TableVisibility = 'private' | 'public' | 'shared'

interface TableInfoData {
  name: string
  description: string
  visibility: TableVisibility
  forSale?: boolean
}

interface ValidationErrors {
  name?: string
  [key: string]: string | undefined
}

interface TableInfoFormProps {
  data: TableInfoData
  errors?: ValidationErrors
  onChange: (field: keyof TableInfoData, value: any) => void
}

export function TableInfoForm({ data, errors = {}, onChange }: TableInfoFormProps) {
  return (
    <Card>
      <CardBody>
        <CardTitle>Table Information</CardTitle>

        <Input
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          label="Table Name *"
          placeholder="Enter table name..."
          maxLength={100}
          className={errors.name ? 'input-error' : ''}
          required
        />
        {errors.name && (
          <p className="text-error text-sm mt-1">{errors.name}</p>
        )}

        <Textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          label="Description"
          placeholder="Describe what this table will be used for..."
          maxLength={500}
          rows={3}
        />

        <div className="form-control">
          <label className="label">
            <span className="label-text">Visibility</span>
          </label>
          <Select
            value={data.visibility}
            onChange={(e) => onChange('visibility', e.target.value as TableVisibility)}
            options={[
              { value: 'private', label: 'Private (Only you can access)' },
              { value: 'public', label: 'Public (Everyone can view)' },
              { value: 'shared', label: 'Shared (All users can edit)' }
            ]}
            placeholder="Select visibility..."
          />
        </div>

        <div className="divider text-sm">E-commerce Settings</div>

        <ForSaleToggle
          value={data.forSale || false}
          onChange={(value) => onChange('forSale' as keyof TableInfoData, value)}
          showHelp={true}
          className="mt-2"
        />
      </CardBody>
    </Card>
  )
}