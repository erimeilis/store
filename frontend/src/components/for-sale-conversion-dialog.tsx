import React, { useEffect } from 'react';
import { Modal, ModalBox, ModalAction } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/icon';
import { IconShoppingCart, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

export interface ForSaleConversionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  conversionType: 'to_sale' | 'from_sale';
  tableName: string;
  hasExistingPriceColumn?: boolean;
  hasExistingQtyColumn?: boolean;
}

export function ForSaleConversionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  conversionType,
  tableName,
  hasExistingPriceColumn = false,
  hasExistingQtyColumn = false
}: ForSaleConversionDialogProps) {
  const isToSale = conversionType === 'to_sale';
  const missingColumns = [];

  if (isToSale) {
    if (!hasExistingPriceColumn) missingColumns.push('price');
    if (!hasExistingQtyColumn) missingColumns.push('qty');
  }

  const getTitle = () => {
    if (isToSale) {
      return 'Enable For Sale Mode?';
    }
    return 'Disable For Sale Mode?';
  };

  const getIcon = () => {
    if (isToSale) {
      return <Icon iconNode={IconShoppingCart} className="h-6 w-6 text-success" />;
    }
    return <Icon iconNode={IconAlertTriangle} className="h-6 w-6 text-warning" />;
  };

  const getDescription = () => {
    if (isToSale) {
      return `Convert "${tableName}" to a "for sale" table to enable e-commerce functionality.`;
    }
    return `Remove "for sale" status from "${tableName}". The table will become a regular data table.`;
  };

  useEffect(() => {
    const dialog = document.getElementById('for-sale-conversion-dialog') as HTMLDialogElement;
    if (dialog) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }, [isOpen]);

  return (
    <Modal id="for-sale-conversion-dialog" placement="middle">
      <ModalBox className="max-w-md">
        <h3 className="font-bold text-lg flex items-center gap-3 mb-4">
          {getIcon()}
          <span>{getTitle()}</span>
        </h3>

        <div className="space-y-4">
          <p className="text-gray-600">
            {getDescription()}
          </p>

          {isToSale && (
            <>
              {missingColumns.length > 0 && (
                <Alert color="info" className="mb-4">
                  <Icon iconNode={IconInfoCircle} className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Columns will be created</p>
                    <p className="text-sm">
                      The following required columns will be automatically added: {missingColumns.join(', ')}
                    </p>
                  </div>
                </Alert>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">What this enables:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Automatic price and quantity columns</li>
                  <li>• Column protection (price/qty cannot be deleted)</li>
                  <li>• E-commerce data structure</li>
                </ul>
              </div>
            </>
          )}

          {!isToSale && (
            <>
              <Alert color="warning">
                <Icon iconNode={IconAlertTriangle} className="h-4 w-4" />
                <div>
                  <p className="font-medium">Price and quantity columns will no longer be protected</p>
                  <p className="text-sm">
                    Existing price and qty columns will remain but can be modified or deleted.
                  </p>
                </div>
              </Alert>

              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-2">After conversion:</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Price/qty columns become regular columns</li>
                  <li>• No more column protection</li>
                  <li>• E-commerce features disabled</li>
                </ul>
              </div>
            </>
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
            color={isToSale ? "success" : "warning"}
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
                {isToSale ? 'Enable For Sale' : 'Disable For Sale'}
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