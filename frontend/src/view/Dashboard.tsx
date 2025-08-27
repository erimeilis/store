import React from 'react'

interface DashboardProps {
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Store CRUD Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-8 w-8 rounded-full ring-2 ring-indigo-100"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, <span className="font-semibold text-indigo-700">{user.name}</span>
                  </span>
                </div>
              )}
              <a
                href="/items"
                className="text-gray-700 hover:text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/60 backdrop-blur-sm"
              >
                Items
              </a>
              <a
                href="/auth/logout"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 no-underline inline-block"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Welcome to your Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your store items with ease. Create, update, and track your inventory all in one place.
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            <div className="group bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg rounded-2xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <dt className="text-sm font-medium text-gray-600 truncate">Total Items</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Loading...
                      </span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg rounded-2xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <dt className="text-sm font-medium text-gray-600 truncate">Recent Uploads</dt>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-1">0</dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg rounded-2xl border border-white/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <dt className="text-sm font-medium text-gray-600 truncate">Last Activity</dt>
                    <dd className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-1">Just now</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <a href="/items" className="focus:outline-none">
                    <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Add New Item</h4>
                    <p className="text-sm text-gray-600">Create a new store item with detailed information</p>
                  </a>
                </div>
              </div>

              <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <a href="/items" className="focus:outline-none">
                    <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV</h4>
                    <p className="text-sm text-gray-600">Import multiple items from a CSV file quickly</p>
                  </a>
                </div>
              </div>

              <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <a href="/items" className="focus:outline-none">
                    <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h4>
                    <p className="text-sm text-gray-600">Track your inventory performance and trends</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
