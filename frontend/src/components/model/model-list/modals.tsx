import { IModel } from '@/types/models';
import { DeleteModal } from './modal-components/delete-modal';
import { MassActionModal } from './modal-components/mass-action-modal';
import { ModalsProps } from './types';

export function ModelListModals<T extends IModel>({
    deleteModalOpen,
    isDeleting,
    massActionModalOpen,
    selectedMassAction,
    isExecutingMassAction,
    selectedCount,
    onCloseDeleteModal,
    onConfirmDelete,
    onCloseMassActionModal,
    onConfirmMassAction,
}: ModalsProps<T>) {
    return (
        <>
            {/* Delete Confirmation Modal */}
            <DeleteModal isOpen={deleteModalOpen} isLoading={isDeleting} onClose={onCloseDeleteModal} onConfirm={onConfirmDelete} />

            {/* Mass Action Confirmation Modal */}
            <MassActionModal
                isOpen={massActionModalOpen}
                isLoading={isExecutingMassAction}
                selectedAction={selectedMassAction}
                selectedCount={selectedCount}
                onClose={onCloseMassActionModal}
                onConfirm={onConfirmMassAction}
            />
        </>
    );
}
