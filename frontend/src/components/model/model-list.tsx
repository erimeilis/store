import Heading from '@/components/heading'
import {Button} from '@/components/ui/button'
import {Card, CardBody} from '@/components/ui/card'
import {Pagination} from '@/components/ui/pagination'
import {Table, TableWrapper} from '@/components/ui/table'
import {Alert} from '@/components/ui/alert'
import {IModel} from '@/types/models'
import {IconFilter, IconPlus, IconTrash, IconX} from '@tabler/icons-react'
import React, {useRef, useCallback} from 'react'

// Import our extracted components
import {DateFilterCalendar} from './model-list/date-filter-calendar'
import {ModelListModals} from './model-list/modals'
import {ModelTableBody} from './model-list/table-body'
import {TableHeader} from './model-list/table-header'
import {IColumnDefinition, IRowAction, ModelListComponentProps} from './model-list/types'

// Import our custom hooks
import {
    useModelListData,
    useModelListFilters,
    useModelListSelection,
    useInlineEditing,
    useAddRow,
    useModelListModals,
    useOrdering
} from './model-list/hooks'

// Re-export the interfaces for backward compatibility
export type {IColumnDefinition, IRowAction}

export function ModelList<T extends IModel>({
                                                title,
                                                items,
                                                filters,
                                                createRoute,
                                                editRoute,
                                                deleteRoute,
                                                inlineEditRoute,
                                                massActionRoute,
                                                columns,
                                                massActions,
                                                rowActions,
                                                orderingConfig,
                                                onEditSuccess,
                                                dataEndpoint,
                                                compactPagination,
                                                renderItem,
                                                renderHeader,
                                            }: ModelListComponentProps<T>) {
    // Use custom hooks for state management
    const {
        isLoadingData,
        dataError,
        displayData,
        loadData
    } = useModelListData<T>({ items: items || null, dataEndpoint })

    const {
        columnFilters,
        showFilters,
        setShowFilters,
        openDateFilters,
        calendarPositions,
        calendarTriggersRef,
        handleSort,
        handleColumnFilter,
        clearAllFilters,
        toggleDateFilter,
        handleDateSelect,
        handlePageChange
    } = useModelListFilters<T>({
        columns,
        filters,
        dataEndpoint,
        loadData
    })

    const {
        selectedItems,
        setSelectedItems,
        handleItemSelect,
        handleSelectAll
    } = useModelListSelection<T>({ items: items || null, displayData })

    const {
        editingCell,
        editValue,
        isEditingSaving,
        editingError,
        editingSaveSuccess,
        setEditValue,
        setIsClickingSaveButton,
        startEditing,
        saveEditing,
        handleEditKeyPress,
        handleInputBlur
    } = useInlineEditing<T>({
        displayData,
        columns,
        inlineEditRoute,
        onEditSuccess
    })

    // Ref for the card container to find table rows
    const cardRef = useRef<HTMLDivElement>(null)

    // Scroll to the last row in the table
    const scrollToLastRow = useCallback(() => {
        if (cardRef.current) {
            const tableBody = cardRef.current.querySelector('tbody')
            if (tableBody) {
                const lastRow = tableBody.querySelector('tr:last-child')
                if (lastRow) {
                    lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
        }
    }, [])

    const {
        isAddingNewRow,
        newRowData,
        newRowError,
        isSavingNewRow,
        startAddingNewRow,
        cancelAddingNewRow,
        updateNewRowData,
        saveNewRow
    } = useAddRow<T>({
        columns,
        inlineEditRoute,
        massActionRoute,
        onEditSuccess,
        onRowAdded: scrollToLastRow
    })

    const {
        deleteModalOpen,
        itemToDelete,
        isDeleting,
        deleteError,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteConfirm,
        massActionModalOpen,
        selectedMassAction,
        isExecutingMassAction,
        massActionError,
        openMassActionModal,
        closeMassActionModal,
        handleMassActionConfirm
    } = useModelListModals<T>({
        deleteRoute,
        massActionRoute,
        selectedItems,
        setSelectedItems,
        onEditSuccess
    })

    const {
        orderingHandlers
    } = useOrdering<T>({
        displayData,
        orderingConfig
    })

    // Determine if we should use legacy rendering or new column-based rendering
    const useLegacyRendering = !columns || columns.length === 0
    const hasFilterableColumns = columns?.some((col) => col.filterable) || false

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading title={title}/>
                {typeof createRoute === 'string' && createRoute.length > 0 ? (
                    <Button icon={IconPlus} onClick={() => window.location.href = createRoute}>
                        Create New
                    </Button>
                ) : createRoute === '' ? (
                    <Button icon={IconPlus} onClick={() => startAddingNewRow()}>
                        Add Row
                    </Button>
                ) : createRoute === null && (!massActions || massActions.length === 0) ? (
                    <Button
                        icon={IconTrash}
                        color="error"
                        style="soft"
                        onClick={() => {
                            // Open the clear all modal that should be provided by the parent page
                            const modal = document.getElementById('clear-all-modal') as HTMLDialogElement
                            if (modal) {
                                modal.showModal()
                            } else {
                                console.warn('Clear all modal not found - parent page should implement clear-all-modal')
                            }
                        }}
                    >
                        Clear All
                    </Button>
                ) : createRoute === null ? null : (
                    <Button icon={IconPlus} onClick={() => startAddingNewRow()}>
                        Add Row
                    </Button>
                )}
            </div>

            <div ref={cardRef}>
            <Card>
                <CardBody>
                    {/* Table Controls */}
                    {(selectedItems.size > 0 || hasFilterableColumns) && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {selectedItems.size > 0 && (
                                    <>
                                        <div className="text-muted-foreground font-light text-sm">({selectedItems.size} selected)</div>
                                        {massActions && massActions.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1">
                                                {massActions.map((action) => (
                                                    <Button
                                                        key={action.name}
                                                        size="sm"
                                                        color={action.name === 'delete' ? 'error' : 'primary'}
                                                        style="soft"
                                                        onClick={() => openMassActionModal(action)}
                                                        icon={action.name === 'delete' ? IconTrash : undefined}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {hasFilterableColumns && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        icon={IconFilter}
                                        color={showFilters ? 'primary' : undefined}
                                        style={showFilters ? 'default' : 'ghost'}
                                    >
                                        Filters
                                    </Button>
                                    {Object.keys(columnFilters).length > 0 && (
                                        <Button style="ghost" size="sm" onClick={clearAllFilters} icon={IconX}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading and Error States for Client-Side Data Fetching */}
                    {dataEndpoint && isLoadingData && (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    )}

                    {dataEndpoint && dataError && !isLoadingData && (
                        <Alert color="error" className="mb-4">
                            {dataError}
                        </Alert>
                    )}

                    <TableWrapper>
                        <Table modifier="zebra pinCols" className="w-full min-w-max text-left text-sm">
                            <TableHeader
                                columns={columns}
                                filters={filters || {}}
                                selectedItems={selectedItems}
                                items={displayData ? {data: displayData.data, last_page: displayData.lastPage} : null}
                                onSort={handleSort}
                                onSelectAll={handleSelectAll}
                                useLegacyRendering={useLegacyRendering}
                                renderHeader={renderHeader}
                                showFilters={showFilters}
                                hasFilterableColumns={hasFilterableColumns}
                                columnFilters={columnFilters}
                                openDateFilters={openDateFilters}
                                calendarTriggersRef={calendarTriggersRef}
                                onColumnFilter={handleColumnFilter}
                                onToggleDateFilter={toggleDateFilter}
                                hasMassActions={massActions && massActions.length > 0}
                            />
                            <ModelTableBody
                                items={displayData ? {data: displayData.data, last_page: displayData.lastPage} : null}
                                columns={columns}
                                selectedItems={selectedItems}
                                editingCell={editingCell}
                                editValue={editValue}
                                editingError={editingError}
                                isEditingSaving={isEditingSaving}
                                editingSaveSuccess={editingSaveSuccess}
                                editRoute={editRoute}
                                deleteRoute={deleteRoute}
                                useLegacyRendering={useLegacyRendering}
                                onItemSelect={handleItemSelect}
                                onStartEditing={startEditing}
                                onSaveEditing={saveEditing}
                                onSetEditValue={setEditValue}
                                onEditKeyPress={handleEditKeyPress}
                                onInputBlur={handleInputBlur}
                                onSetIsClickingSaveButton={setIsClickingSaveButton}
                                onDeleteItem={openDeleteModal}
                                renderItem={renderItem}
                                rowActions={rowActions}
                                // Add Row functionality
                                isAddingNewRow={isAddingNewRow}
                                newRowData={newRowData}
                                newRowError={newRowError}
                                isSavingNewRow={isSavingNewRow}
                                onUpdateNewRowData={updateNewRowData}
                                onSaveNewRow={saveNewRow}
                                onCancelAddingNewRow={cancelAddingNewRow}
                                // Ordering functionality
                                orderingHandlers={orderingHandlers}
                                // Mass actions props for checkbox column visibility
                                hasMassActions={massActions && massActions.length > 0}
                            />
                        </Table>
                    </TableWrapper>

                    {displayData && displayData.data && displayData.data.length > 0 && (
                        <Pagination
                            items={displayData}
                            showPrevNext={true}
                            showPageInput={true}
                            maxVisiblePages={7}
                            size="sm"
                            onPageChange={dataEndpoint ? handlePageChange : undefined}
                            compact={compactPagination}
                        />
                    )}
                </CardBody>
            </Card>
            </div>

            {/* Date Filter Calendar Portal */}
            <DateFilterCalendar
                openDateFilters={openDateFilters}
                calendarPositions={calendarPositions}
                columnFilters={columnFilters}
                onDateSelect={handleDateSelect}
            />

            {/* Modals */}
            <ModelListModals
                deleteModalOpen={deleteModalOpen}
                itemToDelete={itemToDelete}
                isDeleting={isDeleting}
                deleteError={deleteError}
                massActionModalOpen={massActionModalOpen}
                selectedMassAction={selectedMassAction}
                isExecutingMassAction={isExecutingMassAction}
                massActionError={massActionError}
                selectedCount={selectedItems.size}
                onCloseDeleteModal={closeDeleteModal}
                onConfirmDelete={handleDeleteConfirm}
                onCloseMassActionModal={closeMassActionModal}
                onConfirmMassAction={handleMassActionConfirm}
            />
        </div>
    )
}
