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
    
    // Generate better titles and button text
    const getActionTitle = () => {
        switch (selectedAction.name) {
            case 'make_admin':
                return 'Change Role to Admin';
            case 'make_user':
                return 'Change Role to User';
            case 'delete':
                return 'Delete Users';
            default:
                return selectedAction.label;
        }
    };

    const getConfirmButtonText = () => {
        switch (selectedAction.name) {
            case 'make_admin':
            case 'make_user':
                return 'Change Role';
            case 'delete':
                return 'Delete';
            default:
                return 'Confirm';
        }
    };

    // Generate better messages
    const getMessage = () => {
        if (selectedAction.confirmMessage) {
            return selectedAction.confirmMessage;
        }
        
        switch (selectedAction.name) {
            case 'make_admin':
                return `Are you sure you want to promote the selected ${selectedCount} user${selectedCount === 1 ? '' : 's'} to admin role?`;
            case 'make_user':
                return `Are you sure you want to change the selected ${selectedCount} user${selectedCount === 1 ? '' : 's'} to regular user role?`;
            case 'delete':
                return `Are you sure you want to delete ${selectedCount} selected user${selectedCount === 1 ? '' : 's'}? This action cannot be undone.`;
            default:
                return `Are you sure you want to ${selectedAction.label.toLowerCase()} ${selectedCount} selected user${selectedCount === 1 ? '' : 's'}?`;
        }
    };

    return (
        <MassActionConfirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={getActionTitle()}
            message={getMessage()}
            errorMessage={error}
            confirmButtonText={getConfirmButtonText()}
            isLoading={isLoading}
            actionType={actionType}
            actionName={selectedAction.name}
        />
    );
}
