/**
 * Country converter utility for import validation
 * Handles conversion from various country formats to ISO2 codes
 * Uses country-data-list package for country data and includes common aliases for edge cases
 */

// Country name aliases and edge cases
const COUNTRY_ALIASES: Record<string, string> = {
  // UK/Britain variations
  'UK': 'GB',
  'UNITED KINGDOM': 'GB',
  'GREAT BRITAIN': 'GB',
  'BRITAIN': 'GB',
  'ENGLAND': 'GB',
  'SCOTLAND': 'GB',
  'WALES': 'GB',
  'NORTHERN IRELAND': 'GB',

  // USA variations
  'USA': 'US',
  'UNITED STATES': 'US',
  'UNITED STATES OF AMERICA': 'US',
  'AMERICA': 'US',
  'US': 'US',

  // Russia variations
  'RUSSIA': 'RU',
  'RUSSIAN FEDERATION': 'RU',

  // Germany variations
  'GERMANY': 'DE',
  'DEUTSCHLAND': 'DE',

  // Common alternative names
  'SOUTH KOREA': 'KR',
  'NORTH KOREA': 'KP',
  'VATICAN': 'VA',
  'VATICAN CITY': 'VA',
  'CZECH REPUBLIC': 'CZ',
  'CZECHIA': 'CZ',
  'HOLLAND': 'NL',
  'NETHERLANDS': 'NL',
  'MYANMAR': 'MM',
  'BURMA': 'MM',
  'IVORY COAST': 'CI',
  'CÔTE D\'IVOIRE': 'CI',
  'COTE D\'IVOIRE': 'CI',
  'CAPE VERDE': 'CV',
  'CABO VERDE': 'CV',

  // Local language names
  'POLSKA': 'PL',  // Polish name for Poland
}

import { countries } from 'country-data-list'

// Create lookup maps from country-data-list for performance
const COUNTRIES_BY_ISO2 = new Map<string, { name: string; alpha3: string }>()
const ISO3_TO_ISO2 = new Map<string, string>()
const NAME_TO_ISO2 = new Map<string, string>()

// Initialize lookup maps from country-data-list
for (const country of countries.all) {
  const iso2 = country.alpha2
  const iso3 = country.alpha3
  const name = country.name

  COUNTRIES_BY_ISO2.set(iso2, { name, alpha3: iso3 })
  ISO3_TO_ISO2.set(iso3, iso2)
  NAME_TO_ISO2.set(name.toUpperCase(), iso2)
}

/**
 * Convert various country input formats to ISO2 code
 * @param input - Country input (name, ISO2, ISO3, alias)
 * @returns ISO2 code or throws error if invalid
 */
export function convertToCountryCode(input: string): string {
  if (!input) {
    throw new Error('Country input is required')
  }

  const normalized = input.trim().toUpperCase()

  // Empty-like values
  if (['FALSE', 'NULL', 'UNDEFINED', 'NONE', 'N/A', 'NA', '', '-', '–', '—'].includes(normalized)) {
    throw new Error('Country cannot be empty')
  }

  // Check aliases first (handles edge cases like UK, USA, etc.)
  if (COUNTRY_ALIASES[normalized]) {
    return COUNTRY_ALIASES[normalized]
  }

  // Check if it's a valid ISO2 code
  if (normalized.length === 2 && COUNTRIES_BY_ISO2.has(normalized)) {
    return normalized
  }

  // Check if it's a valid ISO3 code
  if (normalized.length === 3 && ISO3_TO_ISO2.has(normalized)) {
    return ISO3_TO_ISO2.get(normalized)!
  }

  // Check if it's a country name
  if (NAME_TO_ISO2.has(normalized)) {
    return NAME_TO_ISO2.get(normalized)!
  }

  // Try partial name matching for common cases
  for (const [countryName, iso2] of NAME_TO_ISO2.entries()) {
    if (countryName.includes(normalized) || normalized.includes(countryName)) {
      return iso2
    }
  }

  // If nothing matches, throw an error
  throw new Error(`Invalid country: "${input}". Use country name, ISO2 code (US), or ISO3 code (USA)`)
}

/**
 * Validate if a country input can be converted
 * @param input - Country input
 * @returns true if valid, false otherwise
 */
export function isValidCountryInput(input: string): boolean {
  try {
    convertToCountryCode(input)
    return true
  } catch {
    return false
  }
}

/**
 * Get country name by ISO2 code
 * @param iso2 - ISO2 country code
 * @returns Country name or the input if not found
 */
export function getCountryName(iso2: string): string {
  const country = COUNTRIES_BY_ISO2.get(iso2?.toUpperCase())
  return country?.name || iso2
}