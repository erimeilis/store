/**
 * Dashboard Page Component
 * Main dashboard overview page - showing dynamic tables marked as "for sale"
 */

import React from 'react'
import {IPaginatedResponse} from '@/types/models'
import {UserTable} from '@/types/dynamic-tables'
import {
    IconArrowsSort,
    IconColumns3,
    IconCopy,
    IconDatabase,
    IconEdit,
    IconEye,
    IconFilter,
    IconInfoCircle,
    IconLock,
    IconPlus,
    IconShoppingCart,
    IconTable,
    IconToggleLeft,
    IconUpload,
    IconUsers,
    IconWorld
} from '@tabler/icons-react'
import {TableList} from '@/components/table-list'
import {Alert} from '@/components/ui/alert'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'

export default function DashboardPage({
                                          tables,
                                          filters,
                                          user
                                      }: {
    tables?: IPaginatedResponse<UserTable> | null,
    filters?: { sort?: string, direction?: 'asc' | 'desc', forSale?: string },
    user?: { id: string; email: string; name: string }
}) {
    return (
        <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center gap-3">
                <IconShoppingCart className="h-8 w-8 text-success"/>
                <div>
                    <h1 className="text-2xl font-bold">For Sale Tables</h1>
                    <p className="text-base-content/70">Manage your tables that are available for purchase</p>
                </div>
            </div>

            {/* For Sale Tables List */}
            <TableList
                title="Your For Sale Tables"
                items={tables || null}
                filters={filters}
                user={user}
                showForSaleFilter={true}
                enableMassActions={true}
                enableCloning={true}
                createRoute={null}
                showTypeColumn={false}
            />

            {/* User Instructions Card */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <IconTable className="h-6 w-6 text-primary"/>
                        <h2 className="card-title text-primary">How to Use Dynamic Tables</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Creating Tables */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconPlus className="h-5 w-5 text-accent"/>
                                <h3 className="text-base font-semibold text-accent">Creating Tables</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <Button size="sm" color="primary" style="ghost" className="pointer-events-none" icon={IconTable}>
                                        Dynamic Tables
                                    </Button>
                                    <span>Navigate to the "Dynamic Tables" section to create new tables</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span><strong>Visibility:</strong></span>
                                    <Badge variant="warning">Private</Badge>
                                    <Badge variant="success">Public</Badge>
                                    <Badge variant="info">Shared</Badge>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span><strong>Column Types:</strong></span>
                                    <Badge variant="neutral" size="sm">Text</Badge>
                                    <Badge variant="neutral" size="sm">Number</Badge>
                                    <Badge variant="neutral" size="sm">Date</Badge>
                                    <Badge variant="neutral" size="sm">Boolean</Badge>
                                    <Badge variant="neutral" size="sm">Email</Badge>
                                    <Badge variant="neutral" size="sm">URL</Badge>
                                    <Badge variant="neutral" size="sm">Country</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconToggleLeft className="h-4 w-4 text-warning"/>
                                    <span><strong>For Sale Mode:</strong> Enable e-commerce features with automatic price/quantity columns</span>
                                </div>
                            </div>
                        </div>

                        {/* Visibility & Permissions */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconLock className="h-5 w-5 text-accent"/>
                                <h3 className="text-base font-semibold text-accent">Visibility & Access</h3>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <IconLock className="h-4 w-4 text-warning"/>
                                    <Badge variant="warning">Private</Badge>
                                    <span>Only you can access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconWorld className="h-4 w-4 text-success"/>
                                    <Badge variant="success">Public</Badge>
                                    <span>Everyone can view</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconUsers className="h-4 w-4 text-info"/>
                                    <Badge variant="info">Shared</Badge>
                                    <span>All users can edit</span>
                                </div>
                            </div>
                        </div>

                        {/* Managing Data */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconDatabase className="h-5 w-5 text-accent"/>
                                <h3 className="text-base font-semibold text-accent">Managing Data</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="success" style="soft" className="pointer-events-none" icon={IconDatabase}>
                                        View Data
                                    </Button>
                                    <span><strong>View Data:</strong> Click to view and manage table rows</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="primary" className="pointer-events-none" icon={IconPlus}>
                                        Add Row
                                    </Button>
                                    <span>Create new entries in your table</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="info" style="soft" className="pointer-events-none" icon={IconUpload}>
                                        Import
                                    </Button>
                                    <span>Bulk import from CSV, TXT, XLS, or XLSX files</span>
                                </div>
                                <div className="ml-6 text-xs text-base-content/70">
                                    • Column names are automatically matched during import<br/>
                                    • Choose to add to existing data or replace all data
                                </div>
                            </div>
                        </div>

                        {/* Column Management */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconColumns3 className="h-5 w-5 text-warning"/>
                                <h3 className="text-base font-semibold text-accent">Column Management</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="warning" style="soft" className="pointer-events-none" icon={IconColumns3}>
                                        Manage Columns
                                    </Button>
                                    <span><strong>Manage Columns:</strong> Access comprehensive column management tools</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconPlus className="h-4 w-4 text-success"/>
                                    <span><strong>Add After:</strong> Create new columns positioned after any existing column</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconCopy className="h-4 w-4 text-info"/>
                                    <span><strong>Clone Columns:</strong> Duplicate existing columns with same properties and positioning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEdit className="h-4 w-4 text-primary"/>
                                    <span><strong>Inline Editing:</strong> Click on column name, type, or settings to edit directly</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconLock className="h-4 w-4 text-warning"/>
                                    <span><strong>Validation:</strong> Set required fields <Badge variant="warning" size="sm">Required</Badge> and duplicate controls <Badge
                                        variant="error" size="sm">No Duplicates</Badge></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconArrowsSort className="h-4 w-4 text-info"/>
                                    <span><strong>Reorder Columns:</strong> Drag & drop rows to rearrange column positions</span>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Features */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconCopy className="h-5 w-5 text-accent"/>
                                <h3 className="text-base font-semibold text-accent">Advanced Features</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="info" style="soft" className="pointer-events-none" icon={IconCopy}>
                                        Clone Tables
                                    </Button>
                                    <span><strong>Clone Tables:</strong> Duplicate table structure without data</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconFilter className="h-4 w-4 text-primary"/>
                                    <span><strong>Filtering & Sorting:</strong> Use column headers to organize data</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEye className="h-4 w-4 text-success"/>
                                    <span><strong>Mass Actions:</strong> Select multiple items for bulk operations</span>
                                </div>
                            </div>
                        </div>

                        {/* For Sale Tables */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <IconShoppingCart className="h-5 w-5 text-success"/>
                                <h3 className="text-base font-semibold text-accent">For Sale Tables</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Button size="sm" color="success" style="soft" className="pointer-events-none" icon={IconToggleLeft}>
                                        Enable For Sale
                                    </Button>
                                    <span><strong>Enable For Sale Mode:</strong> Convert any table into inventory management</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconDatabase className="h-4 w-4 text-success"/>
                                    <span><strong>Auto Columns:</strong> Automatically adds "price" (number, required) and "qty" (number, required, default 1) columns</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconEye className="h-4 w-4 text-primary"/>
                                    <span><strong>Dashboard Filter:</strong> For Sale tables appear on this dashboard for easy management</span>
                                </div>
                            </div>
                        </div>

                        {/* Pro Tips */}
                        <Alert color="info" style="soft" className="mt-4">
                            <IconInfoCircle className="h-5 w-5"/>
                            <div>
                                <h4 className="font-semibold">Pro Tips</h4>
                                <div className="text-sm mt-1 space-y-1">
                                    <div>• Use "For Sale" mode to automatically add price and quantity columns for inventory tracking</div>
                                    <div>• Required columns with default values are automatically filled during import</div>
                                    <div>• Clone tables to quickly create similar structures without copying data</div>
                                    <div>• Use shared visibility for collaborative data management with other users</div>
                                    <div>• Drag & drop column rows to reorder column positions in your tables</div>
                                </div>
                            </div>
                        </Alert>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Dashboard Overview',
    description: 'Overview of your store inventory and recent activity'
}
