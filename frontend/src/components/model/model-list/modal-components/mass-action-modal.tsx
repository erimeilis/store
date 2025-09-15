import { MassActionConfirmation } from '@/components/shared/mass-action-confirmation';
import { IMassAction } from '@/types/models';

export interface MassActionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    selectedAction: IMassAction | null;
    selectedCount: number;
    error?: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function MassActionModal({ isOpen, isLoading, selectedAction, selectedCount, error, onClose, onConfirm }: MassActionModalProps) {
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

    return (
        <MassActionConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            message={message}
            errorMessage={error}
            confirmButtonText={confirmButtonText}
            isLoading={isLoading}
            actionType={actionType}
            actionName={selectedAction.name}
        />
    );
}
