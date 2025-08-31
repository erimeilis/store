import { Button } from '@/components/ui/button';
import { IconFilter, IconX } from '@tabler/icons-react';

export interface FilterControlsProps {
    hasFilterableColumns: boolean;
    filterCount: number;
    onToggleFilters: () => void;
    onClearFilters: () => void;
}

export function FilterControls({ hasFilterableColumns, filterCount, onToggleFilters, onClearFilters }: FilterControlsProps) {
    if (!hasFilterableColumns) return null;

    return (
        <div className="flex items-center space-x-2">
            <Button size="sm" onClick={onToggleFilters} icon={IconFilter}>
                Filters
            </Button>
            {filterCount > 0 && (
                <Button style="ghost" size="sm" onClick={onClearFilters} icon={IconX}>
                    Clear
                </Button>
            )}
        </div>
    );
}
