/**
 * Help Page Component
 * Documentation and usage guide for dynamic tables
 */

import React from 'react'
import {
    IconArrowsSort,
    IconColumns3,
    IconCopy,
    IconDatabase,
    IconEdit,
    IconEye,
    IconFilter,
    IconHelpCircle,
    IconInfoCircle,
    IconKey,
    IconLock,
    IconPlus,
    IconShoppingCart,
    IconToggleLeft,
    IconUpload,
    IconUsers,
    IconWorld
} from '@tabler/icons-react'
import {Alert} from '@/components/ui/alert'
import {PageHeader, createBreadcrumbs} from '@/components/page/page-header'

export default function HelpPage() {
    return (
        <div className="space-y-6">
            {/* Help Header */}
            <PageHeader
                breadcrumbs={createBreadcrumbs.section('Help')}
                icon={IconHelpCircle}
                title="Help & Documentation"
                subtitle="Learn how to use dynamic tables and store features"
            />

            {/* Main Content - 2 columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Creating Tables */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconPlus className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">Creating Tables</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <p>Navigate to <strong>Dynamic Tables</strong> to create new tables.</p>
                                <div className="flex items-center gap-4 flex-wrap text-xs">
                                    <span><strong>Visibility:</strong></span>
                                    <span className="flex items-center gap-1"><IconLock size={14}/> Private</span>
                                    <span className="flex items-center gap-1"><IconWorld size={14}/> Public</span>
                                    <span className="flex items-center gap-1"><IconUsers size={14}/> Shared</span>
                                </div>
                                <div className="text-xs">
                                    <strong>Column Types:</strong> Text, Number, Date, Boolean, Email, URL, Country
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Managing Data */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconDatabase className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">Managing Data</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconEye size={16}/>
                                    <span><strong>View Data:</strong> Click to view and manage table rows</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconPlus size={16}/>
                                    <span><strong>Add Row:</strong> Create new entries in your table</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconUpload size={16}/>
                                    <span><strong>Import:</strong> Bulk import from CSV, TXT, XLS, or XLSX</span>
                                </div>
                                <p className="text-xs text-base-content/60 ml-6">
                                    Column names are automatically matched during import
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column Management */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconColumns3 className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">Column Management</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconPlus size={16}/>
                                    <span><strong>Add After:</strong> Create columns positioned after any existing column</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconCopy size={16}/>
                                    <span><strong>Clone:</strong> Duplicate columns with same properties</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEdit size={16}/>
                                    <span><strong>Inline Edit:</strong> Click on column name/type to edit directly</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconArrowsSort size={16}/>
                                    <span><strong>Reorder:</strong> Drag & drop to rearrange positions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Visibility & Access */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconLock className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">Visibility & Access</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconLock size={16}/>
                                    <span><strong>Private:</strong> Only you can access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconWorld size={16}/>
                                    <span><strong>Public:</strong> Everyone can view</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconUsers size={16}/>
                                    <span><strong>Shared:</strong> All users can edit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* For Sale Tables */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconShoppingCart className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">For Sale Tables</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconToggleLeft size={16}/>
                                    <span><strong>Enable For Sale:</strong> Convert table into inventory management</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconDatabase size={16}/>
                                    <span><strong>Auto Columns:</strong> Adds "price" and "qty" columns</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEye size={16}/>
                                    <span><strong>Dashboard:</strong> For Sale tables appear on dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* For Rent Tables */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconKey className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">For Rent Tables</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconToggleLeft size={16}/>
                                    <span><strong>Enable For Rent:</strong> Convert table into rental inventory</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconDatabase size={16}/>
                                    <span><strong>Auto Columns:</strong> Adds "price", "used", and "available"</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconUsers size={16}/>
                                    <span><strong>Lifecycle:</strong> Items rented → released (marked used)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Features */}
                    <div className="card bg-base-100 shadow border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-3">
                                <IconCopy className="h-5 w-5 text-base-content/70"/>
                                <h3 className="font-semibold">Advanced Features</h3>
                            </div>
                            <div className="space-y-2 text-sm text-base-content/80">
                                <div className="flex items-center gap-2">
                                    <IconCopy size={16}/>
                                    <span><strong>Clone Tables:</strong> Duplicate structure without data</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconFilter size={16}/>
                                    <span><strong>Filtering & Sorting:</strong> Use column headers to organize</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEye size={16}/>
                                    <span><strong>Mass Actions:</strong> Select multiple for bulk operations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pro Tips - Full Width */}
            <Alert color="info" style="soft">
                <IconInfoCircle className="h-5 w-5"/>
                <div>
                    <h4 className="font-semibold">Pro Tips</h4>
                    <div className="text-sm mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div>• Use "For Sale" mode for inventory with price/quantity tracking</div>
                        <div>• Use "For Rent" for one-time rental items</div>
                        <div>• Required columns with defaults are auto-filled on import</div>
                        <div>• Clone tables to quickly create similar structures</div>
                        <div>• Use shared visibility for collaborative editing</div>
                        <div>• Drag & drop column rows to reorder positions</div>
                    </div>
                </div>
            </Alert>
        </div>
    )
}

export const metadata = {
    title: 'Help & Documentation',
    description: 'Learn how to use dynamic tables and store features'
}
