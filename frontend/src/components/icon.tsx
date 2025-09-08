import React from 'react';
import { cn } from '@/lib/utils';
import { type ComponentType } from 'react';

// Tabler icon props interface (based on @tabler/icons-react)
export interface TablerIconProps extends Partial<Omit<React.ComponentPropsWithoutRef<'svg'>, 'stroke'>> {
    size?: string | number;
    stroke?: string | number;
    title?: string;
}

interface IconProps extends Omit<TablerIconProps, 'ref'> {
    iconNode: ComponentType<TablerIconProps> | string;
}

export function Icon({ iconNode, className, size = 16, ...props }: IconProps) {
    // If iconNode is a string, we can't render it directly
    if (typeof iconNode === 'string') {
        console.warn(`Icon component received string "${iconNode}" instead of a component. This is not supported.`);
        return null;
    }

    const IconComponent = iconNode as ComponentType<TablerIconProps>;

    return (
        <IconComponent
            className={cn('h-4 w-4', 'group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8', className)}
            size={size}
            {...props}
        />
    );
}
