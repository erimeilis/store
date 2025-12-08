/**
 * ChipSelect - Multi-select component with chip/badge display
 * Allows selecting multiple options displayed as removable chips
 */

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { IconX, IconChevronDown } from '@tabler/icons-react'

const chipSelectVariants = cva(
  'min-h-12 w-full rounded-lg border bg-base-100 px-3 py-2 cursor-pointer flex flex-wrap gap-2 items-center',
  {
    variants: {
      color: {
        default: 'border-base-300 focus-within:border-primary',
        primary: 'border-primary',
        error: 'border-error',
      },
      size: {
        sm: 'min-h-10 text-sm',
        md: 'min-h-12',
        lg: 'min-h-14 text-lg',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'md',
    },
  }
)

export interface ChipSelectOption {
  value: string
  label: string
  group?: 'business' | 'personal' | null
  raw?: Record<string, unknown>
}

export interface ChipSelectProps
  extends VariantProps<typeof chipSelectVariants> {
  options: ChipSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  maxDisplay?: number
  showGroupBadges?: boolean
}

function ChipSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  className,
  color,
  size,
  error,
  maxDisplay = 10,
  showGroupBadges = true,
}: ChipSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const effectiveColor = error ? 'error' : color

  const selectedOptions = options.filter(opt => value.includes(opt.value))
  const availableOptions = options.filter(opt =>
    !value.includes(opt.value) &&
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (optionValue: string) => {
    if (!value.includes(optionValue)) {
      onChange([...value, optionValue])
    }
    setSearch('')
    inputRef.current?.focus()
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && search === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    }
    if (e.key === 'Enter' && availableOptions.length > 0) {
      e.preventDefault()
      handleSelect(availableOptions[0].value)
    }
  }

  const getChipColor = (option: ChipSelectOption) => {
    if (!showGroupBadges) return 'badge-ghost'
    if (option.group === 'business') return 'badge-primary'
    if (option.group === 'personal') return 'badge-ghost'
    return 'badge-neutral'
  }

  const getChipPrefix = (option: ChipSelectOption) => {
    if (!showGroupBadges || !option.group) return ''
    return option.group === 'business' ? '[B] ' : '[P] '
  }

  // Strip [B] or [P] prefix from label for chip display
  const getCleanLabel = (label: string) => {
    return label.replace(/^\[(B|P)\]\s*/, '')
  }

  return (
    <div className="w-full" ref={containerRef}>
      <div
        className={cn(
          chipSelectVariants({ color: effectiveColor, size }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true)
            inputRef.current?.focus()
          }
        }}
      >
        {/* Selected chips */}
        {selectedOptions.slice(0, maxDisplay).map((option) => (
          <span
            key={option.value}
            className={cn('badge gap-1', getChipColor(option))}
          >
            {getChipPrefix(option)}{getCleanLabel(option.label)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => handleRemove(option.value, e)}
                className="hover:text-error"
              >
                <IconX size={14} />
              </button>
            )}
          </span>
        ))}

        {selectedOptions.length > maxDisplay && (
          <span className="badge badge-neutral">
            +{selectedOptions.length - maxDisplay} more
          </span>
        )}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
          disabled={disabled}
        />

        {/* Dropdown arrow */}
        <IconChevronDown
          size={18}
          className={cn(
            'text-base-content/50 transition-transform ml-auto',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="relative">
          <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg">
            {availableOptions.length === 0 ? (
              <li className="px-4 py-3 text-base-content/50 text-sm">
                {search ? 'No matching options' : 'No more options available'}
              </li>
            ) : (
              availableOptions.map((option) => (
                <li
                  key={`${option.value}-${option.label}`}
                  onClick={() => handleSelect(option.value)}
                  className="px-4 py-2 cursor-pointer hover:bg-base-200 flex items-center gap-2"
                >
                  {showGroupBadges && option.group && (
                    <span className={cn(
                      'badge badge-xs',
                      option.group === 'business' ? 'badge-primary' : 'badge-ghost'
                    )}>
                      {option.group === 'business' ? 'B' : 'P'}
                    </span>
                  )}
                  <span>{getCleanLabel(option.label)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <div className="label">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      )}
    </div>
  )
}

export { ChipSelect }
