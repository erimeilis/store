import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconCancel } from '@tabler/icons-react';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <Badge {...props} variant="error" styleVariant="soft" size="xs" className={cn('mt-1', className)}>
            <IconCancel size="12" />
            {message}
        </Badge>
    ) : null;
}
