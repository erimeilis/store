import { Select } from '@/components/ui/select';
import { IModel } from '@/types/models';
import React, { useMemo } from 'react';
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
    onSetIsClickingSaveButton,
}: InlineEditComponentProps<T>) {
    if (!column.editOptions) return null;

    // Group options by group field if any options have groups
    const groupedOptions = useMemo(() => {
        const hasGroups = column.editOptions?.some(opt => opt.group);
        if (!hasGroups) return null;

        return column.editOptions!.reduce((acc, opt) => {
            const group = opt.group || '__default__';
            if (!acc[group]) acc[group] = [];
            acc[group].push(opt);
            return acc;
        }, {} as Record<string, typeof column.editOptions>);
    }, [column.editOptions]);

    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        onSetEditValue(newValue);

        // Auto-save on select change if a value is selected
        if (newValue !== '') {
            await onSaveEditing(newValue);
        }
    };

    return (
        <Select
            size="sm"
            style="ghost"
            value={editValue}
            onChange={handleSelectChange}
            onKeyDown={onEditKeyPress as any}
            onBlur={onInputBlur}
            onMouseDown={() => onSetIsClickingSaveButton(true)}
            onMouseUp={() => onSetIsClickingSaveButton(false)}
            onMouseLeave={() => onSetIsClickingSaveButton(false)}
            className={`${editingError ? 'select-error border-error' : ''}`}
            disabled={isEditingSaving}
            autoFocus
        >
            <option value="">Select...</option>
            {groupedOptions ? (
                // Render with optgroups
                Object.entries(groupedOptions).map(([groupName, options]) => (
                    groupName === '__default__' ? (
                        // Options without a group - render directly
                        options!.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))
                    ) : (
                        <optgroup key={groupName} label={groupName}>
                            {options!.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </optgroup>
                    )
                ))
            ) : (
                // Flat options without groups
                column.editOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))
            )}
        </Select>
    );
}
