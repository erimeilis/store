import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const joinVariants = cva(
    'join',
    {
        variants: {
            // Direction variants
            direction: {
                horizontal: '',
                vertical: 'join-vertical',
            },
        },
        defaultVariants: {
            direction: 'horizontal',
        },
    }
)

const joinItemVariants = cva(
    'join-item',
    {
        variants: {},
        defaultVariants: {},
    }
)

export interface JoinProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof joinVariants> {
    /**
     * Join items as children
     */
    children: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Join component for grouping related elements together.
 *
 * Based on DaisyUI's join component with support for horizontal and vertical
 * layouts. Perfect for grouping buttons, inputs, and other UI elements
 * with seamless visual connection and shared borders.
 *
 * @example
 * ```tsx
 * <Join direction="horizontal">
 *   <JoinItem>
 *     <Button>First</Button>
 *   </JoinItem>
 *   <JoinItem>
 *     <Button>Second</Button>
 *   </JoinItem>
 *   <JoinItem>
 *     <Button>Third</Button>
 *   </JoinItem>
 * </Join>
 * ```
 */
function Join({
    className,
    direction,
    children,
    asChild = false,
    ...props
}: JoinProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(joinVariants({ direction }), className)}
            role="group"
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * JoinItem component for individual items within a Join.
 *
 * @example
 * ```tsx
 * <Join>
 *   <JoinItem>
 *     <Button color="primary">Active</Button>
 *   </JoinItem>
 *   <JoinItem>
 *     <Button>Normal</Button>
 *   </JoinItem>
 * </Join>
 * ```
 */
export interface JoinItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Item content
     */
    children: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function JoinItem({
    className,
    children,
    asChild = false,
    ...props
}: JoinItemProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(joinItemVariants(), className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * ButtonJoin component specifically for joining buttons.
 *
 * @example
 * ```tsx
 * <ButtonJoin
 *   buttons={[
 *     { children: 'First', color: 'primary' },
 *     { children: 'Second' },
 *     { children: 'Third', style: 'outline' }
 *   ]}
 *   direction="horizontal"
 * />
 * ```
 */
export interface ButtonJoinItem {
    /**
     * Button content
     */
    children: React.ReactNode
    /**
     * Button color
     */
    color?: 'default' | 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Button style
     */
    style?: 'default' | 'outline' | 'ghost' | 'link'
    /**
     * Button size
     */
    size?: 'xs' | 'sm' | 'md' | 'lg'
    /**
     * Whether button is active
     */
    active?: boolean
    /**
     * Whether button is disabled
     */
    disabled?: boolean
    /**
     * Click handler
     */
    onClick?: () => void
    /**
     * Additional button props
     */
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export interface ButtonJoinProps extends Omit<JoinProps, 'children'> {
    /**
     * Array of button configurations
     */
    buttons: ButtonJoinItem[]
    /**
     * Currently active button index
     */
    activeIndex?: number
    /**
     * Callback fired when a button is clicked
     */
    onButtonClick?: (index: number, button: ButtonJoinItem) => void
}

function ButtonJoin({
    buttons,
    activeIndex,
    onButtonClick,
    ...joinProps
}: ButtonJoinProps) {
    return (
        <Join {...joinProps}>
            {buttons.map((button, index) => {
                const isActive = activeIndex !== undefined ? index === activeIndex : button.active

                return (
                    <JoinItem key={index}>
                        <button
                            type="button"
                            className={cn(
                                'btn',
                                // Color variants
                                button.color === 'neutral' && 'btn-neutral',
                                button.color === 'primary' && 'btn-primary',
                                button.color === 'secondary' && 'btn-secondary',
                                button.color === 'accent' && 'btn-accent',
                                button.color === 'info' && 'btn-info',
                                button.color === 'success' && 'btn-success',
                                button.color === 'warning' && 'btn-warning',
                                button.color === 'error' && 'btn-error',
                                // Style variants
                                button.style === 'outline' && 'btn-outline',
                                button.style === 'ghost' && 'btn-ghost',
                                button.style === 'link' && 'btn-link',
                                // Size variants
                                button.size === 'xs' && 'btn-xs',
                                button.size === 'sm' && 'btn-sm',
                                button.size === 'md' && 'btn-md',
                                button.size === 'lg' && 'btn-lg',
                                // State variants
                                isActive && 'btn-active',
                                button.disabled && 'btn-disabled',
                                button.buttonProps?.className
                            )}
                            disabled={button.disabled}
                            onClick={() => {
                                button.onClick?.()
                                onButtonClick?.(index, button)
                            }}
                            {...button.buttonProps}
                        >
                            {button.children}
                        </button>
                    </JoinItem>
                )
            })}
        </Join>
    )
}

/**
 * InputJoin component for joining input elements.
 *
 * @example
 * ```tsx
 * <InputJoin direction="horizontal">
 *   <JoinItem>
 *     <Input placeholder="First name" />
 *   </JoinItem>
 *   <JoinItem>
 *     <Input placeholder="Last name" />
 *   </JoinItem>
 * </InputJoin>
 * ```
 */
export interface InputJoinProps extends JoinProps {
    /**
     * Input elements as children
     */
    children: React.ReactNode
}

function InputJoin({ children, ...props }: InputJoinProps) {
    return (
        <Join {...props}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child) && child.type === JoinItem) {
                    return child
                }
                return (
                    <JoinItem key={index}>
                        {child}
                    </JoinItem>
                )
            })}
        </Join>
    )
}

