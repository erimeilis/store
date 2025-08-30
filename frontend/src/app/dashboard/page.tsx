/**
 * Dashboard Page Component
 * Main dashboard overview page
 */

import React, { useState, useEffect } from 'react'
import { PageProps } from '../../types/layout.js'
import { ItemsTable } from '../../components/ItemsTable.js'
import { getItems, StoreItem } from '../../lib/api.js'

interface DashboardPageProps extends PageProps {
  user?: {
    name: string
    email: string
    image?: string | null
  }
}

export default function DashboardPage({ params: _params, searchParams: _searchParams, user: _user }: DashboardPageProps) {
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

  const handleEditItem = (item: StoreItem) => {
    console.log('Edit item:', item)
  }

  const handleDeleteItem = async (item: StoreItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const { deleteItem } = await import('../../lib/api.js')
        await deleteItem(item.id)
        setItems(items.filter(i => i.id !== item.id))
      } catch (err) {
        console.error('Failed to delete item:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete item')
      }
    }
  }

  const handleAddItem = () => {
    console.log('Add new item')
  }

  return (
    <div className="space-y-6">
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
  )
}

export const metadata = {
  title: 'Dashboard Overview',
  description: 'Overview of your store inventory and recent activity'
}
