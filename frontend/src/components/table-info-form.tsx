/**
 * Table Information Form Component
 * Reusable form for table name, description, and public checkbox
 */

import React from 'react'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ForSaleToggle } from '@/components/for-sale-toggle'

interface TableInfoData {
  name: string
  description: string
  is_public: boolean
  for_sale?: boolean
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

        <Checkbox
          label="Public Table"
          labelPosition="right"
          checked={data.is_public}
          onChange={(e) => onChange('is_public', e.target.checked)}
        />

        <div className="divider text-sm">E-commerce Settings</div>

        <ForSaleToggle
          value={data.for_sale || false}
          onChange={(value) => onChange('for_sale' as keyof TableInfoData, value)}
          showHelp={true}
          className="mt-2"
        />
      </CardBody>
    </Card>
  )
}