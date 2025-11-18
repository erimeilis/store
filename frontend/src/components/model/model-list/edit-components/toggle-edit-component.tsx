import { Toggle } from '@/components/ui/toggle';
import { IModel } from '@/types/models';
import React from 'react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';

export function ToggleEditComponent<T extends IModel>({
    editValue,
    editingError,
    isEditingSaving,
    onSetEditValue,
    onSaveEditing,
    onEditKeyPress,
}: InlineEditComponentProps<T>) {
    const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        const stringValue = newValue.toString();
        onSetEditValue(stringValue);

        // Auto-save on toggle change
        try {
            await onSaveEditing(stringValue);
        } catch (error) {
            console.error('❌ ToggleEditComponent: onSaveEditing failed:', error);
        }
    };

    // Convert value to boolean for the checkbox (handles both string and boolean values)
    const isChecked = editValue === 'true' || editValue === '1' || String(editValue) === 'true';

    return (
        <Toggle
            color={editingError ? 'error' : 'success'}
            size="sm"
            checked={isChecked}
            onChange={handleToggleChange}
            onKeyDown={onEditKeyPress}
            disabled={isEditingSaving}
            autoFocus
        />
    );
}
