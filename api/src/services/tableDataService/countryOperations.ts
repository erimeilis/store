/**
 * Country Operations for Table Data
 * Detect and fix invalid country codes (names instead of ISO codes)
 */

import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableDataRepository } from '@/repositories/tableDataRepository.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { convertToCountryCode, isValidCountryInput } from '@/utils/countryConverter.js'

interface CountryIssue {
  rowId: string
  columnName: string
  currentValue: string
  suggestedValue: string | null
}

/**
 * Check if a value is a valid ISO country code (2-3 characters)
 */
function isISOCode(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim().toUpperCase()
  return trimmed.length === 2 || trimmed.length === 3
}

/**
 * Detect invalid country codes in table data
 * Returns rows where country columns contain full names instead of ISO codes
 */
export async function detectCountryIssues(
  repository: TableDataRepository,
  tableRepository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate table ID
    const idValidation = validator.validateIds(tableId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse('Table not found', `Table with ID ${tableId} does not exist or you don't have access`, 404)
    }

    // Get table columns to find country columns
    const columns = await tableRepository.getTableColumns(tableId)
    const countryColumns = columns.filter(col => col.type === 'country')

    if (countryColumns.length === 0) {
      return createSuccessResponse({
        hasIssues: false,
        countryColumns: [],
        issues: [],
        totalAffectedRows: 0
      }, 'No country columns in this table')
    }

    // Get all data rows
    const allData = await repository.getAllDataForTable(tableId)
    const issues: CountryIssue[] = []
    const affectedRowIds = new Set<string>()

    for (const row of allData) {
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data

      for (const column of countryColumns) {
        const value = data[column.name]

        // Skip empty values
        if (!value || value === '' || value === '-') continue

        // Check if value is NOT a valid ISO code (2-3 chars)
        // but IS a recognizable country name that can be converted
        if (!isISOCode(value)) {
          let suggestedValue: string | null = null

          try {
            suggestedValue = convertToCountryCode(value)
          } catch {
            // Can't convert - will suggest null
          }

          issues.push({
            rowId: row.id,
            columnName: column.name,
            currentValue: value,
            suggestedValue
          })
          affectedRowIds.add(row.id)
        }
      }
    }

    return createSuccessResponse({
      hasIssues: issues.length > 0,
      countryColumns: countryColumns.map(c => c.name),
      issues: issues.slice(0, 100), // Limit to first 100 issues
      totalIssues: issues.length,
      totalAffectedRows: affectedRowIds.size,
      fixableIssues: issues.filter(i => i.suggestedValue !== null).length
    }, issues.length > 0
      ? `Found ${issues.length} country value(s) that need conversion in ${affectedRowIds.size} row(s)`
      : 'All country values are valid ISO codes')
  } catch (error) {
    return createErrorResponse(
      'Failed to detect country issues',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

/**
 * Fix all invalid country codes in table data
 * Converts country names to ISO codes
 */
export async function fixCountryCodes(
  repository: TableDataRepository,
  tableRepository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string
) {
  try {
    const { userId } = getUserInfo(c, user)

    // Validate table ID
    const idValidation = validator.validateIds(tableId)
    if (!idValidation.valid) {
      return createErrorResponse('Validation failed', idValidation.errors.join(', '), 400)
    }

    // Check table access
    const hasAccess = await repository.checkTableAccess(tableId, userId, user)
    if (!hasAccess) {
      return createErrorResponse('Table not found', `Table with ID ${tableId} does not exist or you don't have access`, 404)
    }

    // Get table columns to find country columns
    const columns = await tableRepository.getTableColumns(tableId)
    const countryColumns = columns.filter(col => col.type === 'country')

    if (countryColumns.length === 0) {
      return createSuccessResponse({
        fixed: 0,
        failed: 0,
        errors: []
      }, 'No country columns in this table')
    }

    // Get all data rows
    const allData = await repository.getAllDataForTable(tableId)
    let fixedCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const row of allData) {
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      let rowModified = false

      for (const column of countryColumns) {
        const value = data[column.name]

        // Skip empty values
        if (!value || value === '' || value === '-') continue

        // Check if value needs conversion (not already ISO)
        if (!isISOCode(value)) {
          try {
            const isoCode = convertToCountryCode(value)
            data[column.name] = isoCode
            rowModified = true
          } catch (err) {
            errors.push(`Row ${row.id}, column ${column.name}: Cannot convert "${value}"`)
            failedCount++
          }
        }
      }

      // Update row if modified
      if (rowModified) {
        await repository.updateDataRowDirect(row.id, data)
        fixedCount++
      }
    }

    return createSuccessResponse({
      fixed: fixedCount,
      failed: failedCount,
      errors: errors.slice(0, 20) // Limit errors
    }, fixedCount > 0
      ? `Fixed ${fixedCount} row(s) with country code conversions${failedCount > 0 ? `, ${failedCount} failed` : ''}`
      : 'No rows needed fixing')
  } catch (error) {
    return createErrorResponse(
      'Failed to fix country codes',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
