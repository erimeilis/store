import { Button } from '@/components/ui/button';
import { Modal, ModalAction, ModalBackdrop, ModalBox } from '@/components/ui/modal';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import React from 'react';

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    errorMessage?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isLoading?: boolean;
}

/**
 * Reusable delete confirmation modal component
 *
 * Provides a consistent modal interface for delete confirmations across the application.
 * Uses DaisyUI modal components for styling and behavior.
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback function when modal should be closed
 * @param onConfirm - Callback function when delete is confirmed
 * @param title - Custom title for the modal (default: "Confirm Delete")
 * @param message - Custom message for the confirmation (default: generic message)
 * @param confirmButtonText - Text for the confirm button (default: "Delete")
 * @param cancelButtonText - Text for the cancel button (default: "Cancel")
 * @param isLoading - Whether the delete action is currently in progress
 *
 * @example
 * const [showDeleteModal, setShowDeleteModal] = useState(false)
 * const [isDeleting, setIsDeleting] = useState(false)
 *
 * const handleDelete = async () => {
 *   setIsDeleting(true)
 *   try {
 *     await deleteItem(itemId)
 *     setShowDeleteModal(false)
 *   } finally {
 *     setIsDeleting(false)
 *   }
 * }
 *
 * <DeleteConfirmation
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   onConfirm={handleDelete}
 *   message="Are you sure you want to delete this user? This action cannot be undone."
 *   isLoading={isDeleting}
 * />
 */
export function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    errorMessage,
    confirmButtonText = 'Delete',
    cancelButtonText = 'Cancel',
    isLoading = false,
}: DeleteConfirmationProps) {
    // Handle escape key and backdrop clicks to close modal
    const handleModalClick = (e: React.MouseEvent) => {
        // If clicking the modal backdrop (not the modal box), close the modal
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
            id="delete-confirmation-modal"
            modifier={isOpen ? 'open' : 'default'}
            placement="middle"
            onClick={handleModalClick}
            onKeyDown={handleKeyDown}
        >
            <ModalBox className="max-w-sm">
                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-error/10 p-3">
                        <IconAlertTriangle className="h-8 w-8 text-error" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-center text-lg font-bold">{title}</h3>

                {/* Message */}
                <p className="text-muted-foreground mb-4 text-center text-sm">{message}</p>

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
                        color="error"
                        onClick={onConfirm}
                        processing={isLoading}
                        disabled={isLoading}
                        icon={!isLoading ? IconTrash : undefined}
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
