'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ItemsList } from '@/components/ItemsList'
import { ItemForm } from '@/components/ItemForm'
import { FileUpload } from '@/components/FileUpload'
import { Item } from '@/types/item'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'upload'>('list')

  // Redirect to signin if not authenticated
  useEffect(() => {
    // Add timeout to handle cases where NextAuth status gets stuck in loading
    const timeout = setTimeout(() => {
      if (status === "loading" && !session) {
        console.log('NextAuth status stuck in loading, redirecting to signin')
        router.push('/auth/signin')
      }
    }, 5000) // 5 second timeout
    
    if (status === "loading") return // Still loading
    
    clearTimeout(timeout)
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    return () => clearTimeout(timeout)
  }, [session, status, router])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      
      // Get session token for authentication
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/items`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication required - redirecting to sign in')
          router.push('/auth/signin')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchItems()
    }
  }, [session])

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

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null
  }

  return (
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
  )
}
