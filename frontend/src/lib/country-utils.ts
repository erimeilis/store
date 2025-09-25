/**
 * Country utilities using country-data-list package
 * Provides country data with name, ISO2, ISO3, and phone prefix
 * Fixed: Handles country calling codes that already include + prefix
 */

import { countries } from 'country-data-list';

export interface CountryData {
  name: string;
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  emoji?: string;
}

export interface CountryOption {
  value: string; // ISO2 code
  label: string; // Display name with flag emoji and calling code
  country: CountryData;
}

/**
 * Get all countries as options for select dropdown
 */
export function getCountryOptions(): CountryOption[] {
  return countries.all
    .filter(country => country.status === 'assigned')
    .map(country => {
      const rawCallingCode = country.countryCallingCodes[0];
      const callingCode = rawCallingCode ? (rawCallingCode.startsWith('+') ? rawCallingCode : `+${rawCallingCode}`) : '+?';
      return {
        value: country.alpha2,
        label: `${country.emoji || ''} ${country.name} (${callingCode})`.trim(),
        country: {
          name: country.name,
          alpha2: country.alpha2,
          alpha3: country.alpha3,
          countryCallingCodes: country.countryCallingCodes || [],
          emoji: country.emoji
        }
      };
    })
    .sort((a, b) => a.country.name.localeCompare(b.country.name));
}

/**
 * Get country data by ISO2 code
 */
export function getCountryByAlpha2(alpha2: string): CountryData | null {
  const country = (countries as any)[alpha2.toUpperCase()];
  if (!country) return null;

  return {
    name: country.name,
    alpha2: country.alpha2,
    alpha3: country.alpha3,
    countryCallingCodes: country.countryCallingCodes || [],
    emoji: country.emoji
  };
}

/**
 * Get country data by ISO3 code
 */
export function getCountryByAlpha3(alpha3: string): CountryData | null {
  const country = countries.all.find(c => c.alpha3 === alpha3.toUpperCase());
  if (!country) return null;

  return {
    name: country.name,
    alpha2: country.alpha2,
    alpha3: country.alpha3,
    countryCallingCodes: country.countryCallingCodes || [],
    emoji: country.emoji
  };
}

/**
 * Validate if a country code (ISO2 or ISO3) is valid
 */
export function isValidCountryCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;

  code = code.toUpperCase();

  // Check if it's a valid ISO2 code
  if (code.length === 2) {
    return !!(countries as any)[code];
  }

  // Check if it's a valid ISO3 code
  if (code.length === 3) {
    return !!countries.all.find(c => c.alpha3 === code);
  }

  return false;
}

/**
 * Format country data for display
 */
export function formatCountryDisplay(countryCode: string): string {
  // If the input is already formatted (contains flag emoji, parentheses, or is long), return as-is
  if (countryCode.includes('(') || countryCode.includes('+') || countryCode.length > 3) {
    return countryCode;
  }

  const country = getCountryByAlpha2(countryCode) || getCountryByAlpha3(countryCode);
  if (!country) return countryCode;

  const rawCallingCode = country.countryCallingCodes[0];
  const callingCode = rawCallingCode ? (rawCallingCode.startsWith('+') ? rawCallingCode : `+${rawCallingCode}`) : '';
  return `${country.emoji || ''} ${country.name} (${callingCode})`.trim();
}

/**
 * Get just the country name by code
 */
export function getCountryName(countryCode: string): string {
  const country = getCountryByAlpha2(countryCode) || getCountryByAlpha3(countryCode);
  return country?.name || countryCode;
}

/**
 * Get calling code by country code
 */
export function getCountryCallingCode(countryCode: string): string | null {
  const country = getCountryByAlpha2(countryCode) || getCountryByAlpha3(countryCode);
  return country?.countryCallingCodes[0] ? `+${country.countryCallingCodes[0]}` : null;
}