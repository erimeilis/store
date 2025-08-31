import { DeleteConfirmation } from '@/components/shared/delete-confirmation';
import { IMassAction } from '@/types/models';

export interface MassActionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    selectedAction: IMassAction | null;
    selectedCount: number;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function MassActionModal({ isOpen, isLoading, selectedAction, selectedCount, onClose, onConfirm }: MassActionModalProps) {
    if (!selectedAction) return null;

    return (
        <DeleteConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={`${selectedAction.label} Items`}
            message={
                selectedAction.confirmMessage ||
                `Are you sure you want to ${selectedAction.label.toLowerCase()} ${selectedCount} selected item${selectedCount === 1 ? '' : 's'}? This action cannot be undone.`
            }
            isLoading={isLoading}
        />
    );
}
