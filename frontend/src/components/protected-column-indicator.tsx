import React from 'react';
import { Icon } from '@/components/icon';
import { IconLock, IconShoppingCart } from '@tabler/icons-react';

export interface ProtectedColumnIndicatorProps {
  columnName: string;
  isProtected: boolean;
  protectionReason?: 'for_sale' | 'system';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function ProtectedColumnIndicator({
  columnName,
  isProtected,
  protectionReason = 'for_sale',
  size = 'sm',
  showTooltip = true,
  className = ''
}: ProtectedColumnIndicatorProps) {
  if (!isProtected) {
    return null;
  }

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  const getProtectionInfo = () => {
    switch (protectionReason) {
      case 'for_sale':
        return {
          icon: IconShoppingCart,
          color: 'text-warning',
          message: `The "${columnName}" column is protected because the table is configured for sale. Price and quantity columns cannot be deleted or renamed while the table is "for sale".`,
          badgeText: 'For Sale Protected'
        };
      case 'system':
        return {
          icon: IconLock,
          color: 'text-info',
          message: `This is a system column that cannot be modified.`,
          badgeText: 'System Protected'
        };
      default:
        return {
          icon: IconLock,
          color: 'text-base-content/60',
          message: `This column is protected and cannot be modified.`,
          badgeText: 'Protected'
        };
    }
  };

  const { icon: ProtectionIcon, color, message, badgeText } = getProtectionInfo();

  const indicator = (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon
        iconNode={ProtectionIcon}
        className={`${iconSize} ${color}`}
      />
      {size !== 'sm' && (
        <span className={`badge badge-outline ${protectionReason === 'for_sale' ? 'badge-warning' : 'badge-info'} ${size === 'lg' ? 'badge-lg' : 'badge-sm'}`}>
          {badgeText}
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <div className="tooltip tooltip-top" data-tip={message}>
      {indicator}
    </div>
  );
}

export interface ProtectedColumnBadgeProps {
  columnName: string;
  isProtected: boolean;
  protectionReason?: 'for_sale' | 'system';
  variant?: 'icon' | 'badge' | 'full';
}

export function ProtectedColumnBadge({
  columnName,
  isProtected,
  protectionReason = 'for_sale',
  variant = 'icon'
}: ProtectedColumnBadgeProps) {
  if (!isProtected) {
    return null;
  }

  const isForSale = protectionReason === 'for_sale';
  const isPriceOrQty = ['price', 'qty'].includes(columnName.toLowerCase());

  if (variant === 'icon') {
    return (
      <ProtectedColumnIndicator
        columnName={columnName}
        isProtected={isProtected}
        protectionReason={protectionReason}
        size="sm"
        showTooltip={true}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <span className={`badge badge-outline ${isForSale ? 'badge-warning' : 'badge-info'} badge-sm`}>
        {isForSale && isPriceOrQty ? 'Protected' : 'System'}
      </span>
    );
  }

  return (
    <ProtectedColumnIndicator
      columnName={columnName}
      isProtected={isProtected}
      protectionReason={protectionReason}
      size="md"
      showTooltip={true}
    />
  );
}