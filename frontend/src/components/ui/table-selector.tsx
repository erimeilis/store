import React, { useState, useMemo } from 'react';

interface Table {
  id: string;
  name: string;
  description?: string;
  forSale?: boolean;
  tableType?: 'default' | 'sale' | 'rent';
  visibility?: string;
}

interface TableSelectorProps {
  tables: Table[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
  error?: string;
}

type FilterType = 'all' | 'for-sale' | 'for-rent' | 'regular';

// Helper to get effective table type (supports both legacy forSale and new tableType)
function getTableType(table: Table): 'sale' | 'rent' | 'default' {
  if (table.tableType) return table.tableType;
  return table.forSale ? 'sale' : 'default';
}

export function TableSelector({ tables, selectedIds, onChange, disabled, error }: TableSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filter and search logic
  const filteredTables = useMemo(() => {
    let result = tables;

    // Apply filter based on effective table type
    if (filterType === 'for-sale') {
      result = result.filter(table => getTableType(table) === 'sale');
    } else if (filterType === 'for-rent') {
      result = result.filter(table => getTableType(table) === 'rent');
    } else if (filterType === 'regular') {
      result = result.filter(table => getTableType(table) === 'default');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(table =>
        table.name.toLowerCase().includes(query) ||
        (table.description?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [tables, filterType, searchQuery]);

  const handleToggle = (tableId: string) => {
    if (disabled) return;

    if (selectedIds.includes(tableId)) {
      onChange(selectedIds.filter(id => id !== tableId));
    } else {
      onChange([...selectedIds, tableId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(filteredTables.map(t => t.id));
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const selectedCount = selectedIds.length;
  const totalCount = tables.length;
  const filteredCount = filteredTables.length;

  return (
    <div className="space-y-3">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tables by name or description..."
            className="input input-bordered input-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            disabled={disabled}
          >
            <option value="all">All Tables</option>
            <option value="for-sale">For Sale</option>
            <option value="for-rent">For Rent</option>
            <option value="regular">Regular</option>
          </select>

          {/* Bulk Selection Buttons */}
          <div className="join">
            <button
              type="button"
              className="btn btn-sm btn-outline join-item"
              onClick={handleSelectAll}
              disabled={disabled || filteredCount === 0}
              title="Select all visible tables"
            >
              All
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline join-item"
              onClick={handleDeselectAll}
              disabled={disabled || selectedCount === 0}
              title="Deselect all tables"
            >
              None
            </button>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="text-sm text-base-content/70">
        {selectedCount > 0 ? (
          <span className="font-medium text-primary">
            {selectedCount} of {totalCount} table{totalCount !== 1 ? 's' : ''} selected
          </span>
        ) : (
          <span>No tables selected</span>
        )}
        {filteredCount < totalCount && (
          <span className="ml-2">
            (showing {filteredCount} filtered)
          </span>
        )}
      </div>

      {/* Table Grid */}
      <div className="border border-base-300 rounded-lg p-4 max-h-96 overflow-y-auto">
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTables.map((table) => {
              const isSelected = selectedIds.includes(table.id);

              return (
                <label
                  key={table.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-base-300 hover:border-base-400 hover:bg-base-200/50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm mt-0.5 flex-shrink-0"
                    checked={isSelected}
                    onChange={() => handleToggle(table.id)}
                    disabled={disabled}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" title={table.name}>
                      {table.name}
                    </div>

                    {table.description && (
                      <div className="text-xs text-base-content/60 line-clamp-2 mt-1" title={table.description}>
                        {table.description}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      {getTableType(table) === 'sale' && (
                        <span className="badge badge-success badge-xs">For Sale</span>
                      )}
                      {getTableType(table) === 'rent' && (
                        <span className="badge badge-info badge-xs">For Rent</span>
                      )}
                      {table.visibility && (
                        <span className="badge badge-ghost badge-xs capitalize">
                          {table.visibility}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        ) : searchQuery || filterType !== 'all' ? (
          <div className="text-center py-8 text-base-content/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-medium">No tables found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
            <button
              type="button"
              className="btn btn-sm btn-ghost mt-3"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-base-content/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-medium">No tables available</p>
            <p className="text-sm mt-1">Tokens can be created without table restrictions when no tables exist.</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-error text-sm mt-2">
          {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-base-content/70 space-y-1">
        <p>
          <span className="font-semibold text-primary">At least one table must be selected</span> if tables exist.
        </p>
        <p className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Use search to quickly find tables. Filter by sale status to narrow down options.
          </span>
        </p>
      </div>
    </div>
  );
}
