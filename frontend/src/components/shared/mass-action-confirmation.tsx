import { Button } from '@/components/ui/button';
import { Modal, ModalAction, ModalBackdrop, ModalBox } from '@/components/ui/modal';
import { IconAlertTriangle, IconCheck, IconTrash, IconUserCheck, IconUserX } from '@tabler/icons-react';
import React from 'react';

interface MassActionConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    errorMessage?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isLoading?: boolean;
    actionType?: 'delete' | 'warning' | 'info';
    actionName?: string; // Used to determine icon and styling
    /** Optional input content to render between message and buttons */
    inputContent?: React.ReactNode;
    /** Whether the confirm button should be disabled */
    isConfirmDisabled?: boolean;
}

/**
 * Reusable mass action confirmation modal component
 *
 * Provides a consistent modal interface for mass actions across the application.
 * Supports different action types with appropriate styling and icons.
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback function when modal should be closed
 * @param onConfirm - Callback function when action is confirmed
 * @param title - Custom title for the modal
 * @param message - Custom message for the confirmation
 * @param confirmButtonText - Text for the confirm button
 * @param cancelButtonText - Text for the cancel button (default: "Cancel")
 * @param isLoading - Whether the action is currently in progress
 * @param actionType - Type of action for styling (delete, warning, info)
 * @param actionName - Name of the action to determine appropriate icon
 */
export function MassActionConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    errorMessage,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    isLoading = false,
    actionType = 'warning',
    actionName = '',
    inputContent,
    isConfirmDisabled = false,
}: MassActionConfirmationProps) {
    // Determine styling based on action type
    const getActionStyling = () => {
        switch (actionType) {
            case 'delete':
                return {
                    bgClass: 'bg-error/10',
                    textClass: 'text-error',
                    buttonColor: 'error' as const,
                };
            case 'info':
                return {
                    bgClass: 'bg-info/10',
                    textClass: 'text-info',
                    buttonColor: 'info' as const,
                };
            default: // warning
                return {
                    bgClass: 'bg-warning/10',
                    textClass: 'text-warning',
                    buttonColor: 'warning' as const,
                };
        }
    };

    // Determine icon based on action name
    const getActionIcon = () => {
        if (isLoading) return undefined;
        
        switch (actionName.toLowerCase()) {
            case 'delete':
                return IconTrash;
            case 'make_admin':
                return IconUserCheck;
            case 'make_user':
                return IconUserX;
            default:
                return IconCheck;
        }
    };

    const styling = getActionStyling();
    const ActionIcon = getActionIcon();

    // Handle escape key and backdrop clicks to close modal
    const handleModalClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <Modal
            id="mass-action-confirmation-modal"
            modifier={isOpen ? 'open' : 'default'}
            placement="middle"
            onClick={handleModalClick}
            onKeyDown={handleKeyDown}
        >
            <ModalBox className="max-w-sm">
                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                    <div className={`rounded-full ${styling.bgClass} p-3`}>
                        <IconAlertTriangle className={`h-8 w-8 ${styling.textClass}`} />
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-center text-lg font-bold">{title}</h3>

                {/* Message */}
                <p className="text-muted-foreground mb-4 text-center text-sm">{message}</p>

                {/* Optional Input Content */}
                {inputContent && (
                    <div className="mb-4">
                        {inputContent}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-6 rounded-lg bg-error/10 p-3 border border-error/20">
                        <p className="text-sm text-error text-center font-medium">{errorMessage}</p>
                    </div>
                )}

                {/* Actions */}
                <ModalAction className="justify-center">
                    <Button
                        style="soft"
                        color={styling.buttonColor}
                        onClick={onConfirm}
                        processing={isLoading}
                        disabled={isLoading || isConfirmDisabled}
                        icon={ActionIcon}
                        className="min-w-24"
                    >
                        {confirmButtonText}
                    </Button>
                    <Button style="ghost" onClick={onClose} disabled={isLoading} className="min-w-24">
                        {cancelButtonText}
                    </Button>
                </ModalAction>
            </ModalBox>
            <ModalBackdrop />
        </Modal>
    );
}