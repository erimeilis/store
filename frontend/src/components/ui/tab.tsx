import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tabsVariants = cva(
    'tabs',
    {
        variants: {
            // Style variants
            variant: {
                default: '',
                bordered: 'tabs-bordered',
                lifted: 'tabs-lifted',
                boxed: 'tabs-boxed',
            },
            // Size variants
            size: {
                xs: 'tabs-xs',
                sm: 'tabs-sm',
                md: 'tabs-md',
                lg: 'tabs-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
)

const tabVariants = cva(
    'tab',
    {
        variants: {
            // State variants
            state: {
                default: '',
                active: 'tab-active',
                disabled: 'tab-disabled',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
)

export interface TabItem {
    /**
     * Unique identifier for the tab
     */
    id: string
    /**
     * Tab label/title
     */
    label: React.ReactNode
    /**
     * Tab content
     */
    content: React.ReactNode
    /**
     * Whether the tab is disabled
     */
    disabled?: boolean
    /**
     * Custom props for the tab button
     */
    tabProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export interface TabsProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
        VariantProps<typeof tabsVariants> {
    /**
     * Array of tab items
     */
    items: TabItem[]
    /**
     * Currently active tab id
     */
    activeTab?: string
    /**
     * Default active tab id (for uncontrolled mode)
     */
    defaultActiveTab?: string
    /**
     * Callback fired when active tab changes
     */
    onTabChange?: (tabId: string) => void
    /**
     * Custom props for the content container
     */
    contentProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Tabs component for organizing content into multiple panels.
 *
 * Based on DaisyUI's tab component with support for different styles,
 * sizes, and both controlled and uncontrolled modes. Perfect for
 * organizing related content and creating tabbed interfaces.
 *
 * @example
 * ```tsx
 * const tabItems = [
 *   { id: 'tab1', label: 'Profile', content: <ProfileContent /> },
 *   { id: 'tab2', label: 'Settings', content: <SettingsContent /> },
 *   { id: 'tab3', label: 'Help', content: <HelpContent /> }
 * ]
 *
 * <Tabs
 *   items={tabItems}
 *   variant="boxed"
 *   size="lg"
 *   activeTab={currentTab}
 *   onTabChange={setCurrentTab}
 * />
 * ```
 */
function Tabs({
    className,
    variant,
    size,
    items,
    activeTab,
    defaultActiveTab,
    onTabChange,
    contentProps,
    asChild = false,
    ...props
}: TabsProps) {
    const [internalActiveTab, setInternalActiveTab] = React.useState(
        defaultActiveTab || items[0]?.id || ''
    )

    const isControlled = activeTab !== undefined
    const currentActiveTab = isControlled ? activeTab : internalActiveTab

    const handleTabChange = (tabId: string) => {
        if (isControlled) {
            onTabChange?.(tabId)
        } else {
            setInternalActiveTab(tabId)
            onTabChange?.(tabId)
        }
    }

    const activeTabItem = items.find(item => item.id === currentActiveTab)
    const Comp = asChild ? Slot : 'div'

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <Comp
                className={cn(tabsVariants({ variant, size }), className)}
                role="tablist"
                {...props}
            >
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={currentActiveTab === item.id}
                        aria-controls={`tabpanel-${item.id}`}
                        tabIndex={currentActiveTab === item.id ? 0 : -1}
                        disabled={item.disabled}
                        className={cn(
                            tabVariants({
                                state: currentActiveTab === item.id
                                    ? 'active'
                                    : item.disabled
                                    ? 'disabled'
                                    : 'default'
                            }),
                            item.tabProps?.className
                        )}
                        onClick={() => !item.disabled && handleTabChange(item.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                                e.preventDefault()
                                const enabledTabs = items.filter(tab => !tab.disabled)
                                const currentEnabledIndex = enabledTabs.findIndex(tab => tab.id === currentActiveTab)

                                let nextIndex
                                if (e.key === 'ArrowRight') {
                                    nextIndex = (currentEnabledIndex + 1) % enabledTabs.length
                                } else {
                                    nextIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length
                                }

                                const nextTab = enabledTabs[nextIndex]
                                if (nextTab) {
                                    handleTabChange(nextTab.id)
                                }
                            }
                            item.tabProps?.onKeyDown?.(e)
                        }}
                        {...item.tabProps}
                    >
                        {item.label}
                    </button>
                ))}
            </Comp>

            {/* Tab Content */}
            <div
                id={`tabpanel-${currentActiveTab}`}
                role="tabpanel"
                aria-labelledby={currentActiveTab}
                className={cn('py-4', contentProps?.className)}
                {...contentProps}
            >
                {activeTabItem?.content}
            </div>
        </div>
    )
}

/**
 * Simple Tab component for individual tab usage.
 *
 * @example
 * ```tsx
 * <div className="tabs tabs-boxed">
 *   <Tab active>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 *   <Tab disabled>Tab 3</Tab>
 * </div>
 * ```
 */
export interface TabProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof tabVariants> {
    /**
     * Whether the tab is active
     */
    active?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Tab({
    className,
    active = false,
    disabled = false,
    asChild = false,
    children,
    ...props
}: TabProps) {
    const Comp = asChild ? Slot : 'button'

    const effectiveState = disabled ? 'disabled' : active ? 'active' : 'default'

    return (
        <Comp
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            className={cn(tabVariants({ state: effectiveState }), className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

export { Tabs, Tab, tabsVariants, tabVariants }
