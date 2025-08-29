import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { ItemsTable } from '@/components/ItemsTable'
import { getItems, StoreItem } from '@/lib/api'
import { IconLogout } from '@tabler/icons-react'

interface DashboardPageProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export const DashboardPage = ({ user }: DashboardPageProps) => {
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const fetchedItems = await getItems()
        setItems(fetchedItems)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch items:', err)
        setError(err instanceof Error ? err.message : 'Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    fetchItems().then()
  }, [])

  const handleLogout = () => {
    window.location.href = '/auth/logout'
  }

  const handleEditItem = (item: StoreItem) => {
    // TODO: Implement edit functionality with modal/form
    console.log('Edit item:', item)
  }

  const handleDeleteItem = async (item: StoreItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const { deleteItem } = await import('@/lib/api')
        await deleteItem(item.id)
        // Refresh items list
        setItems(items.filter(i => i.id !== item.id))
      } catch (err) {
        console.error('Failed to delete item:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete item')
      }
    }
  }

  const handleAddItem = () => {
    // TODO: Implement add item functionality with modal/form
    console.log('Add new item')
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation */}
      <Navbar 
        color="base100"
        shadow="md"
        position="sticky"
        start={
          <Navbar.Brand>
            Store CRUD
          </Navbar.Brand>
        }
        end={
          <div className="flex flex-row gap-4">
            <div className="p-2 my-auto text-sm">
                Logged in as: {user.email}
            </div>
              <Button
                  style="ghost"
                  icon={IconLogout}
                  onClick={handleLogout}
              >
                  Logout
              </Button>
          </div>
        }
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="alert alert-error mb-6">
            <span>Error: {error}</span>
          </div>
        ) : null}
        
        <ItemsTable
          items={items}
          loading={loading}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onAdd={handleAddItem}
        />
      </div>
    </div>
  )
}
