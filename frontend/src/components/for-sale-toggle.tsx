import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Icon } from '@/components/icon';
import { IconShoppingCart, IconInfoCircle } from '@tabler/icons-react';

export interface ForSaleToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  showHelp?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ForSaleToggle({
  value,
  onChange,
  disabled = false,
  showHelp = true,
  size = 'md',
  className = ''
}: ForSaleToggleProps) {

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon
          iconNode={IconShoppingCart}
          className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} ${value ? 'text-success' : 'text-base-content/60'}`}
        />
        <span className={`font-medium ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
          For Sale
        </span>
      </div>

      <Toggle
        checked={value}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        size={size}
      />

      {showHelp && (
        <div className="tooltip tooltip-right" data-tip={value ?
          "Table configured for e-commerce with protected price/qty columns" :
          "Enable to add automatic price and quantity columns for selling items"
        }>
          <Icon
            iconNode={IconInfoCircle}
            className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-base-content/40 hover:text-base-content/60 cursor-help`}
          />
        </div>
      )}

      {value && (
        <div className="flex items-center gap-1">
          <span className={`badge badge-success badge-outline ${size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : ''}`}>
            Price & Qty Protected
          </span>
        </div>
      )}
    </div>
  );
}