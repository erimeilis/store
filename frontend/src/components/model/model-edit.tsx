import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardActions, CardBody, CardTitle } from '@/components/ui/card';
import { IModel, IModelEditProps } from '@/types/models';
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useState } from 'react';
import { clientApiRequest } from '@/lib/client-api';

interface ModelEditComponentProps<T extends IModel> extends IModelEditProps<T> {
    title: string;
    backRoute: string;
    submitRoute: string;
    method?: 'post' | 'put' | 'patch';
    renderForm: (
        data: T,
        setData: (key: string, value: any) => void,
        errors: Partial<Record<string, string>>,
        processing: boolean,
        readonly?: boolean,
    ) => React.ReactNode;
}

export function ModelEdit<T extends IModel>({
    title,
    item,
    readonly = false,
    backRoute,
    submitRoute,
    method = 'post',
    renderForm,
}: ModelEditComponentProps<T>) {
    const isNew = !item;
    const initialData = item || ({} as T);

    const [data, setDataState] = useState<T>(initialData);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitFailed, setSubmitFailed] = useState(false);

    // Validation functions
    const validateField = (key: string, value: any): string | null => {
        if (key === 'email') {
            // For allowed-emails, email is only required when type is 'email'
            if (data.type === 'email') {
                if (!value || value.trim() === '') return 'Email is required when type is "email"';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
            } else if (value && value.trim()) {
                // If type is not email but email has value, validate format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
            }
        }
        
        if (key === 'domain') {
            // For allowed-emails, domain is only required when type is 'domain'
            if (data.type === 'domain') {
                if (!value || value.trim() === '') return 'Domain is required when type is "domain"';
                // Basic domain validation
                const domainRegex = /^@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!domainRegex.test(value)) return 'Please enter a valid domain (e.g., example.com)';
            }
        }
        
        if (key === 'type') {
            if (!value) return 'Type is required';
            if (!['email', 'domain'].includes(value)) return 'Type must be either "email" or "domain"';
        }
        
        if (key === 'picture' && value) {
            try {
                new URL(value);
            } catch {
                return 'Please enter a valid URL';
            }
        }
        
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (readonly) return;

        setProcessing(true);
        setErrors({});
        setSuccess(false);
        setSubmitFailed(false);

        // Validate all fields before submission
        const validationErrors: Partial<Record<string, string>> = {};
        Object.keys(data).forEach(key => {
            const error = validateField(key, (data as any)[key]);
            if (error) {
                validationErrors[key] = error;
            }
        });

        // Additional validation for allowed-emails form
        if (data.type) {
            if (data.type === 'email') {
                if (!data.email || !data.email.trim()) {
                    validationErrors['email'] = 'Email is required when type is "email"';
                }
            } else if (data.type === 'domain') {
                if (!data.domain || !data.domain.trim()) {
                    validationErrors['domain'] = 'Domain is required when type is "domain"';
                }
            }
        }

        // If there are validation errors, don't submit
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setProcessing(false);
            return;
        }

        try {
            // Clean data: convert empty strings to null for optional fields
            const cleanedData = { ...data };
            Object.keys(cleanedData).forEach(key => {
                if ((cleanedData as any)[key] === '') {
                    (cleanedData as any)[key] = null;
                }
            });

            // Additional cleaning for allowed-emails: ensure mutually exclusive fields
            if ((cleanedData as any).type === 'email') {
                (cleanedData as any).domain = null; // Clear domain when type is email
            } else if ((cleanedData as any).type === 'domain') {
                (cleanedData as any).email = null; // Clear email when type is domain
            }

            const response = await clientApiRequest(submitRoute, {
                method: method.toUpperCase(),
                body: JSON.stringify(cleanedData),
            });

            if (response.ok) {
                setSuccess(true);
                setProcessing(false);
                
                // Show success feedback for 1.5 seconds before redirecting
                setTimeout(() => {
                    window.location.href = backRoute;
                }, 1500);
            } else {
                const errorData = await response.json() as { errors?: Partial<Record<string, string>> };
                setErrors(errorData.errors || { general: 'An error occurred' });
                setSubmitFailed(true);
                setProcessing(false);
            }
        } catch {
            setErrors({ general: 'Network error occurred' });
            setSubmitFailed(true);
            setProcessing(false);
        }
    };

    const handleDataChange = (key: string, value: any) => {
        setDataState(prev => ({ ...prev, [key]: value }));
        
        // Live validation as user types
        const validationError = validateField(key, value);
        setErrors(prev => ({
            ...prev,
            [key]: validationError || undefined
        }));
    };

    const reset = () => {
        setDataState(initialData);
        setErrors({});
    };

    const headingTitle = isNew ? `Create ${title}` : readonly ? `View ${title}` : `Edit ${title}`;

    return (
        <div className="px-4 py-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading title={headingTitle} />
                    <Button style="outline" icon={IconArrowLeft} onClick={() => window.location.href = backRoute}>
                        Back to List
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <CardTitle>{isNew ? `New ${title}` : `${title} Details`}</CardTitle>
                            {renderForm(data as T, handleDataChange, errors, processing, readonly)}
                            {!readonly && (
                                <CardActions justify="between">
                                    <Button
                                        type="button"
                                        style="outline"
                                        onClick={() => reset()}
                                        disabled={processing}
                                        title="Reset form to initial values"
                                        aria-label="Reset form to initial values"
                                    >
                                        Reset
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        processing={processing}
                                        success={success}
                                        fail={submitFailed}
                                    >
                                        {isNew ? 'Create' : 'Update'} {title}
                                    </Button>
                                </CardActions>
                            )}
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
}
