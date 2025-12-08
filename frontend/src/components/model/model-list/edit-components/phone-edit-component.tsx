import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IModel } from '@/types/models';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { InlineEditComponentProps } from '@/components/model/model-list/types';

/**
 * Check if a character is valid for phone input
 * Allows: digits, +, -, (, ), spaces, and . for separators
 */
export function isValidPhoneChar(char: string): boolean {
    return /[\d+\-().x\s]/.test(char)
}

/**
 * Filter input to only allow valid phone characters
 */
export function filterPhoneInput(value: string): string {
    // Allow only valid phone characters
    return value.split('').filter(char => isValidPhoneChar(char)).join('')
}

/**
 * Normalize phone number to digits only
 * Accepts formats like +1 (555) 123-4567, (555) 123-4567, 555.123.4567
 * Returns only digits (optionally with leading +)
 */
export function normalizePhoneNumber(value: string): string {
    // Keep only digits and optionally the leading +
    const hasPlus = value.startsWith('+')
    const digits = value.replace(/\D/g, '')
    return hasPlus ? `+${digits}` : digits
}

/**
 * Format phone number for display (optional - shows formatted while editing)
 * Takes normalized digits and formats as readable phone number
 */
export function formatPhoneForDisplay(digits: string): string {
    if (!digits) return ''

    // Remove leading + for formatting
    const hasPlus = digits.startsWith('+')
    const cleanDigits = hasPlus ? digits.slice(1) : digits

    // US format: (XXX) XXX-XXXX
    if (cleanDigits.length === 10) {
        return `${hasPlus ? '+' : ''}(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`
    }

    // International format with country code: +X (XXX) XXX-XXXX
    if (cleanDigits.length === 11) {
        return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`
    }

    // Return as-is if doesn't match known formats
    return digits
}

export function PhoneEditComponent<T extends IModel>({
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Filter input to only allow valid phone characters
        const filteredValue = filterPhoneInput(e.target.value)
        onSetEditValue(filteredValue)
    }

    const handleSave = async () => {
        // Normalize to digits only before saving
        const normalized = normalizePhoneNumber(editValue)
        await onSaveEditing(normalized)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            onEditKeyPress(e)
        }
    }

    return (
        <div className="flex items-center gap-1">
            <Input
                style="ghost"
                type="tel"
                size="sm"
                value={editValue}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                onBlur={onInputBlur}
                className={`flex-1 ${editingError ? 'input-error border-error' : ''}`}
                disabled={isEditingSaving}
                autoFocus
                placeholder="+1 (555) 123-4567"
            />
            <Button
                onClick={handleSave}
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
    );
}
