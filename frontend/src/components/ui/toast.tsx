import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toastVariants = cva(
    'toast',
    {
        variants: {
            // Position variants
            position: {
                'top': 'toast-top',
                'bottom': 'toast-bottom',
                'center': 'toast-center',
                'start': 'toast-start',
                'end': 'toast-end',
                'top-start': 'toast-top toast-start',
                'top-center': 'toast-top toast-center',
                'top-end': 'toast-top toast-end',
                'middle-start': 'toast-middle toast-start',
                'middle-center': 'toast-middle toast-center',
                'middle-end': 'toast-middle toast-end',
                'bottom-start': 'toast-bottom toast-start',
                'bottom-center': 'toast-bottom toast-center',
                'bottom-end': 'toast-bottom toast-end',
            },
        },
        defaultVariants: {
            position: 'top-end',
        },
    }
)

const alertVariants = cva(
    'alert',
    {
        variants: {
            // Style variants
            variant: {
                default: '',
                info: 'alert-info',
                success: 'alert-success',
                warning: 'alert-warning',
                error: 'alert-error',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface ToastMessage {
    /**
     * Unique identifier for the toast
     */
    id: string
    /**
     * Toast title
     */
    title?: React.ReactNode
    /**
     * Toast message content
     */
    message: React.ReactNode
    /**
     * Toast type/variant
     */
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Custom icon
     */
    icon?: React.ReactNode
    /**
     * Whether the toast can be dismissed
     */
    dismissible?: boolean
    /**
     * Auto dismiss duration in milliseconds (0 = no auto dismiss)
     */
    duration?: number
    /**
     * Action button
     */
    action?: {
        label: string
        onClick: () => void
    }
    /**
     * Custom toast props
     */
    toastProps?: React.HTMLAttributes<HTMLDivElement>
}

export interface ToastContainerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'position'>,
        VariantProps<typeof toastVariants> {
    /**
     * Array of toast messages
     */
    toasts: ToastMessage[]
    /**
     * Maximum number of toasts to display
     * @default 5
     */
    maxToasts?: number
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Toast container for displaying notification messages.
 *
 * Based on DaisyUI's toast component with support for different positions,
 * variants, auto-dismissal, and action buttons. Perfect for status updates,
 * error messages, success confirmations, and user notifications.
 *
 * @example
 * ```tsx
 * const [toasts, setToasts] = useState([
 *   {
 *     id: '1',
 *     title: 'Success!',
 *     message: 'Your changes have been saved.',
 *     variant: 'success',
 *     duration: 5000,
 *     dismissible: true
 *   }
 * ])
 *
 * <ToastContainer
 *   toasts={toasts}
 *   position="top-end"
 *   maxToasts={5}
 * />
 * ```
 */
function ToastContainer({
    className,
    position,
    toasts,
    maxToasts = 5,
    asChild = false,
    ...props
}: ToastContainerProps) {
    const Comp = asChild ? Slot : 'div'
    const displayToasts = toasts.slice(0, maxToasts)

    if (displayToasts.length === 0) {
        return null
    }

    return (
        <Comp
            className={cn(toastVariants({ position }), className)}
            {...props}
        >
            {displayToasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                />
            ))}
        </Comp>
    )
}

/**
 * Individual Toast component for single toast display.
 *
 * @example
 * ```tsx
 * <Toast
 *   toast={{
 *     id: '1',
 *     message: 'Connection established',
 *     variant: 'success',
 *     dismissible: true
 *   }}
 *   onDismiss={(id) => removeToast(id)}
 * />
 * ```
 */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Toast message data
     */
    toast: ToastMessage
    /**
     * Callback fired when toast is dismissed
     */
    onDismiss?: (id: string) => void
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Toast({
    className,
    toast,
    onDismiss,
    asChild = false,
    ...props
}: ToastProps) {
    const timerRef = React.useRef<number | undefined>(undefined)
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = React.useCallback(() => {
        setIsVisible(false)
        setTimeout(() => {
            onDismiss?.(toast.id)
        }, 150) // Allow fade out animation
    }, [onDismiss, toast.id])

    // Auto dismiss
    React.useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            timerRef.current = window.setTimeout(() => {
                handleDismiss()
            }, toast.duration)
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [toast.duration, handleDismiss])

    const Comp = asChild ? Slot : 'div'

    if (!isVisible) {
        return null
    }

    return (
        <Comp
            className={cn(
                alertVariants({ variant: toast.variant }),
                'mb-2 transition-all duration-150',
                className
            )}
            {...props}
            {...toast.toastProps}
        >
            {/* Toast Icon */}
            {toast.icon && (
                <div className="flex-shrink-0">
                    {toast.icon}
                </div>
            )}

            {/* Toast Content */}
            <div className="flex-1">
                {toast.title && (
                    <div className="font-bold">
                        {toast.title}
                    </div>
                )}
                <div className="text-sm">
                    {toast.message}
                </div>
            </div>

            {/* Action Button */}
            {toast.action && (
                <div className="flex-shrink-0">
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={toast.action.onClick}
                    >
                        {toast.action.label}
                    </button>
                </div>
            )}

            {/* Dismiss Button */}
            {toast.dismissible && (
                <div className="flex-shrink-0">
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={handleDismiss}
                        aria-label="Dismiss"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </Comp>
    )
}

/**
 * Hook for managing toast state and actions.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toasts, addToast, removeToast, clearToasts } = useToast()
 *
 *   const handleSuccess = () => {
 *     addToast({
 *       message: 'Operation completed successfully!',
 *       variant: 'success',
 *       duration: 3000
 *     })
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleSuccess}>Show Success</button>
 *       <ToastContainer toasts={toasts} />
 *     </>
 *   )
 * }
 * ```
 */
export function useToast() {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([])

    const addToast = React.useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: ToastMessage = {
            id,
            dismissible: true,
            duration: 5000,
            ...toast,
        }

        setToasts(prev => [...prev, newToast])
        return id
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const clearToasts = React.useCallback(() => {
        setToasts([])
    }, [])

    const updateToast = React.useCallback((id: string, updates: Partial<ToastMessage>) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id ? { ...toast, ...updates } : toast
        ))
    }, [])

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        updateToast,
    }
}

