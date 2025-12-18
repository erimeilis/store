import * as React from 'react'
import {cn} from '@/lib/utils'

export interface BooleanCircleProps {
    value: boolean | string
    size?: 'sm' | 'md' | 'lg'
    className?: string
    onClick?: () => void
    disabled?: boolean
    title?: string
    /**
     * Invert the color semantics (false=success, true=error)
     * Use for columns where false is the "good" state (e.g., "used" column)
     */
    invertColors?: boolean
}

const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
}

const BooleanCircle = React.forwardRef<HTMLDivElement, BooleanCircleProps>(
    ({value, size = 'md', className, onClick, disabled = false, title, invertColors = false}, ref) => {
        const isClickable = !!onClick && !disabled

        // Normalize value to boolean - handles string "true"/"false" vs actual booleans
        const normalizedValue = value === true || value === 'true'

        // Determine color based on value and invertColors flag
        // Normal: true=success, false=error
        // Inverted: true=error, false=success (for "used" column where false is good)
        const showSuccess = invertColors ? !normalizedValue : normalizedValue

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-full inline-block transition-all duration-150',
                    sizeClasses[size],
                    showSuccess ? 'bg-success' : 'bg-error',
                    isClickable && 'cursor-pointer hover:opacity-80 hover:scale-110',
                    disabled && 'opacity-50 cursor-not-allowed',
                    className
                )}
                onClick={disabled ? undefined : onClick}
                title={title || (normalizedValue ? 'Yes' : 'No')}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={
                    isClickable
                        ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  onClick?.()
                              }
                          }
                        : undefined
                }
            />
        )
    }
)

BooleanCircle.displayName = 'BooleanCircle'

export {BooleanCircle}
