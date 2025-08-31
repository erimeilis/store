import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const kbdVariants = cva(
    'kbd',
    {
        variants: {
            // Size variants
            size: {
                xs: 'kbd-xs',
                sm: 'kbd-sm',
                md: 'kbd-md',
                lg: 'kbd-lg',
                xl: 'kbd-xl',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

export interface KbdProps extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
    children: React.ReactNode
}

export interface KeyCombinationProps {
    keys: string[]
    separator?: string
    size?: VariantProps<typeof kbdVariants>['size']
    className?: string
}

export interface KeyboardLayoutProps {
    rows: string[][]
    size?: VariantProps<typeof kbdVariants>['size']
    className?: string
    gap?: string
    onKeyClick?: (key: string) => void
}

/**
 * DaisyUI Kbd Component
 *
 * A component for displaying keyboard keys and shortcuts.
 * Supports various sizes and can be used for individual keys or key combinations.
 */
function Kbd({
    className,
    size,
    children,
    ...props
}: KbdProps) {
    return (
        <kbd
            className={cn(kbdVariants({size}), className)}
            {...props}
        >
            {children}
        </kbd>
    )
}

/**
 * Key Combination Component
 *
 * Displays a combination of keys separated by a delimiter (default: "+").
 * Useful for showing keyboard shortcuts like "Ctrl+Shift+Del".
 */
function KeyCombination({
    keys,
    separator = '+',
    size = 'md',
    className,
}: KeyCombinationProps) {
    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            {keys.map((key, index) => (
                <React.Fragment key={index}>
                    <Kbd size={size}>{key}</Kbd>
                    {index < keys.length - 1 && (
                        <span className="text-base-content/70 text-sm">
                            {separator}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </span>
    )
}

/**
 * Arrow Keys Component
 *
 * Pre-configured component for displaying directional arrow keys.
 */
function ArrowKeys({
    size = 'md',
    className,
    showLabels = false,
}: {
    size?: VariantProps<typeof kbdVariants>['size']
    className?: string
    showLabels?: boolean
}) {
    return (
        <div className={cn('grid grid-cols-3 gap-1 w-fit mx-auto', className)}>
            <div></div>
            <Kbd size={size} title={showLabels ? 'Up' : undefined}>
                ▲
            </Kbd>
            <div></div>
            <Kbd size={size} title={showLabels ? 'Left' : undefined}>
                ◀︎
            </Kbd>
            <div></div>
            <Kbd size={size} title={showLabels ? 'Right' : undefined}>
                ▶︎
            </Kbd>
            <div></div>
            <Kbd size={size} title={showLabels ? 'Down' : undefined}>
                ▼
            </Kbd>
            <div></div>
        </div>
    )
}

/**
 * Modifier Keys Component
 *
 * Pre-configured component for common modifier keys with symbols.
 */
function ModifierKeys({
    keys = ['⌘', '⌥', '⇧', '⌃'],
    size = 'md',
    className,
    labels = ['Command', 'Option', 'Shift', 'Control'],
}: {
    keys?: string[]
    size?: VariantProps<typeof kbdVariants>['size']
    className?: string
    labels?: string[]
}) {
    return (
        <div className={cn('flex gap-2', className)}>
            {keys.map((key, index) => (
                <Kbd key={index} size={size} title={labels[index]}>
                    {key}
                </Kbd>
            ))}
        </div>
    )
}

/**
 * Keyboard Layout Component
 *
 * Displays a keyboard layout from an array of key rows.
 * Useful for showing full or partial keyboard layouts.
 */
function KeyboardLayout({
    rows,
    size = 'md',
    className,
    gap = 'gap-1',
    onKeyClick,
}: KeyboardLayoutProps) {
    return (
        <div className={cn('space-y-1', className)}>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className={cn('flex justify-center', gap)}>
                    {row.map((key, keyIndex) => (
                        <Kbd
                            key={keyIndex}
                            size={size}
                            className={onKeyClick ? 'cursor-pointer hover:bg-base-300' : undefined}
                            onClick={() => onKeyClick?.(key)}
                        >
                            {key}
                        </Kbd>
                    ))}
                </div>
            ))}
        </div>
    )
}

/**
 * QWERTY Keyboard Component
 *
 * Pre-configured QWERTY keyboard layout.
 */
function QwertyKeyboard({
    size = 'md',
    className,
    onKeyClick,
}: {
    size?: VariantProps<typeof kbdVariants>['size']
    className?: string
    onKeyClick?: (key: string) => void
}) {
    const rows = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ]

    return (
        <KeyboardLayout
            rows={rows}
            size={size}
            className={className}
            onKeyClick={onKeyClick}
        />
    )
}

/**
 * Inline Kbd Component
 *
 * A kbd component optimized for inline text usage.
 */
function InlineKbd({
    children,
    size = 'sm',
    className,
    ...props
}: Omit<KbdProps, 'size'> & {
    size?: VariantProps<typeof kbdVariants>['size']
}) {
    return (
        <Kbd
            size={size}
            className={cn('mx-1 align-middle', className)}
            {...props}
        >
            {children}
        </Kbd>
    )
}

export {
    Kbd,
    KeyCombination,
    ArrowKeys,
    ModifierKeys,
    KeyboardLayout,
    QwertyKeyboard,
    InlineKbd,
    kbdVariants
}
