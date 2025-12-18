import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const fileInputVariants = cva(
    'file-input',
    {
        variants: {
            // Style variants
            style: {
                default: '',
                ghost: 'file-input-ghost',
            },
            // Color variants
            color: {
                default: '',
                primary: 'file-input-primary',
                secondary: 'file-input-secondary',
                accent: 'file-input-accent',
                neutral: 'file-input-neutral',
                info: 'file-input-info',
                success: 'file-input-success',
                warning: 'file-input-warning',
                error: 'file-input-error',
            },
            // Size variants
            size: {
                xs: 'file-input-xs',
                sm: 'file-input-sm',
                md: 'file-input-md',
                lg: 'file-input-lg',
                xl: 'file-input-xl',
            },
            // Width variants
            width: {
                default: '',
                full: 'w-full',
                max: 'max-w-xs',
            },
        },
        defaultVariants: {
            style: 'default',
            color: 'default',
            size: 'md',
            width: 'default',
        },
    }
)

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color' | 'style' | 'width'>,
    VariantProps<typeof fileInputVariants> {
    onFileChange?: (files: FileList | null) => void
}

export interface FileInputWithFieldsetProps extends FileInputProps {
    legend?: React.ReactNode
    label?: React.ReactNode
    fieldsetClassName?: string
    legendClassName?: string
    labelClassName?: string
}

/**
 * DaisyUI File Input Component
 *
 * A file input component that allows users to upload files.
 * Supports various styles, colors, sizes, and width options.
 */
function FileInput({
    className,
    style,
    color,
    size,
    width,
    onFileChange,
    onChange,
    ...props
}: FileInputProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        onFileChange?.(files)
        onChange?.(event)
    }

    return (
        <input
            type="file"
            className={cn(fileInputVariants({style, color, size, width}), className)}
            onChange={handleChange}
            {...props}
        />
    )
}

/**
 * DaisyUI File Input with Fieldset Component
 *
 * File input wrapped in a fieldset with optional legend and label.
 * Provides better semantic structure and accessibility.
 */
function FileInputWithFieldset({
    className,
    style,
    color,
    size,
    width,
    legend,
    label,
    fieldsetClassName,
    legendClassName,
    labelClassName,
    onFileChange,
    onChange,
    ...props
}: FileInputWithFieldsetProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        onFileChange?.(files)
        onChange?.(event)
    }

    return (
        <fieldset className={cn('fieldset', fieldsetClassName)}>
            {legend && (
                <legend className={cn('fieldset-legend', legendClassName)}>
                    {legend}
                </legend>
            )}
            <input
                type="file"
                className={cn(fileInputVariants({style, color, size, width}), className)}
                onChange={handleChange}
                {...props}
            />
            {label && (
                <label className={cn('label', labelClassName)}>
                    {label}
                </label>
            )}
        </fieldset>
    )
}

/**
 * File Input with Preview Component
 *
 * Enhanced file input that shows selected file information.
 */
function FileInputWithPreview({
    className,
    style,
    color,
    size,
    width,
    onFileChange,
    onChange,
    showFileSize = true,
    showFileType = true,
    previewClassName,
    ...props
}: FileInputProps & {
    showFileSize?: boolean
    showFileType?: boolean
    previewClassName?: string
}) {
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        setSelectedFiles(files)
        onFileChange?.(files)
        onChange?.(event)
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-2">
            <input
                type="file"
                className={cn(fileInputVariants({style, color, size, width}), className)}
                onChange={handleChange}
                {...props}
            />
            {selectedFiles && selectedFiles.length > 0 && (
                <div className={cn('text-sm text-base-content/70', previewClassName)}>
                    {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="font-medium">{file.name}</span>
                            {showFileType && (
                                <span className="badge badge-outline badge-sm">
                                    {file.type || 'Unknown'}
                                </span>
                            )}
                            {showFileSize && (
                                <span className="text-xs opacity-60">
                                    {formatFileSize(file.size)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Drag and Drop File Input Component
 *
 * File input with drag and drop functionality.
 */
function FileInputDragDrop({
    className,
    onFileChange,
    onChange,
    children,
    dragOverClassName = 'border-primary',
    ...props
}: Omit<FileInputProps, 'style' | 'color' | 'size' | 'width'> & {
    children?: React.ReactNode
    dragOverClassName?: string
}) {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        onFileChange?.(files)
        onChange?.(event)
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)

        const files = event.dataTransfer.files
        if (inputRef.current && files.length > 0) {
            // Create a new FileList-like object
            const dt = new DataTransfer()
            Array.from(files).forEach(file => dt.items.add(file))
            inputRef.current.files = dt.files

            onFileChange?.(files)
        }
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <div
            className={cn(
                'relative border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors',
                isDragOver && dragOverClassName,
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                {...props}
            />
            {children || (
                <div className="space-y-2">
                    <div className="text-base-content/70">
                        Drop files here or click to browse
                    </div>
                    <div className="text-sm text-base-content/50">
                        Drag and drop files or click to select
                    </div>
                </div>
            )}
        </div>
    )
}

export {
    FileInput,
    FileInputWithFieldset,
    FileInputWithPreview,
    FileInputDragDrop,
    fileInputVariants
}
