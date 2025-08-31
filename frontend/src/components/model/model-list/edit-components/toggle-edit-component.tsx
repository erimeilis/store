import InputError from '@/components/input-error';
import { Toggle } from '@/components/ui/toggle';
import { IModel } from '@/types/models';
import React from 'react';
import { InlineEditComponentProps } from '../types';

export function ToggleEditComponent<T extends IModel>({
    editValue,
    editingError,
    isEditingSaving,
    onSetEditValue,
    onSaveEditing,
    onEditKeyPress,
    onInputBlur,
}: InlineEditComponentProps<T>) {
    const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked ? '1' : '0';
        onSetEditValue(newValue);

        // Auto-save on toggle change
        await onSaveEditing(newValue);
    };

    // Convert string value to boolean for the checkbox
    const isChecked = editValue === '1' || editValue === 'true';

    return (
        <div className="w-full gap-2">
            <Toggle
                color={editingError ? 'error' : 'success'}
                size="sm"
                checked={isChecked}
                onChange={handleToggleChange}
                onKeyDown={onEditKeyPress}
                onBlur={onInputBlur}
                disabled={isEditingSaving}
                autoFocus
            />
            {editingError && <InputError message={editingError} />}
        </div>
    );
}
