/**
 * Table Type Conversion Dialog
 * Handles conversion between table types: default, sale, rent
 * Includes column mapping UI for matching existing columns to required columns
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Modal, ModalBox, ModalAction } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/icon';
import {
  IconShoppingCart,
  IconClock,
  IconAlertTriangle,
  IconInfoCircle,
  IconArrowRight,
  IconTable,
  IconPlus,
  IconCheck,
  IconArrowsExchange
} from '@tabler/icons-react';
import type {
  TableType,
  RentalPeriod,
  TypeChangePreviewResponse,
  TypeChangeMappingItem,
  RequiredColumnInfo,
  ColumnType
} from '@/types/dynamic-tables';
import { clientApiRequest } from '@/lib/client-api';

export interface TableTypeConversionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mappings: Array<{ requiredColumn: string; existingColumnId: string | null }>, rentalPeriod?: RentalPeriod) => void;
  isLoading?: boolean;
  currentType: TableType;
  newType: TableType;
  tableName: string;
  tableId: string;
}

const TYPE_CONFIG: Record<TableType, { label: string; icon: typeof IconTable; color: string; bgColor: string; borderColor: string }> = {
  default: {
    label: 'Default',
    icon: IconTable,
    color: 'text-base-content',
    bgColor: 'bg-base-200',
    borderColor: 'border-base-300'
  },
  sale: {
    label: 'For Sale',
    icon: IconShoppingCart,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30'
  },
  rent: {
    label: 'For Rent',
    icon: IconClock,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30'
  }
};

const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  text: 'Text',
  textarea: 'Long Text',
  number: 'Number',
  integer: 'Integer',
  float: 'Float',
  currency: 'Currency',
  percentage: 'Percentage',
  date: 'Date',
  time: 'Time',
  datetime: 'Date/Time',
  boolean: 'Boolean',
  email: 'Email',
  url: 'URL',
  phone: 'Phone',
  country: 'Country',
  select: 'Select',
  rating: 'Rating',
  color: 'Color'
};

interface ColumnMapping {
  requiredColumn: string;
  existingColumnId: string | null;
  existingColumnName: string | null;
  confidence: number;
}

export function TableTypeConversionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  currentType,
  newType,
  tableName,
  tableId
}: TableTypeConversionDialogProps) {
  const [previewData, setPreviewData] = useState<TypeChangePreviewResponse | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('month');

  const currentConfig = TYPE_CONFIG[currentType];
  const newConfig = TYPE_CONFIG[newType];

  // Fetch preview data when dialog opens
  const fetchPreview = useCallback(async () => {
    if (!tableId || newType === 'default') {
      setPreviewData(null);
      setMappings([]);
      return;
    }

    setLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await clientApiRequest(`/api/tables/${tableId}/preview-type-change`, {
        method: 'POST',
        body: JSON.stringify({ targetType: newType })
      });

      if (response.ok) {
        const result = await response.json() as { data: TypeChangePreviewResponse };
        setPreviewData(result.data);

        // Initialize mappings from suggested mappings
        setMappings(result.data.suggestedMappings.map(m => ({
          requiredColumn: m.requiredColumn,
          existingColumnId: m.existingColumnId,
          existingColumnName: m.existingColumnName,
          confidence: m.confidence
        })));
      } else {
        const errorData = await response.json() as { message?: string };
        setPreviewError(errorData.message || 'Failed to load column preview');
      }
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Failed to load column preview');
    } finally {
      setLoadingPreview(false);
    }
  }, [tableId, newType]);

  useEffect(() => {
    if (isOpen && tableId) {
      fetchPreview();
    }
  }, [isOpen, tableId, fetchPreview]);

  // Handle mapping change
  const handleMappingChange = (requiredColumn: string, existingColumnId: string | null) => {
    setMappings(prev => prev.map(m => {
      if (m.requiredColumn === requiredColumn) {
        // Find the column name for display
        const existingCol = previewData?.existingColumns.find(c => c.id === existingColumnId);
        return {
          ...m,
          existingColumnId,
          existingColumnName: existingCol?.name || null,
          confidence: existingColumnId ? 100 : 0 // User selection = 100% confidence
        };
      }
      return m;
    }));
  };

  // Check if a column is already mapped to another required column
  const isColumnMapped = (columnId: string, excludeRequired: string): boolean => {
    return mappings.some(m => m.existingColumnId === columnId && m.requiredColumn !== excludeRequired);
  };

  // Get unmapped columns for dropdown (exclude already-mapped columns)
  const getAvailableColumns = (requiredColumn: string) => {
    return previewData?.existingColumns.filter(col => {
      return !isColumnMapped(col.id, requiredColumn);
    }) || [];
  };

  // Handle confirm
  const handleConfirm = () => {
    const mappingData = mappings.map(m => ({
      requiredColumn: m.requiredColumn,
      existingColumnId: m.existingColumnId
    }));
    onConfirm(mappingData, newType === 'rent' ? rentalPeriod : undefined);
  };

  // Get columns that will be created (no mapping)
  const columnsToCreate = mappings.filter(m => m.existingColumnId === null);

  // Get columns that will be renamed (have mapping with different name)
  const columnsToRename = mappings.filter(m =>
    m.existingColumnId !== null &&
    m.existingColumnName !== null &&
    m.existingColumnName.toLowerCase() !== m.requiredColumn.toLowerCase()
  );

  // Get columns that already match
  const columnsAlreadyMatch = mappings.filter(m =>
    m.existingColumnId !== null &&
    m.existingColumnName !== null &&
    m.existingColumnName.toLowerCase() === m.requiredColumn.toLowerCase()
  );

  const isRemovingEcommerce = newType === 'default' && currentType !== 'default';

  // Get button color based on new type
  const getButtonColor = () => {
    if (newType === 'sale') return 'success';
    if (newType === 'rent') return 'info';
    return 'warning';
  };

  // Get confidence badge color
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'badge-success';
    if (confidence >= 70) return 'badge-info';
    if (confidence >= 50) return 'badge-warning';
    return 'badge-ghost';
  };

  useEffect(() => {
    const dialog = document.getElementById('table-type-conversion-dialog') as HTMLDialogElement;
    if (dialog) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }, [isOpen]);

  return (
    <Modal id="table-type-conversion-dialog" placement="middle">
      <ModalBox className="max-w-2xl">
        <h3 className="font-bold text-lg flex items-center gap-3 mb-4">
          {isRemovingEcommerce ? (
            <Icon iconNode={IconAlertTriangle} className="h-6 w-6 text-warning" />
          ) : (
            <Icon iconNode={newConfig.icon} className={`h-6 w-6 ${newConfig.color}`} />
          )}
          <span>Change Table Type</span>
        </h3>

        <div className="space-y-4">
          {/* Conversion visualization */}
          <div className="flex items-center justify-center gap-4 p-4 bg-base-200 rounded-lg">
            <div className={`px-4 py-2 rounded-lg border ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
              <div className="flex items-center gap-2">
                <Icon iconNode={currentConfig.icon} className={`h-5 w-5 ${currentConfig.color}`} />
                <span className={`font-medium ${currentConfig.color}`}>{currentConfig.label}</span>
              </div>
            </div>

            <Icon iconNode={IconArrowRight} className="h-5 w-5 text-base-content/60" />

            <div className={`px-4 py-2 rounded-lg border ${newConfig.bgColor} ${newConfig.borderColor}`}>
              <div className="flex items-center gap-2">
                <Icon iconNode={newConfig.icon} className={`h-5 w-5 ${newConfig.color}`} />
                <span className={`font-medium ${newConfig.color}`}>{newConfig.label}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600">
            Convert <span className="font-medium">"{tableName}"</span> from{' '}
            <span className="font-medium">{currentConfig.label}</span> to{' '}
            <span className="font-medium">{newConfig.label}</span>.
          </p>

          {/* Loading state */}
          {loadingPreview && (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-3 text-gray-600">Analyzing columns...</span>
            </div>
          )}

          {/* Error state */}
          {previewError && (
            <Alert color="error">
              <Icon iconNode={IconAlertTriangle} className="h-4 w-4" />
              <span>{previewError}</span>
            </Alert>
          )}

          {/* Column Mapping UI - Only show for e-commerce types */}
          {!loadingPreview && !previewError && previewData && newType !== 'default' && (
            <div className="space-y-4">
              <div className="divider text-sm text-gray-500">Column Mapping</div>

              <p className="text-sm text-gray-600">
                Map your existing columns to the required columns for{' '}
                <span className="font-medium">{newConfig.label}</span> tables.
                Select "Create New" to add a new column.
              </p>

              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Required Column</th>
                      <th>Type</th>
                      <th>Map From</th>
                      <th className="w-20">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping) => {
                      const requiredCol = previewData.requiredColumns.find(
                        c => c.name === mapping.requiredColumn
                      );
                      const availableColumns = getAvailableColumns(mapping.requiredColumn);

                      return (
                        <tr key={mapping.requiredColumn} className="hover">
                          <td>
                            <div className="flex items-center gap-2">
                              <code className="badge badge-primary badge-sm">{mapping.requiredColumn}</code>
                              {requiredCol?.isRequired && (
                                <span className="text-error text-xs">*</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-xs text-gray-500">
                              {requiredCol ? COLUMN_TYPE_LABELS[requiredCol.type] || requiredCol.type : ''}
                            </span>
                          </td>
                          <td>
                            <select
                              className="select select-sm select-bordered w-full max-w-xs"
                              value={mapping.existingColumnId || ''}
                              onChange={(e) => handleMappingChange(
                                mapping.requiredColumn,
                                e.target.value || null
                              )}
                            >
                              <option value="">
                                + Create New Column
                              </option>
                              {availableColumns.map(col => (
                                <option key={col.id} value={col.id}>
                                  {col.name} ({COLUMN_TYPE_LABELS[col.type] || col.type})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {mapping.existingColumnId ? (
                              mapping.existingColumnName?.toLowerCase() === mapping.requiredColumn.toLowerCase() ? (
                                <span className="badge badge-success badge-sm gap-1">
                                  <Icon iconNode={IconCheck} className="h-3 w-3" />
                                  Exact
                                </span>
                              ) : (
                                <span className={`badge badge-sm ${getConfidenceBadge(mapping.confidence)}`}>
                                  {mapping.confidence}%
                                </span>
                              )
                            ) : (
                              <span className="badge badge-ghost badge-sm">
                                <Icon iconNode={IconPlus} className="h-3 w-3" />
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary of changes */}
              <div className="space-y-2">
                {columnsAlreadyMatch.length > 0 && (
                  <div className="text-sm text-success flex items-center gap-2">
                    <Icon iconNode={IconCheck} className="h-4 w-4" />
                    <span>
                      <strong>{columnsAlreadyMatch.length}</strong> column{columnsAlreadyMatch.length !== 1 ? 's' : ''} already{' '}
                      {columnsAlreadyMatch.length !== 1 ? 'match' : 'matches'}:{' '}
                      {columnsAlreadyMatch.map(m => m.requiredColumn).join(', ')}
                    </span>
                  </div>
                )}

                {columnsToRename.length > 0 && (
                  <div className="text-sm text-info flex items-center gap-2">
                    <Icon iconNode={IconArrowsExchange} className="h-4 w-4" />
                    <span>
                      <strong>{columnsToRename.length}</strong> column{columnsToRename.length !== 1 ? 's' : ''} will be renamed:{' '}
                      {columnsToRename.map(m => `${m.existingColumnName} → ${m.requiredColumn}`).join(', ')}
                    </span>
                  </div>
                )}

                {columnsToCreate.length > 0 && (
                  <div className="text-sm text-warning flex items-center gap-2">
                    <Icon iconNode={IconPlus} className="h-4 w-4" />
                    <span>
                      <strong>{columnsToCreate.length}</strong> new column{columnsToCreate.length !== 1 ? 's' : ''} will be created:{' '}
                      {columnsToCreate.map(m => m.requiredColumn).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rental period selector for rent type */}
          {newType === 'rent' && !loadingPreview && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Rental Period</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={rentalPeriod}
                onChange={(e) => setRentalPeriod(e.target.value as RentalPeriod)}
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          )}

          {/* Feature info for sale - Only when not loading */}
          {newType === 'sale' && !loadingPreview && (
            <div className="bg-success/10 p-3 rounded-lg border border-success/30">
              <p className="text-sm font-medium text-success mb-2">Sale table features:</p>
              <ul className="text-sm text-success/90 space-y-1">
                <li>• Protected price and quantity columns</li>
                <li>• Item purchasing workflow</li>
                <li>• Sales transaction tracking</li>
                <li>• Inventory management</li>
              </ul>
            </div>
          )}

          {/* Feature info for rent - Only when not loading */}
          {newType === 'rent' && !loadingPreview && (
            <div className="bg-info/10 p-3 rounded-lg border border-info/30">
              <p className="text-sm font-medium text-info mb-2">Rental table features:</p>
              <ul className="text-sm text-info/90 space-y-1">
                <li>• Protected price, fee, used, and available columns</li>
                <li>• Item rental workflow (rent → release)</li>
                <li>• Rental transaction tracking</li>
                <li>• Availability management</li>
              </ul>
            </div>
          )}

          {/* Warning for removing e-commerce */}
          {isRemovingEcommerce && (
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/30">
              <p className="text-sm font-medium text-warning mb-2">After conversion:</p>
              <ul className="text-sm text-warning/90 space-y-1">
                <li>• E-commerce columns become regular columns</li>
                <li>• No more column protection</li>
                <li>• E-commerce features disabled</li>
                <li>• Existing data remains intact</li>
              </ul>
            </div>
          )}
        </div>

        <ModalAction>
          <Button
            type="button"
            style="ghost"
            onClick={onClose}
            disabled={isLoading || loadingPreview}
          >
            Cancel
          </Button>

          <Button
            type="button"
            color={getButtonColor()}
            style="soft"
            onClick={handleConfirm}
            disabled={isLoading || loadingPreview}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Converting...
              </>
            ) : (
              <>
                <Icon iconNode={newConfig.icon} className="h-4 w-4 mr-1" />
                Convert to {newConfig.label}
              </>
            )}
          </Button>
        </ModalAction>
      </ModalBox>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isLoading || loadingPreview}>close</button>
      </form>
    </Modal>
  );
}
