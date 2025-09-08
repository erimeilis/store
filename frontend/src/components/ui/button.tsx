import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'
import {IconCheck, IconX} from '@tabler/icons-react'
import {Transition} from '@headlessui/react'

const buttonVariants = cva(
    'btn',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                neutral: 'btn-neutral',
                primary: 'btn-primary',
                secondary: 'btn-secondary',
                accent: 'btn-accent',
                info: 'btn-info',
                success: 'btn-success',
                warning: 'btn-warning',
                error: 'btn-error',
            },
            // Style variants
            style: {
                default: '',
                outline: 'btn-outline',
                dash: 'btn-dash',
                soft: 'btn-soft',
                ghost: 'btn-ghost',
                link: 'btn-link',
            },
            // Behavior variants
            behaviour: {
                default: '',
                active: 'btn-active',
                disabled: 'btn-disabled',
            },
            // Size variants
            size: {
                xs: 'btn-xs',
                sm: 'btn-sm',
                md: 'btn-md',
                lg: 'btn-lg',
                xl: 'btn-xl',
                icon: 'btn-circle btn-xs p-0',
            },
            // Modifier variants
            modifier: {
                default: '',
                circle: 'btn-circle',
                square: 'btn-square',
                wide: 'btn-wide',
                block: 'btn-block',
            },
        },
        defaultVariants: {
            color: 'default',
            style: 'default',
            behaviour: 'default',
            size: 'md',
            modifier: 'default',
        },
    }
)

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'style'>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    processing?: boolean
    success?: boolean
    fail?: boolean
    icon?: React.ComponentType<{ size?: number | string; className?: string }>
}

function Button({
                    className,
                    color,
                    style,
                    behaviour,
                    size,
                    modifier,
                    asChild = false,
                    processing = false,
                    success = false,
                    fail = false,
                    icon,
                    disabled,
                    children,
                    ...props
                }: ButtonProps) {
    const Comp = asChild ? Slot : 'button'

    // Determine if the button should be disabled
    const isDisabled = disabled || processing

    // Determine the effective color and style based on success or fail state
    const effectiveColor = success ? 'success' : fail ? 'error' : color
    const effectiveStyle = success ? 'soft' : fail ? 'soft' : style
    // Automatically set behaviour to 'disabled' if button is disabled, unless explicitly overridden
    const effectiveBehaviour = isDisabled ? 'disabled' : behaviour

    // Check if this is an icon-only button
    const isIconOnly = size === 'icon'

    // Determine icon size based on button size
    const getIconSize = (isIconOnly: boolean) => {
        if (isIconOnly) {
            // Icon-only buttons use fixed size based on button size
            switch (size) {
                case 'xs': return 12
                case 'sm': return 14
                case 'md': return 16
                case 'lg': return 18
                case 'xl': return 20
                case 'icon': return 16
                default: return 16
            }
        } else {
            // Regular buttons with text use smaller icons
            switch (size) {
                case 'xs': return 10
                case 'sm': return 11
                case 'md': return 12
                case 'lg': return 14
                case 'xl': return 16
                default: return 12
            }
        }
    }

    const iconSize = getIconSize(isIconOnly)

    // Render content with state-based icons and transitions
    const renderContent = () => (
        <>
            {/* Success transition */}
            <Transition
                show={success}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in-out duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <IconCheck size={iconSize} className={`text-success-foreground ${isIconOnly ? '' : 'mr-2'}`}/>
            </Transition>

            {/* Fail transition */}
            <Transition
                show={fail}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in-out duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <IconX size={iconSize} className={`text-error-foreground ${isIconOnly ? '' : 'mr-2'}`}/>
            </Transition>

            {/* Processing state (only show when not in a success or fail state) */}
            {!success && !fail && processing && (
                <span className={`loading loading-spinner ${isIconOnly ? '' : 'mr-2'}`} style={{width: iconSize, height: iconSize}}></span>
            )}

            {/* Optional icon (only show when not in processing, success, or fail state) */}
            {!processing && !success && !fail && icon && (
                React.createElement(icon, {size: iconSize, className: isIconOnly ? '' : 'mr-2'})
            )}

            {/* Only show children text if not an icon-only button */}
            {!isIconOnly && <span>{children}</span>}
        </>
    )

    return (
        <Comp
            className={cn(buttonVariants({color: effectiveColor, style: effectiveStyle, behaviour: effectiveBehaviour, size, modifier}), className)}
            disabled={isDisabled}
            {...props}
        >
            {renderContent()}
        </Comp>
    )
}

export {Button, buttonVariants}