/**
 * SearchJoin component for search input with button.
 *
 * @example
 * ```tsx
 * <SearchJoin
 *   placeholder="Search..."
 *   buttonText="Search"
 *   onSearch={(query) => console.log('Search:', query)}
 *   buttonColor="primary"
 * />
 * ```
 */
export interface SearchJoinProps extends Omit<JoinProps, 'children'> {
    /**
     * Input placeholder text
     */
    placeholder?: string
    /**
     * Current search value
     */
    value?: string
    /**
     * Default search value
     */
    defaultValue?: string
    /**
     * Search button text
     */
    buttonText?: React.ReactNode
    /**
     * Search button icon
     */
    buttonIcon?: React.ReactNode
    /**
     * Button color
     */
    buttonColor?: 'default' | 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Callback fired when search is triggered
     */
    onSearch?: (query: string) => void
    /**
     * Callback fired when input value changes
     */
    onValueChange?: (value: string) => void
    /**
     * Input props
     */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    /**
     * Button props
     */
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

function SearchJoin({
    placeholder = 'Search...',
    value,
    defaultValue,
    buttonText = 'Search',
    buttonIcon,
    buttonColor = 'primary',
    onSearch,
    onValueChange,
    inputProps,
    buttonProps,
    ...joinProps
}: SearchJoinProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value

        if (!isControlled) {
            setInternalValue(newValue)
        }

        onValueChange?.(newValue)
        inputProps?.onChange?.(e)
    }

    const handleSearch = () => {
        onSearch?.(currentValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
        inputProps?.onKeyDown?.(e)
    }

    return (
        <Join {...joinProps}>
            <JoinItem>
                <input
                    type="text"
                    className={cn('input input-bordered', inputProps?.className)}
                    placeholder={placeholder}
                    value={currentValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    {...inputProps}
                />
            </JoinItem>
            <JoinItem>
                <button
                    type="button"
                    className={cn(
                        'btn',
                        buttonColor === 'neutral' && 'btn-neutral',
                        buttonColor === 'primary' && 'btn-primary',
                        buttonColor === 'secondary' && 'btn-secondary',
                        buttonColor === 'accent' && 'btn-accent',
                        buttonColor === 'info' && 'btn-info',
                        buttonColor === 'success' && 'btn-success',
                        buttonColor === 'warning' && 'btn-warning',
                        buttonColor === 'error' && 'btn-error',
                        buttonProps?.className
                    )}
                    onClick={handleSearch}
                    {...buttonProps}
                >
                    {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
                    {buttonText}
                </button>
            </JoinItem>
        </Join>
    )
}

/**
 * SegmentedControl component using join for tab-like controls.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { value: 'list', label: 'List' },
 *     { value: 'grid', label: 'Grid' },
 *     { value: 'table', label: 'Table' }
 *   ]}
 *   value={view}
 *   onValueChange={setView}
 * />
 * ```
 */
export interface SegmentedControlOption {
    /**
     * Option value
     */
    value: string
    /**
     * Option label
     */
    label: React.ReactNode
    /**
     * Whether option is disabled
     */
    disabled?: boolean
    /**
     * Custom option props
     */
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export interface SegmentedControlProps extends Omit<JoinProps, 'children'> {
    /**
     * Array of options
     */
    options: SegmentedControlOption[]
    /**
     * Current selected value
     */
    value?: string
    /**
     * Default selected value
     */
    defaultValue?: string
    /**
     * Callback fired when selection changes
     */
    onValueChange?: (value: string) => void
    /**
     * Button size
     */
    size?: 'xs' | 'sm' | 'md' | 'lg'
}

function SegmentedControl({
    options,
    value,
    defaultValue,
    onValueChange,
    size = 'md',
    ...joinProps
}: SegmentedControlProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || options[0]?.value || '')
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <Join {...joinProps}>
            {options.map((option) => (
                <JoinItem key={option.value}>
                    <input
                        className="btn"
                        type="radio"
                        name={`segmented-${Math.random()}`}
                        aria-label={typeof option.label === 'string' ? option.label : option.value}
                        checked={currentValue === option.value}
                        onChange={() => handleValueChange(option.value)}
                        disabled={option.disabled}
                    />
                    <button
                        type="button"
                        className={cn(
                            'btn',
                            size === 'xs' && 'btn-xs',
                            size === 'sm' && 'btn-sm',
                            size === 'md' && 'btn-md',
                            size === 'lg' && 'btn-lg',
                            currentValue === option.value && 'btn-active',
                            option.disabled && 'btn-disabled',
                            option.props?.className
                        )}
                        onClick={() => !option.disabled && handleValueChange(option.value)}
                        disabled={option.disabled}
                        {...option.props}
                    >
                        {option.label}
                    </button>
                </JoinItem>
            ))}
        </Join>
    )
}

export {
    Join,
    JoinItem,
    ButtonJoin,
    InputJoin,
    SearchJoin,
    SegmentedControl,
    joinVariants,
    joinItemVariants
}
