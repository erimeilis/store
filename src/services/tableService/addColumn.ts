import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { AddColumnRequest } from '@/types/table-queries.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'

/**
 * Add new column to table
 */
export async function addColumn(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string,
  data: AddColumnRequest
) {
  try {
    const { userId, userEmail } = getUserInfo(c, user)
    const isAdmin = isUserAdmin(user)

    // Validate table ID
    const validation = validator.validateTableId(tableId)
    if (!validation.valid) {
      return createErrorResponse('Validation failed', validation.errors.join(', '), 400)
    }

    // Check ownership
    const isOwner = await repository.checkTableOwnership(tableId, userEmail, userId)
    if (!isAdmin && !isOwner) {
      return createErrorResponse('Access denied', 'You can only modify tables you created', 403)
    }

    // Validate column data
    if (!data.name || !data.type) {
      return createErrorResponse('Validation failed', 'Column name and type are required', 400)
    }

    // Add column
    const columnData: any = {
      name: data.name,
      type: data.type,
      isRequired: data.isRequired === true || data.isRequired === 'true'
    }

    if (data.defaultValue !== undefined && data.defaultValue !== null) {
      columnData.defaultValue = data.defaultValue
    }

    if (data.position !== undefined) {
      columnData.position = data.position
    }

    const column = await repository.addColumn(tableId, columnData)

    return createSuccessResponse(
      { column },
      'Column added successfully',
      201
    )
  } catch (error) {
    // Handle specific database constraint errors
    if (error instanceof Error) {
      const errorMessage = error.message
      // Check for unique constraint on tableId + name
      if (errorMessage.includes('Unique constraint failed') &&
          (errorMessage.includes('tableId') || errorMessage.includes('name'))) {
        return createErrorResponse(
          'Duplicate column name',
          `A column named "${data.name}" already exists in this table. Please choose a different name.`,
          409
        )
      }
    }

    return createErrorResponse(
      'Failed to add column',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}