import { IModel } from '@/types/models';
import { DeleteModal } from './modal-components/delete-modal';
import { MassActionModal } from './modal-components/mass-action-modal';
import { ModalsProps } from './types';

export function ModelListModals<T extends IModel>({
    deleteModalOpen,
    isDeleting,
    deleteError,
    massActionModalOpen,
    selectedMassAction,
    isExecutingMassAction,
    massActionError,
    selectedCount,
    onCloseDeleteModal,
    onConfirmDelete,
    onCloseMassActionModal,
    onConfirmMassAction,
}: ModalsProps<T>) {
    return (
        <>
            {/* Delete Confirmation Modal */}
            <DeleteModal 
                isOpen={deleteModalOpen} 
                isLoading={isDeleting} 
                error={deleteError}
                onClose={onCloseDeleteModal} 
                onConfirm={onConfirmDelete} 
            />

            {/* Mass Action Confirmation Modal */}
            <MassActionModal
                isOpen={massActionModalOpen}
                isLoading={isExecutingMassAction}
                selectedAction={selectedMassAction}
                selectedCount={selectedCount}
                error={massActionError}
                onClose={onCloseMassActionModal}
                onConfirm={onConfirmMassAction}
            />
        </>
    );
}
