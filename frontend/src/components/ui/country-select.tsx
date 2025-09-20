/**
 * Country Select Component
 * A select dropdown for countries with name, flag, and calling code
 */

import React from 'react';
import { Select } from '@/components/ui/select';
import { getCountryOptions, formatCountryDisplay, type CountryOption } from '@/lib/country-utils';

interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  color?: 'default' | 'error' | 'success' | 'warning';
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  placeholder = 'Select a country...',
  required = false,
  color = 'default',
  className
}: CountrySelectProps) {
  const countryOptions = getCountryOptions();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={className}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <Select
        value={value || ''}
        onChange={handleChange}
        className={`w-full ${color === 'error' ? 'select-error' : ''}`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {countryOptions.map((option: CountryOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function CountryDisplay({ countryCode }: { countryCode: string }) {
  if (!countryCode) return <span className="text-gray-400">-</span>;

  return <span>{formatCountryDisplay(countryCode)}</span>;
}

// Re-export the utilities for convenience
export { getCountryOptions, formatCountryDisplay } from '@/lib/country-utils';