/**
 * Toast service for global toast management.
 */
class ToastService {
    private listeners: Array<(toasts: ToastMessage[]) => void> = []
    private toasts: ToastMessage[] = []

    subscribe(listener: (toasts: ToastMessage[]) => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener([...this.toasts]))
    }

    add(toast: Omit<ToastMessage, 'id'>) {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: ToastMessage = {
            id,
            dismissible: true,
            duration: 5000,
            ...toast,
        }

        this.toasts.push(newToast)
        this.notify()

        // Auto remove if duration is set
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                this.remove(id)
            }, newToast.duration)
        }

        return id
    }

    remove(id: string) {
        this.toasts = this.toasts.filter(toast => toast.id !== id)
        this.notify()
    }

    clear() {
        this.toasts = []
        this.notify()
    }

    success(message: React.ReactNode, options?: Partial<Omit<ToastMessage, 'id' | 'message' | 'variant'>>) {
        return this.add({
            message,
            variant: 'success',
            ...options,
        })
    }

    error(message: React.ReactNode, options?: Partial<Omit<ToastMessage, 'id' | 'message' | 'variant'>>) {
        return this.add({
            message,
            variant: 'error',
            duration: 0, // Don't auto dismiss errors by default
            ...options,
        })
    }

    warning(message: React.ReactNode, options?: Partial<Omit<ToastMessage, 'id' | 'message' | 'variant'>>) {
        return this.add({
            message,
            variant: 'warning',
            ...options,
        })
    }

    info(message: React.ReactNode, options?: Partial<Omit<ToastMessage, 'id' | 'message' | 'variant'>>) {
        return this.add({
            message,
            variant: 'info',
            ...options,
        })
    }
}

export const toast = new ToastService()

/**
 * Provider component for global toast management.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ToastProvider position="top-end">
 *       <YourApp />
 *     </ToastProvider>
 *   )
 * }
 * ```
 */
export interface ToastProviderProps extends Omit<ToastContainerProps, 'toasts'> {
    children: React.ReactNode
}

export function ToastProvider({
    children,
    position = 'top-end',
    maxToasts = 5,
    ...props
}: ToastProviderProps) {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([])

    React.useEffect(() => {
        return toast.subscribe(setToasts)
    }, [])

    const handleDismiss = (id: string) => {
        toast.remove(id)
    }

    const displayToasts = toasts.slice(0, maxToasts)

    return (
        <>
            {children}
            {displayToasts.length > 0 && (
                <div
                    className={cn(toastVariants({ position }), 'z-[9999] fixed')}
                    {...props}
                >
                    {displayToasts.map((toastMessage) => (
                        <Toast
                            key={toastMessage.id}
                            toast={toastMessage}
                            onDismiss={handleDismiss}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

/**
 * Simple toast utilities for common use cases.
 */
export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
}

export {
    ToastContainer,
    Toast,
    toastVariants,
    alertVariants
}
