/**
 * Table Information Form Component
 * Reusable form for table name, description, visibility, and e-commerce settings
 */

import React from 'react'
import { Card, CardBody, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Icon } from '@/components/icon'
import InputError from '@/components/ui/input-error'
import {
  IconShoppingCart,
  IconClock,
  IconInfoCircle,
  IconTag,
  IconCalendar
} from '@tabler/icons-react'
import type { TableType, RentalPeriod, TableColumn } from '@/types/dynamic-tables'

type TableVisibility = 'private' | 'public' | 'shared'

export interface TableInfoData {
  name: string
  description: string
  visibility: TableVisibility
  tableType: TableType
  productIdColumn: string
  rentalPeriod: RentalPeriod
  /** @deprecated Use tableType instead */
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
  /** Available columns for productIdColumn selector (in Edit mode) */
  availableColumns?: TableColumn[]
  /** Column names for productIdColumn selector (in Create mode) */
  columnNames?: string[]
}

const RENTAL_PERIOD_OPTIONS: { value: RentalPeriod; label: string }[] = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
  { value: 'month', label: 'Per Month' },
  { value: 'year', label: 'Per Year' }
]

export function TableInfoForm({
  data,
  errors = {},
  onChange,
  availableColumns = [],
  columnNames = []
}: TableInfoFormProps) {
  // Build list of available column names for product ID selector
  const productIdOptions = React.useMemo(() => {
    // Combine availableColumns and columnNames
    const columns = availableColumns.length > 0
      ? availableColumns.map(col => col.name)
      : columnNames

    // Filter out protected e-commerce columns
    const protectedColumns = ['price', 'qty', 'fee', 'used', 'available']
    return columns.filter(name => !protectedColumns.includes(name.toLowerCase()))
  }, [availableColumns, columnNames])

  // Handle tableType change
  const handleTableTypeChange = (newType: TableType) => {
    onChange('tableType', newType)
    // Also update legacy forSale for backwards compatibility
    onChange('forSale', newType === 'sale')
    // Set default rental period when switching to rent
    if (newType === 'rent' && !data.rentalPeriod) {
      onChange('rentalPeriod', 'month')
    }
  }

  const isEcommerceTable = data.tableType === 'sale' || data.tableType === 'rent'

  return (
    <Card>
      <CardBody>
        <div className="lg:flex lg:gap-8">
          {/* Left Column - Basic Info (50%) */}
          <div className="lg:w-1/2 space-y-4">
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
            <InputError message={errors.name} />

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
          </div>

          {/* Divider for mobile, vertical line for desktop */}
          <div className="divider lg:divider-horizontal lg:my-0" />

          {/* Right Column - E-commerce Settings (50%) */}
          <div className="lg:w-1/2 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Icon iconNode={IconShoppingCart} className="h-5 w-5" />
              E-commerce Settings
            </h3>

            {/* Table Type Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Table Type</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTableTypeChange('default')}
                  className={`btn btn-sm ${data.tableType === 'default' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => handleTableTypeChange('sale')}
                  className={`btn btn-sm ${data.tableType === 'sale' ? 'btn-success' : 'btn-outline'}`}
                >
                  <Icon iconNode={IconShoppingCart} className="h-4 w-4" />
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => handleTableTypeChange('rent')}
                  className={`btn btn-sm ${data.tableType === 'rent' ? 'btn-info' : 'btn-outline'}`}
                >
                  <Icon iconNode={IconClock} className="h-4 w-4" />
                  For Rent
                </button>
              </div>

              {/* Protected columns info */}
              {data.tableType === 'sale' && (
                <div className="mt-2 text-xs text-base-content/60 flex items-center gap-1">
                  <Icon iconNode={IconInfoCircle} className="h-3 w-3" />
                  <span>Adds protected <code className="badge badge-xs">price</code> and <code className="badge badge-xs">qty</code> columns</span>
                </div>
              )}
              {data.tableType === 'rent' && (
                <div className="mt-2 text-xs text-base-content/60 flex items-center gap-1">
                  <Icon iconNode={IconInfoCircle} className="h-3 w-3" />
                  <span>Adds protected <code className="badge badge-xs">price</code>, <code className="badge badge-xs">fee</code>, <code className="badge badge-xs">used</code>, <code className="badge badge-xs">available</code> columns</span>
                </div>
              )}
            </div>

            {/* E-commerce specific settings */}
            {isEcommerceTable && (
              <>
                {/* Product ID Column */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1">
                      <Icon iconNode={IconTag} className="h-4 w-4" />
                      Product Title Column
                    </span>
                    <div className="tooltip tooltip-left" data-tip="Select which column represents the product name/title for sales and inventory displays">
                      <Icon iconNode={IconInfoCircle} className="h-4 w-4 text-base-content/40 cursor-help" />
                    </div>
                  </label>
                  <Select
                    value={data.productIdColumn || ''}
                    onChange={(e) => onChange('productIdColumn', e.target.value || '')}
                    options={[
                      { value: '', label: 'None (use row ID)' },
                      ...productIdOptions.map(name => ({ value: name, label: name }))
                    ]}
                    placeholder="Select product title column..."
                    className="select-sm"
                  />
                  {productIdOptions.length === 0 && (
                    <p className="text-xs text-warning mt-1">
                      Add columns first to select a product title column
                    </p>
                  )}
                </div>

                {/* Rental Period (only for rent tables) */}
                {data.tableType === 'rent' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-1">
                        <Icon iconNode={IconCalendar} className="h-4 w-4" />
                        Rental Period
                      </span>
                      <div className="tooltip tooltip-left" data-tip="Billing period for rental pricing (e.g., price per month)">
                        <Icon iconNode={IconInfoCircle} className="h-4 w-4 text-base-content/40 cursor-help" />
                      </div>
                    </label>
                    <Select
                      value={data.rentalPeriod || 'month'}
                      onChange={(e) => onChange('rentalPeriod', e.target.value as RentalPeriod)}
                      options={RENTAL_PERIOD_OPTIONS}
                      className="select-sm"
                    />
                  </div>
                )}

                {/* E-commerce status badge */}
                <div className="pt-2">
                  {data.tableType === 'sale' && (
                    <span className="badge badge-success badge-outline gap-1">
                      <Icon iconNode={IconShoppingCart} className="h-3 w-3" />
                      Configured for Sales
                    </span>
                  )}
                  {data.tableType === 'rent' && (
                    <span className="badge badge-info badge-outline gap-1">
                      <Icon iconNode={IconClock} className="h-3 w-3" />
                      Configured for Rentals ({RENTAL_PERIOD_OPTIONS.find(o => o.value === (data.rentalPeriod || 'month'))?.label || 'Per Month'})
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Help text for default type */}
            {data.tableType === 'default' && (
              <div className="text-sm text-base-content/60">
                <p>Regular table without e-commerce features.</p>
                <p className="mt-1">Switch to "For Sale" or "For Rent" to enable:</p>
                <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                  <li>Protected price columns</li>
                  <li>Product inventory tracking</li>
                  <li>Sales/rental transaction history</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
