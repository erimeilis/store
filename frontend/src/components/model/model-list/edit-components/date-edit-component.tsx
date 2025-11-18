import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IModel } from '@/types/models';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';
import { formatDateForInput, parseDDMMYYYY, formatDateDDMMYYYY } from '@/lib/date-utils';

export function DateEditComponent<T extends IModel>({
    editValue,
    editingError,
    isEditingSaving,
    editingSaveSuccess,
    onSetEditValue,
    onSaveEditing,
    onEditKeyPress,
    onInputBlur,
    onSetIsClickingSaveButton,
}: InlineEditComponentProps<T>) {
    // Convert dd.mm.yyyy (display format) to yyyy-mm-dd (input format)
    const dateForInput = editValue ? formatDateForInput(parseDDMMYYYY(editValue) || editValue) : '';

    // Handle date change - convert from yyyy-mm-dd back to dd.mm.yyyy
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value; // yyyy-mm-dd format
        if (!inputValue) {
            onSetEditValue('');
            return;
        }

        // Parse the yyyy-mm-dd format and convert to dd.mm.yyyy
        const date = new Date(inputValue);
        if (!isNaN(date.getTime())) {
            const formatted = formatDateDDMMYYYY(date);
            onSetEditValue(formatted);
        }
    };

    return (
        <Input
            type="date"
            size="xs"
            value={dateForInput}
            onChange={handleDateChange}
            onKeyDown={onEditKeyPress}
            onBlur={onInputBlur}
            className={`w-full ${editingError ? 'input-error border-error' : ''}`}
            disabled={isEditingSaving}
            autoFocus
            suffix={
                <Button
                    onClick={() => onSaveEditing()}
                    onMouseDown={() => onSetIsClickingSaveButton(true)}
                    onMouseUp={() => onSetIsClickingSaveButton(false)}
                    onMouseLeave={() => onSetIsClickingSaveButton(false)}
                    processing={isEditingSaving}
                    success={editingSaveSuccess}
                    color="success"
                    style="soft"
                    size="icon"
                    title="Save changes"
                    icon={IconDeviceFloppy}
                />
            }
        />
    );
}
