import { MassActionConfirmation } from '@/components/shared/mass-action-confirmation';
import { IMassAction, InputFieldType } from '@/types/models';
import { useState, useEffect } from 'react';
import { getCountryOptions } from '@/components/ui/country-select';

export interface MassActionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    selectedAction: IMassAction | null;
    selectedCount: number;
    error?: string;
    onClose: () => void;
    onConfirm: (inputValue?: string | number | boolean) => Promise<void>;
}

/**
 * Get HTML input type for a given InputFieldType
 */
function getHtmlInputType(type: InputFieldType): string {
    switch (type) {
        case 'email': return 'email';
        case 'url': return 'url';
        case 'phone': return 'tel';
        case 'integer':
        case 'float':
        case 'currency':
        case 'percentage':
        case 'number':
        case 'rating':
            return 'number';
        case 'date': return 'date';
        case 'time': return 'time';
        case 'datetime': return 'datetime-local';
        case 'color': return 'color';
        case 'textarea':
        case 'text':
        case 'country':
        default:
            return 'text';
    }
}

/**
 * Get step value for numeric types
 */
function getStepValue(type: InputFieldType, customStep?: number): string | undefined {
    if (customStep !== undefined) return String(customStep);
    switch (type) {
        case 'integer':
        case 'rating':
            return '1';
        case 'currency':
            return '0.01';
        case 'percentage':
        case 'float':
        case 'number':
            return 'any';
        default:
            return undefined;
    }
}

/**
 * Get input pattern for validation
 */
function getInputPattern(type: InputFieldType): string | undefined {
    switch (type) {
        case 'phone':
            return '[+]?[0-9\\s\\-\\(\\)]+';
        case 'country':
            return '[A-Za-z]{2}';
        default:
            return undefined;
    }
}

/**
 * Parse and validate input value based on type
 */
function parseInputValue(type: InputFieldType, value: string): string | number | boolean | null {
    switch (type) {
        case 'integer':
        case 'rating': {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
        }
        case 'float':
        case 'currency':
        case 'percentage':
        case 'number': {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        }
        case 'boolean':
            return value === 'true';
        case 'country':
            return value.toUpperCase();
        default:
            return value;
    }
}

export function MassActionModal({ isOpen, isLoading, selectedAction, selectedCount, error, onClose, onConfirm }: MassActionModalProps) {
    const [inputValue, setInputValue] = useState<string>('');

    // Reset input value when modal opens or action changes
    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen, selectedAction]);

    if (!selectedAction) return null;

    // Determine action type and styling
    const actionType = selectedAction.name === 'delete' ? 'delete' : 'warning';

    // Use the action's label as the title (completely generic)
    const title = selectedAction.label;

    // Use the action's confirm message if provided, otherwise generate a generic one
    const message = selectedAction.confirmMessage ||
        `Are you sure you want to ${selectedAction.label.toLowerCase()} ${selectedCount} selected item${selectedCount === 1 ? '' : 's'}?`;

    // Extract confirm button text from label (e.g., "Delete Tables" -> "Delete")
    const confirmButtonText = selectedAction.label.split(' ')[0];

    const handleConfirm = async () => {
        if (selectedAction.requiresInput && selectedAction.inputConfig) {
            const config = selectedAction.inputConfig;
            const parsedValue = parseInputValue(config.type, inputValue);

            if (parsedValue === null) {
                return; // Don't confirm if value is invalid
            }

            await onConfirm(parsedValue);
        } else {
            await onConfirm();
        }
    };

    // Render input field if action requires it
    const renderInputField = () => {
        if (!selectedAction.requiresInput || !selectedAction.inputConfig) return null;

        const config = selectedAction.inputConfig;
        const htmlType = getHtmlInputType(config.type);
        const step = getStepValue(config.type, config.step);
        const pattern = getInputPattern(config.type);

        // Handle select type with options
        if (config.type === 'select' && config.options) {
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">{config.label}</span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Select...</option>
                        {config.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            );
        }

        // Handle country type with country select
        if (config.type === 'country') {
            const countryOptions = getCountryOptions();
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">{config.label}</span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Select country...</option>
                        {countryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            );
        }

        // Handle boolean type with toggle
        if (config.type === 'boolean') {
            return (
                <div className="mb-4">
                    <label className="label cursor-pointer">
                        <span className="label-text font-medium">{config.label}</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={inputValue === 'true'}
                            onChange={(e) => setInputValue(e.target.checked ? 'true' : 'false')}
                            disabled={isLoading}
                        />
                    </label>
                </div>
            );
        }

        // Handle rating type with star selector
        if (config.type === 'rating') {
            const currentRating = parseInt(inputValue, 10) || 0;
            const maxRating = config.max || 5;
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">{config.label}</span>
                    </label>
                    <div className="rating rating-lg">
                        {Array.from({ length: maxRating }, (_, i) => (
                            <input
                                key={i + 1}
                                type="radio"
                                name="rating"
                                className="mask mask-star-2 bg-warning"
                                checked={currentRating === i + 1}
                                onChange={() => setInputValue(String(i + 1))}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        // Handle textarea type
        if (config.type === 'textarea') {
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">{config.label}</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder={config.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                    />
                </div>
            );
        }

        // Handle color type
        if (config.type === 'color') {
            return (
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text font-medium">{config.label}</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            className="w-12 h-12 cursor-pointer rounded"
                            value={inputValue || '#000000'}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="#000000"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            pattern="^#[0-9A-Fa-f]{6}$"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            );
        }

        // Default: standard input field
        return (
            <div className="mb-4">
                <label className="label">
                    <span className="label-text font-medium">{config.label}</span>
                </label>
                <input
                    type={htmlType}
                    className="input input-bordered w-full"
                    placeholder={config.placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    min={config.min}
                    max={config.max}
                    step={step}
                    pattern={pattern}
                    disabled={isLoading}
                />
                {config.type === 'percentage' && (
                    <label className="label">
                        <span className="label-text-alt">Enter value as percentage (e.g., 25 for 25%)</span>
                    </label>
                )}
                {config.type === 'currency' && (
                    <label className="label">
                        <span className="label-text-alt">Enter amount (e.g., 19.99)</span>
                    </label>
                )}
            </div>
        );
    };

    // Check if confirm should be disabled
    const isConfirmDisabled = selectedAction.requiresInput && !inputValue && selectedAction.inputConfig?.type !== 'boolean';

    return (
        <MassActionConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={title}
            message={message}
            errorMessage={error}
            confirmButtonText={confirmButtonText}
            isLoading={isLoading}
            actionType={actionType}
            actionName={selectedAction.name}
            inputContent={renderInputField()}
            isConfirmDisabled={isConfirmDisabled}
        />
    );
}
