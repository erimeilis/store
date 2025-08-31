import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'
import {Button, type ButtonProps} from './button'

const modalVariants = cva(
    'modal',
    {
        variants: {
            // Documented placement options from DaisyUI
            placement: {
                default: '',
                top: 'modal-top',
                middle: 'modal-middle',
                bottom: 'modal-bottom',
                start: 'modal-start',
                end: 'modal-end',
            },
            // Modifier variants
            modifier: {
                default: '',
                open: 'modal-open',
            },
        },
        defaultVariants: {
            placement: 'default',
            modifier: 'default',
        },
    }
)

export type ModalProps = React.DialogHTMLAttributes<HTMLDialogElement> &
    VariantProps<typeof modalVariants>

export type ModalBoxProps = React.HTMLAttributes<HTMLDivElement>

/**
 * DaisyUI Modal Component
 *
 * Uses a native HTML dialog element with DaisyUI styling exactly as documented.
 * Opens via ModalTrigger or can be pre-opened using modifier="open".
 * Based on: https://daisyui.com/components/modal/
 *
 * @param placement - Modal placement variant: 'default' | 'top' | 'middle' | 'bottom' | 'start' | 'end'
 * @param modifier - Modal modifier: 'default' | 'open' (for pre-opened state)
 * @param className - Additional CSS classes
 * @param children - Modal content (typically ModalBox and ModalBackdrop)
 *
 * @example
 * // Basic modal usage with trigger
 * <ModalTrigger targetModal="hello-modal" color="primary">
 *   Open Modal
 * </ModalTrigger>
 *
 * <Modal id="hello-modal">
 *   <ModalBox>
 *     <h3>Hello World!</h3>
 *     <p>This modal opens when the trigger is clicked.</p>
 *     <ModalAction>
 *       <form method="dialog">
 *         <button className="btn">Close</button>
 *       </form>
 *     </ModalAction>
 *   </ModalBox>
 *   <ModalBackdrop />
 * </Modal>
 *
 * @example
 * // Modal with different placements
 * <Modal id="middle-modal" placement="middle">
 *   <ModalBox>Content in the middle</ModalBox>
 *   <ModalBackdrop />
 * </Modal>
 *
 * <Modal id="bottom-modal" placement="bottom">
 *   <ModalBox>Bottom positioned modal</ModalBox>
 *   <ModalBackdrop />
 * </Modal>
 *
 * @example
 * // Pre-opened modal
 * <Modal id="always-open" modifier="open">
 *   <ModalBox>This modal is always open</ModalBox>
 *   <ModalBackdrop />
 * </Modal>
 */
function Modal({
                   className,
                   placement,
                   modifier,
                   children,
                   ...props
               }: ModalProps) {
    return (
        <dialog
            className={cn(modalVariants({placement, modifier}), className)}
            {...props}
        >
            {children}
        </dialog>
    )
}

/**
 * Modal Box Component
 *
 * The main content container with DaisyUI modal-box class.
 * Based on: https://daisyui.com/components/modal/
 *
 * @param className - Additional CSS classes
 * @param children - Modal content (text, buttons, forms, etc.)
 *
 * @example
 * // Basic modal box
 * <ModalBox>
 *   <h3 className="font-bold text-lg">Hello!</h3>
 *   <p className="py-4">Press ESC key or click outside to close</p>
 * </ModalBox>
 *
 * @example
 * // Modal box with custom width (using Tailwind classes)
 * <ModalBox className="w-11/12 max-w-5xl">
 *   <h1>Wide Modal</h1>
 *   <div>Custom width using Tailwind utilities</div>
 * </ModalBox>
 *
 * @example
 * // Modal box with form content
 * <ModalBox>
 *   <h3 className="font-bold text-lg">Edit Profile</h3>
 *   <form className="py-4">
 *     <input type="text" placeholder="Name" className="input input-bordered w-full" />
 *     <input type="email" placeholder="Email" className="input input-bordered w-full mt-2" />
 *   </form>
 *   <ModalAction>
 *     <button className="btn btn-primary">Save</button>
 *     <button className="btn">Cancel</button>
 *   </ModalAction>
 * </ModalBox>
 */
