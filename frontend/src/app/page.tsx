'use client'

import { useState, useEffect } from 'react'
import { ItemsList } from '@/components/ItemsList'
import { ItemForm } from '@/components/ItemForm'
import { FileUpload } from '@/components/FileUpload'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Item } from '@/types/item'

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'upload'>('list')

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/items`)
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleItemSaved = () => {
    fetchItems()
    setEditingItem(null)
    setActiveTab('list')
  }

  const handleItemDeleted = () => {
    fetchItems()
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setActiveTab('add')
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setActiveTab('list')
  }

  const handleFileUploaded = () => {
    fetchItems()
    setActiveTab('list')
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'list'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Items List ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'add'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {editingItem ? 'Edit Item' : 'Add Item'}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            File Upload
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <ItemsList
            items={items}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleItemDeleted}
          />
        )}

        {activeTab === 'add' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <ItemForm
              item={editingItem}
              onSaved={handleItemSaved}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Upload File</h2>
            <FileUpload onFileUploaded={handleFileUploaded} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
