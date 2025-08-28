import { Button } from '@/components/ui/button'
import { Table, TableWrapper, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/table'
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react'
import { StoreItem } from '@/lib/api'

interface ItemsTableProps {
  items: StoreItem[]
  loading?: boolean
  onEdit?: (item: StoreItem) => void
  onDelete?: (item: StoreItem) => void
  onAdd?: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const ItemsTable = ({ 
  items, 
  loading = false, 
  onEdit, 
  onDelete, 
  onAdd 
}: ItemsTableProps) => {
  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-4 text-base-content/70">Loading items...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header with Add button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="card-title text-2xl">Store Items</h2>
            <p className="text-base-content/70">
              {items.length} item{items.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          
          {onAdd && (
            <Button
              color="primary"
              icon={IconPlus}
              onClick={onAdd}
            >
              Add Item
            </Button>
          )}
        </div>

        {/* Table */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-base-content/50 text-lg mb-4">No items found</div>
            <p className="text-base-content/70 mb-6">
              Get started by adding your first item to the inventory.
            </p>
            {onAdd && (
              <Button
                color="primary"
                style="outline"
                icon={IconPlus}
                onClick={onAdd}
              >
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <TableWrapper>
            <Table size="md" modifier="zebra" className="w-full">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Updated</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover={true}>
                    <TableCell>
                      <div className="font-semibold">{item.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-base-content/70">
                        {item.description || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">{formatCurrency(item.price)}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`badge ${
                        item.quantity === 0 
                          ? 'badge-error' 
                          : item.quantity < 10 
                          ? 'badge-warning' 
                          : 'badge-success'
                      }`}>
                        {item.quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-base-content/70">
                        {item.category || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-base-content/70 text-sm">
                        {formatDate(item.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            style="ghost"
                            color="primary"
                            icon={IconEdit}
                            onClick={() => onEdit(item)}
                          />
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            style="ghost"
                            color="error"
                            icon={IconTrash}
                            onClick={() => onDelete(item)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </div>
  )
}