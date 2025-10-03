import InputError from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IModel } from '@/types/models';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';

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
    return (
        <div className="w-full gap-2">
            <Input
                type="date"
                size="xs"
                value={editValue}
                onChange={(e) => onSetEditValue(e.target.value)}
                onKeyDown={onEditKeyPress}
                onBlur={onInputBlur}
                className={`w-full ${editingError ? 'input-error' : ''}`}
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
            {editingError && <InputError message={editingError} />}
        </div>
    );
}
