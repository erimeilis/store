/**
 * Table Type Conversion Dialog
 * Handles conversion between table types: default, sale, rent
 */

import React, { useEffect } from 'react';
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
  IconTable
} from '@tabler/icons-react';
import type { TableType } from '@/types/dynamic-tables';

export interface TableTypeConversionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  currentType: TableType;
  newType: TableType;
  tableName: string;
  hasExistingPriceColumn?: boolean;
  hasExistingQtyColumn?: boolean;
  hasExistingFeeColumn?: boolean;
  hasExistingUsedColumn?: boolean;
  hasExistingAvailableColumn?: boolean;
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

export function TableTypeConversionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  currentType,
  newType,
  tableName,
  hasExistingPriceColumn = false,
  hasExistingQtyColumn = false,
  hasExistingFeeColumn = false,
  hasExistingUsedColumn = false,
  hasExistingAvailableColumn = false
}: TableTypeConversionDialogProps) {
  const currentConfig = TYPE_CONFIG[currentType];
  const newConfig = TYPE_CONFIG[newType];

  // Calculate what columns will be added
  const getColumnsToAdd = (): string[] => {
    const columns: string[] = [];

    if (newType === 'sale') {
      if (!hasExistingPriceColumn) columns.push('price');
      if (!hasExistingQtyColumn) columns.push('qty');
    } else if (newType === 'rent') {
      if (!hasExistingPriceColumn) columns.push('price');
      if (!hasExistingFeeColumn) columns.push('fee');
      if (!hasExistingUsedColumn) columns.push('used');
      if (!hasExistingAvailableColumn) columns.push('available');
    }

    return columns;
  };

  // Get what columns will lose protection
  const getColumnsLosingProtection = (): string[] => {
    const columns: string[] = [];

    if (currentType === 'sale') {
      if (hasExistingPriceColumn) columns.push('price');
      if (hasExistingQtyColumn) columns.push('qty');
    } else if (currentType === 'rent') {
      if (hasExistingPriceColumn) columns.push('price');
      if (hasExistingFeeColumn) columns.push('fee');
      if (hasExistingUsedColumn) columns.push('used');
      if (hasExistingAvailableColumn) columns.push('available');
    }

    return columns;
  };

  const columnsToAdd = getColumnsToAdd();
  const columnsLosingProtection = getColumnsLosingProtection();
  const isEcommerceConversion = newType !== 'default';
  const isRemovingEcommerce = newType === 'default' && currentType !== 'default';

  // Determine button color based on new type
  const getButtonColor = () => {
    if (newType === 'sale') return 'success';
    if (newType === 'rent') return 'info';
    return 'warning';
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
      <ModalBox className="max-w-lg">
        <h3 className="font-bold text-lg flex items-center gap-3 mb-4">
          {isRemovingEcommerce ? (
            <Icon iconNode={IconAlertTriangle} className="h-6 w-6 text-warning" />
          ) : (
            <Icon iconNode={newConfig.icon} className={`h-6 w-6 ${newConfig.color}`} />
          )}
          <span>Change Table Type?</span>
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
            Convert <span className="font-medium">"{tableName}"</span> from <span className="font-medium">{currentConfig.label}</span> to <span className="font-medium">{newConfig.label}</span>.
          </p>

          {/* Columns to be added */}
          {columnsToAdd.length > 0 && (
            <Alert color="info">
              <Icon iconNode={IconInfoCircle} className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">New columns will be created</p>
                <p className="text-sm">
                  The following protected columns will be automatically added:{' '}
                  {columnsToAdd.map((col, i) => (
                    <span key={col}>
                      <code className="badge badge-info badge-xs">{col}</code>
                      {i < columnsToAdd.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              </div>
            </Alert>
          )}

          {/* Columns losing protection */}
          {columnsLosingProtection.length > 0 && (
            <Alert color="warning">
              <Icon iconNode={IconAlertTriangle} className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Columns will lose protection</p>
                <p className="text-sm">
                  The following columns will become regular columns:{' '}
                  {columnsLosingProtection.map((col, i) => (
                    <span key={col}>
                      <code className="badge badge-warning badge-xs">{col}</code>
                      {i < columnsLosingProtection.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              </div>
            </Alert>
          )}

          {/* Feature info for sale */}
          {newType === 'sale' && (
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

          {/* Feature info for rent */}
          {newType === 'rent' && (
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
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            color={getButtonColor()}
            style="soft"
            onClick={onConfirm}
            disabled={isLoading}
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
        <button onClick={onClose} disabled={isLoading}>close</button>
      </form>
    </Modal>
  );
}
