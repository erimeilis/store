import InputError from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IModel } from '@/types/models';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';

export function TextEditComponent<T extends IModel>({
    column,
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
    const inputType = column.editType === 'email' ? 'email' : column.editType === 'number' ? 'number' : 'text';

    return (
        <div className="w-full space-y-1">
            <div className="flex items-center gap-1">
                <Input
                    style="ghost"
                    type={inputType}
                    size="sm"
                    value={editValue}
                    onChange={(e) => onSetEditValue(e.target.value)}
                    onKeyDown={onEditKeyPress}
                    onBlur={onInputBlur}
                    className={`flex-1 ${editingError ? 'input-error' : ''}`}
                    disabled={isEditingSaving}
                    autoFocus
                />
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
            </div>
            {editingError && <InputError message={editingError} />}
        </div>
    );
}