function ModalBox({
                      className,
                      children,
                      ...props
                  }: ModalBoxProps) {
    return (
        <div
            className={cn('modal-box', className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Modal Action Component
 *
 * Container for modal buttons with DaisyUI modal-action class.
 * Typically placed at the bottom of the modal for action buttons.
 *
 * @param className - Additional CSS classes
 * @param children - Action buttons or other interactive elements
 *
 * @example
 * // Basic action buttons
 * <ModalAction>
 *   <Button color="primary">Confirm</Button>
 *   <Button>Cancel</Button>
 * </ModalAction>
 *
 * @example
 * // Single action button
 * <ModalAction>
 *   <Button size="sm" modifier="circle" style="ghost" className="absolute right-2 top-2">✕</Button>
 * </ModalAction>
 *
 * @example
 * // Multiple action buttons with different styles
 * <ModalAction>
 *   <Button color="error">Delete</Button>
 *   <Button color="warning">Archive</Button>
 *   <Button style="ghost">Cancel</Button>
 * </ModalAction>
 *
 * @example
 * // Form submission actions
 * <ModalAction>
 *   <Button type="submit" color="success">Save Changes</Button>
 *   <Button type="button" style="outline">Reset</Button>
 *   <Button type="button" style="ghost">Cancel</Button>
 * </ModalAction>
 */
function ModalAction({
                         className,
                         ...props
                     }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('modal-action', className)}
            {...props}
        />
    )
}

/**
 * Modal Backdrop Component
 *
 * Creates a backdrop that closes the modal when clicked, exactly as documented.
 * Uses a form with method="dialog" to close the modal when the backdrop is clicked.
 * This is the standard DaisyUI approach for modal backdrop functionality.
 *
 * @param className - Additional CSS classes
 * @param children - Optional custom backdrop content (rarely needed)
 *
 * @example
 * // Basic backdrop usage (most common)
 * <Modal id="my-modal">
 *   <ModalBox>
 *     <h3>Click outside to close</h3>
 *     <p>This modal can be closed by clicking the backdrop</p>
 *   </ModalBox>
 *   <ModalBackdrop />
 * </Modal>
 *
 * @example
 * // Backdrop with custom styling
 * <ModalBackdrop className="bg-black/50" />
 *
 * @example
 * // Modal without backdrop (cannot be closed by clicking outside)
 * <Modal id="no-backdrop-modal">
 *   <ModalBox>
 *     <h3>Must use button to close</h3>
 *     <ModalAction>
 *       <form method="dialog">
 *         <button className="btn">Close</button>
 *       </form>
 *     </ModalAction>
 *   </ModalBox>
 * </Modal>
 */
function ModalBackdrop({
                           className,
                           ...props
                       }: React.FormHTMLAttributes<HTMLFormElement>) {
    return (
        <form
            method="dialog"
            className={cn('modal-backdrop', className)}
            {...props}
        >
            <button type="submit">close</button>
        </form>
    )
}

export interface ModalTriggerProps extends Omit<ButtonProps, 'asChild'> {
    targetModal: string
}

/**
 * Modal Trigger Component
 *
 * A Button component that triggers a modal to open using DaisyUI's modal system.
 * Uses the proper Button component with all available variants.
 * Based on: https://daisyui.com/components/modal/
 *
 * @param targetModal - The ID of the target modal to open
 * @param color - Button color variant
 * @param children - Button content
 *
 * @example
 * // Basic modal trigger
 * <ModalTrigger targetModal="my-modal">
 *   Open Modal
 * </ModalTrigger>
 *
 * @example
 * // Modal trigger with variants
 * <ModalTrigger
 *   targetModal="my-modal"
 *   color="primary"
 *   style="outline"
 *   size="lg"
 * >
 *   Open Modal
 * </ModalTrigger>
 *
 * @example
 * // Modal trigger with processing state
 * <ModalTrigger
 *   targetModal="my-modal"
 *   processing={isLoading}
 *   color="success"
 * >
 *   Save and Open
 * </ModalTrigger>
 */
function ModalTrigger({
                          targetModal,
                          className,
                          onClick,
                          children,
                          ...props
                      }: ModalTriggerProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call the provided onClick handler if it exists
        onClick?.(e)

        // Open the target modal using DaisyUI's modal system
        const modal = document.getElementById(targetModal) as HTMLDialogElement
        if (modal) {
            modal.showModal()
        }
    }

    return (
        <Button
            className={cn('modal-trigger', className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Button>
    )
}

export {
    Modal,
    ModalBox,
    ModalAction,
    ModalBackdrop,
    ModalTrigger,
    modalVariants,
}
