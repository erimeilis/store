import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
    title?: string
    description?: string
}

function Fieldset({
    className,
    title,
    description,
    children,
    ...props
}: FieldsetProps) {
    return (
        <fieldset
            className={cn("fieldset w-full rounded-box border border-base-300 bg-base-100 px-8 pt-16 pb-6", className)}
            {...props}
        >
            <legend className="fieldset-legend">{title}</legend>
            {description && (
                <p className="text-muted-foreground text-center text-xs">{description}</p>
            )}
            {children}
        </fieldset>
    )
}

export { Fieldset }
