import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardActions, CardBody, CardTitle } from '@/components/ui/card';
import { IModel, IModelEditProps } from '@/types/models';
import { IconArrowLeft } from '@tabler/icons-react';
import React, { useState } from 'react';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (readonly) return;

        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch(submitRoute, {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                window.location.href = backRoute;
            } else {
                const errorData = await response.json() as { errors?: Partial<Record<string, string>> };
                setErrors(errorData.errors || { general: 'An error occurred' });
            }
        } catch {
            setErrors({ general: 'Network error occurred' });
        } finally {
            setProcessing(false);
        }
    };

    const handleDataChange = (key: string, value: any) => {
        setDataState(prev => ({ ...prev, [key]: value }));
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
                                    <Button type="submit" disabled={processing}>
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
