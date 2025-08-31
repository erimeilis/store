import { DeleteConfirmation } from '@/components/shared/delete-confirmation';

export interface DeleteModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function DeleteModal({ isOpen, isLoading, onClose, onConfirm }: DeleteModalProps) {
    return (
        <DeleteConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Item"
            message="Are you sure you want to delete this item? This action cannot be undone."
            isLoading={isLoading}
        />
    );
}
