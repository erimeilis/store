'use client'

import { useState } from 'react'

interface FileUploadProps {
  onFileUploaded: () => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'sheets'>('file')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sheetsData, setSheetsData] = useState({
    spreadsheetId: '',
    range: 'Sheet1!A:Z'
  })

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      setError('Please select a file to upload')
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    try {
      setIsUploading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/upload`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData
        }
      )

      const result = await response.json()

      if (response.ok) {
        setSuccess(`Successfully uploaded and processed file. Added ${result.added || 0} items.`)
        onFileUploaded()
        // Reset form
        const form = e.currentTarget
        form.reset()
      } else {
        setError(result.message || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSheetsImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!sheetsData.spreadsheetId.trim()) {
      setError('Please enter a Google Sheets ID')
      return
    }

    try {
      setIsUploading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'}/api/import/sheets`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            spreadsheetId: sheetsData.spreadsheetId.trim(),
            range: sheetsData.range.trim()
          })
        }
      )

      const result = await response.json()

      if (response.ok) {
        setSuccess(`Successfully imported from Google Sheets. Added ${result.imported || 0} items.`)
        onFileUploaded()
        // Reset form
        setSheetsData({
          spreadsheetId: '',
          range: 'Sheet1!A:Z'
        })
      } else {
        setError(result.message || 'Failed to import from Google Sheets')
      }
    } catch (error) {
      console.error('Import error:', error)
      setError('Failed to import from Google Sheets')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div className="flex space-x-4 border-b pb-4">
        <button
          type="button"
          onClick={() => setUploadMethod('file')}
          className={`px-4 py-2 font-medium ${
            uploadMethod === 'file'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          CSV File Upload
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('sheets')}
          className={`px-4 py-2 font-medium ${
            uploadMethod === 'sheets'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Google Sheets Import
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* File Upload Form */}
      {uploadMethod === 'file' && (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".csv"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              CSV file should have a &quot;name&quot; column. Description and other data will be imported automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload & Import CSV'}
          </button>
        </form>
      )}

      {/* Google Sheets Import Form */}
      {uploadMethod === 'sheets' && (
        <form onSubmit={handleSheetsImport} className="space-y-4">
          <div>
            <label htmlFor="spreadsheetId" className="block text-sm font-medium text-gray-700 mb-1">
              Google Sheets ID
            </label>
            <input
              type="text"
              id="spreadsheetId"
              value={sheetsData.spreadsheetId}
              onChange={(e) => setSheetsData(prev => ({ ...prev, spreadsheetId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
            <p className="text-sm text-gray-500 mt-1">
              Copy the ID from the Google Sheets URL: https://docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
            </p>
          </div>

          <div>
            <label htmlFor="range" className="block text-sm font-medium text-gray-700 mb-1">
              Range
            </label>
            <input
              type="text"
              id="range"
              value={sheetsData.range}
              onChange={(e) => setSheetsData(prev => ({ ...prev, range: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sheet1!A:Z"
            />
            <p className="text-sm text-gray-500 mt-1">
              Specify the range to import (e.g., &quot;Sheet1!A:Z&quot; for all columns)
            </p>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Importing...' : 'Import from Google Sheets'}
          </button>
        </form>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Import Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure your data has a column containing &quot;name&quot; in the header</li>
          <li>• Optional: Include columns with &quot;description&quot; or &quot;desc&quot; in the header</li>
          <li>• All other columns will be stored as additional data</li>
          <li>• For Google Sheets: Make sure the sheet is publicly accessible or you have proper permissions</li>
        </ul>
      </div>
    </div>
  )
}
