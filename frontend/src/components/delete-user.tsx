import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalBackdrop, ModalBox, ModalTrigger } from '@/components/ui/modal';
import { IconKeyFilled } from '@tabler/icons-react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [data, setDataState] = useState({ password: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ password?: string }>({});

    const setData = (key: string, value: string) => {
        setDataState(prev => ({ ...prev, [key]: value }));
    };

    const reset = () => {
        setDataState({ password: '' });
        setErrors({});
    };

    const clearErrors = () => {
        setErrors({});
    };

    const deleteUser: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch('/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: data.password }),
            });

            if (response.ok) {
                closeModal();
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || { password: 'Invalid password' });
                passwordInput.current?.focus();
            }
        } catch (error) {
            setErrors({ password: 'Network error occurred' });
        } finally {
            setProcessing(false);
            reset();
        }
    };

    const closeModal = () => {
        clearErrors();
        reset();
        // Close the dialog element
        const modal = document.getElementById('delete-user-modal') as HTMLDialogElement;
        if (modal) {
            modal.close();
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h3 className="mb-0.5 text-base font-medium">Delete account</h3>
                <p className="text-muted-foreground text-sm">Delete your account and all of its resources</p>
            </header>
            <Alert color="error" style="soft" className="flex w-full flex-col items-start gap-2">
                <p className="font-medium">Warning</p>
                <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                <ModalTrigger targetModal="delete-user-modal" color="error">
                    Delete account
                </ModalTrigger>
                <Modal id="delete-user-modal">
                    <ModalBox className="w-full max-w-md space-y-6">
                        <h3>Are you sure you want to delete your account?</h3>
                        <p>
                            Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password
                            to confirm you would like to permanently delete your account
                        </p>
                        <form className="flex flex-col items-center gap-6" onSubmit={deleteUser}>
                            <div className="w-full gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    containerClassName="mt-2 w-full"
                                    tabIndex={1}
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    prefix={<IconKeyFilled size="16" />}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex flex-row items-center gap-2">
                                <Button style="outline" onClick={closeModal}>
                                    Cancel
                                </Button>

                                <Button type="submit" color="error" disabled={processing}>
                                    Delete account
                                </Button>
                            </div>
                        </form>
                    </ModalBox>
                    <ModalBackdrop />
                </Modal>
            </Alert>
        </div>
    );
}
