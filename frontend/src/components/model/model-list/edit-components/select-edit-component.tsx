import InputError from '@/components/ui/input-error';
import { Select } from '@/components/ui/select';
import { IModel } from '@/types/models';
import React from 'react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';

export function SelectEditComponent<T extends IModel>({
    column,
    editValue,
    editingError,
    isEditingSaving,
    onSetEditValue,
    onSaveEditing,
    onEditKeyPress,
    onInputBlur,
}: InlineEditComponentProps<T>) {
    if (!column.editOptions) return null;

    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        onSetEditValue(newValue);

        // Auto-save on select change if a value is selected
        if (newValue !== '') {
            await onSaveEditing(newValue);
        }
    };

    return (
        <div className="w-full gap-2">
            <Select
                size="sm"
                style="ghost"
                value={editValue}
                onChange={handleSelectChange}
                onKeyDown={onEditKeyPress as any}
                onBlur={onInputBlur}
                className={`${editingError ? 'select-error' : ''}`}
                disabled={isEditingSaving}
                autoFocus
            >
                <option value="">Select...</option>
                {column.editOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
            {editingError && <InputError message={editingError} />}
        </div>
    );
}
