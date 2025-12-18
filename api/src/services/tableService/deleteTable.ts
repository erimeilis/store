import type { Context } from 'hono'
import type { UserContext } from '@/types/database.js'
import type { TableRepository } from '@/repositories/tableRepository.js'
import type { ZodCompatibleValidator } from '@/validators/zodCompatibleValidator.js'
import { getUserInfo, isUserAdmin, createErrorResponse, createSuccessResponse } from '@/utils/common.js'
import { getPrismaClient } from '@/lib/database.js'

/**
 * Delete table and all its data
 */
export async function deleteTable(
  repository: TableRepository,
  validator: ZodCompatibleValidator,
  c: Context,
  user: UserContext,
  tableId: string
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
      return createErrorResponse('Access denied', 'You can only delete tables you created', 403)
    }

    // Delete table and all its data
    await repository.deleteTable(tableId)

    // Clean up token references - remove deleted tableId from all tokens' tableAccess
    await cleanupTokenTableAccess(c, tableId)

    return createSuccessResponse(
      { tableId },
      'Table deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      'Failed to delete table',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

/**
 * Remove a deleted table ID from all tokens' tableAccess arrays
 */
async function cleanupTokenTableAccess(c: Context, deletedTableId: string): Promise<void> {
  try {
    const prisma = getPrismaClient(c.env)

    // Find all tokens that have tableAccess containing this table ID
    const tokens = await prisma.token.findMany({
      where: {
        tableAccess: {
          not: null
        }
      },
      select: {
        id: true,
        tableAccess: true
      }
    })

    // Update each token that references the deleted table
    for (const token of tokens) {
      if (!token.tableAccess) continue

      try {
        const tableIds: string[] = JSON.parse(token.tableAccess)
        if (tableIds.includes(deletedTableId)) {
          const updatedTableIds = tableIds.filter(id => id !== deletedTableId)
          await prisma.token.update({
            where: { id: token.id },
            data: {
              tableAccess: updatedTableIds.length > 0 ? JSON.stringify(updatedTableIds) : null
            }
          })
        }
      } catch {
        // Skip tokens with invalid JSON in tableAccess
        continue
      }
    }
  } catch (error) {
    // Log but don't fail the table deletion if token cleanup fails
    console.error('Failed to cleanup token tableAccess:', error)
  }
}