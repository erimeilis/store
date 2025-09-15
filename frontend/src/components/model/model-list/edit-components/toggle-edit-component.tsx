import InputError from '@/components/input-error';
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
    onInputBlur,
}: InlineEditComponentProps<T>) {
    const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('🔄 ToggleEditComponent.handleToggleChange:', {
            checked: e.target.checked,
            currentEditValue: editValue,
            newValue: e.target.checked ? '1' : '0'
        });

        const newValue = e.target.checked ? '1' : '0';
        onSetEditValue(newValue);

        console.log('🚀 ToggleEditComponent: About to call onSaveEditing with:', newValue);
        // Auto-save on toggle change
        try {
            await onSaveEditing(newValue);
            console.log('✅ ToggleEditComponent: onSaveEditing completed successfully');
        } catch (error) {
            console.error('❌ ToggleEditComponent: onSaveEditing failed:', error);
        }
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
