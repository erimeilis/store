'use client'

import { Item } from '@/types/item'
import { useState, useEffect } from 'react'

interface ItemFormProps {
  item?: Item | null
  onSaved: () => void
  onCancel: () => void
}

export function ItemForm({ item, onSaved, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    data: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        data: item.data ? JSON.stringify(item.data, null, 2) : ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        data: ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the request body
      const requestBody: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null
      }

      // Parse JSON data if provided
      if (formData.data.trim()) {
        try {
          requestBody.data = JSON.parse(formData.data)
        } catch {
          setError('Invalid JSON in data field')
          return
        }
      }

      const url = item
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/items/${item.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/items`

      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        onSaved()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save item')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Failed to save item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter item name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter item description"
        />
      </div>

      <div>
        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Data (JSON)
        </label>
        <textarea
          id="data"
          name="data"
          value={formData.data}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder='{"key": "value", "category": "example"}'
        />
        <p className="text-sm text-gray-500 mt-1">
          Optional: Enter valid JSON data for additional item properties
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
