import React from 'react';
import { Icon } from '@/components/icon';
import { IconLock, IconShoppingCart, IconClockDollar } from '@tabler/icons-react';

export interface ProtectedColumnIndicatorProps {
  columnName: string;
  isProtected: boolean;
  protectionReason?: 'forSale' | 'forRent' | 'system';
  /** Context determines icon: 'name' shows cart/clock, 'other' shows lock */
  context?: 'name' | 'other';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function ProtectedColumnIndicator({
  columnName,
  isProtected,
  protectionReason = 'forSale',
  context = 'name',
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
      case 'forSale':
        return {
          // Name column: cart icon, other columns (req/dupes): lock icon
          icon: context === 'name' ? IconShoppingCart : IconLock,
          color: 'text-warning',
          message: `The "${columnName}" column is protected because the table is configured for sale. Price and quantity columns cannot be deleted or renamed while the table is "for sale".`,
          badgeText: 'For Sale Protected'
        };
      case 'forRent':
        return {
          // Name column: clock-dollar icon, other columns (req/dupes): lock icon
          icon: context === 'name' ? IconClockDollar : IconLock,
          color: 'text-info',
          message: `The "${columnName}" column is protected because the table is configured for rent. Price, fee, used, and available columns cannot be deleted or renamed while the table is "for rent".`,
          badgeText: 'For Rent Protected'
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
        <span className={`badge badge-outline ${protectionReason === 'forSale' ? 'badge-warning' : 'badge-info'} ${size === 'lg' ? 'badge-lg' : 'badge-sm'}`}>
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
  protectionReason?: 'forSale' | 'forRent' | 'system';
  /** Context determines icon: 'name' shows cart/clock, 'other' shows lock */
  context?: 'name' | 'other';
  variant?: 'icon' | 'badge' | 'full';
}

export function ProtectedColumnBadge({
  columnName,
  isProtected,
  protectionReason = 'forSale',
  context = 'name',
  variant = 'icon'
}: ProtectedColumnBadgeProps) {
  if (!isProtected) {
    return null;
  }

  const isEcommerce = protectionReason === 'forSale' || protectionReason === 'forRent';
  const isProtectedName = ['price', 'qty', 'fee', 'used', 'available'].includes(columnName.toLowerCase());

  if (variant === 'icon') {
    return (
      <ProtectedColumnIndicator
        columnName={columnName}
        isProtected={isProtected}
        protectionReason={protectionReason}
        context={context}
        size="sm"
        showTooltip={true}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <span className={`badge badge-outline ${isEcommerce ? 'badge-warning' : 'badge-info'} badge-sm`}>
        {isEcommerce && isProtectedName ? 'Protected' : 'System'}
      </span>
    );
  }

  return (
    <ProtectedColumnIndicator
      columnName={columnName}
      isProtected={isProtected}
      protectionReason={protectionReason}
      context={context}
      size="md"
      showTooltip={true}
    />
  );
}