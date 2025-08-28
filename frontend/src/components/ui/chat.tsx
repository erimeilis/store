import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const chatVariants = cva(
    'chat',
    {
        variants: {
            // Position variants
            position: {
                start: 'chat-start',
                end: 'chat-end',
            },
        },
        defaultVariants: {
            position: 'start',
        },
    }
)

const chatBubbleVariants = cva(
    'chat-bubble',
    {
        variants: {
            // Color variants
            color: {
                default: '',
                primary: 'chat-bubble-primary',
                secondary: 'chat-bubble-secondary',
                accent: 'chat-bubble-accent',
                info: 'chat-bubble-info',
                success: 'chat-bubble-success',
                warning: 'chat-bubble-warning',
                error: 'chat-bubble-error',
            },
        },
        defaultVariants: {
            color: 'default',
        },
    }
)

export interface ChatMessage {
    /**
     * Unique identifier for the message
     */
    id: string
    /**
     * Message content
     */
    content: React.ReactNode
    /**
     * Message sender information
     */
    sender?: {
        name: string
        avatar?: string
        avatarAlt?: string
    }
    /**
     * Message timestamp
     */
    timestamp?: React.ReactNode
    /**
     * Message position (start = left, end = right)
     */
    position?: 'start' | 'end'
    /**
     * Bubble color theme
     */
    color?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
    /**
     * Additional footer content
     */
    footer?: React.ReactNode
}

export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Array of chat messages
     */
    messages: ChatMessage[]
    /**
     * Whether to show avatars
     * @default true
     */
    showAvatars?: boolean
    /**
     * Whether to show timestamps
     * @default true
     */
    showTimestamps?: boolean
    /**
     * Whether to show sender names
     * @default true
     */
    showNames?: boolean
    /**
     * Default avatar for messages without custom avatars
     */
    defaultAvatar?: string
    /**
     * Custom message props
     */
    messageProps?: React.HTMLAttributes<HTMLDivElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Chat component for displaying conversation messages.
 *
 * Based on DaisyUI's chat component with support for different bubble colors,
 * positions (start/end), avatars, timestamps, and sender information.
 * Perfect for messaging interfaces, customer support, and chat applications.
 *
 * @example
 * ```tsx
 * const messages = [
 *   {
 *     id: '1',
 *     content: 'Hello! How can I help you today?',
 *     sender: { name: 'Support', avatar: '/support-avatar.jpg' },
 *     position: 'start',
 *     color: 'primary',
 *     timestamp: '10:30 AM'
 *   },
 *   {
 *     id: '2',
 *     content: 'I need help with my account',
 *     sender: { name: 'You' },
 *     position: 'end',
 *     timestamp: '10:31 AM'
 *   }
 * ]
 *
 * <Chat
 *   messages={messages}
 *   showAvatars
 *   showTimestamps
 *   showNames
 * />
 * ```
 */
function Chat({
    className,
    messages,
    showAvatars = true,
    showTimestamps = true,
    showNames = true,
    defaultAvatar,
    messageProps,
    asChild = false,
    ...props
}: ChatProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn('space-y-4', className)}
            {...props}
        >
            {messages.map((message) => (
                <ChatMessage
                    key={message.id}
                    message={message}
                    showAvatar={showAvatars}
                    showTimestamp={showTimestamps}
                    showName={showNames}
                    defaultAvatar={defaultAvatar}
                    {...messageProps}
                />
            ))}
        </Comp>
    )
}

/**
 * Individual ChatMessage component for single message display.
 *
 * @example
 * ```tsx
 * <ChatMessage
 *   message={{
 *     id: '1',
 *     content: 'Hello world!',
 *     sender: { name: 'John', avatar: '/john.jpg' },
 *     position: 'start',
 *     timestamp: '10:30 AM'
 *   }}
 *   showAvatar
 *   showTimestamp
 * />
 * ```
 */
export interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Message data
     */
    message: ChatMessage
    /**
     * Whether to show avatar
     */
    showAvatar?: boolean
    /**
     * Whether to show timestamp
     */
    showTimestamp?: boolean
    /**
     * Whether to show sender name
     */
    showName?: boolean
    /**
     * Default avatar URL
     */
    defaultAvatar?: string
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function ChatMessage({
    className,
    message,
    showAvatar = true,
    showTimestamp = true,
    showName = true,
    defaultAvatar,
    asChild = false,
    ...props
}: ChatMessageProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(
                chatVariants({ position: message.position }),
                className
            )}
            {...props}
        >
            {/* Chat Image/Avatar */}
            {showAvatar && (
                <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                        {message.sender?.avatar || defaultAvatar ? (
                            <img
                                src={message.sender?.avatar || defaultAvatar}
                                alt={message.sender?.avatarAlt || message.sender?.name || 'Avatar'}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-sm font-medium">
                                {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Header (Name + Timestamp) */}
            {(showName && message.sender?.name) || (showTimestamp && message.timestamp) ? (
                <div className="chat-header">
                    {showName && message.sender?.name && (
                        <span className="text-sm opacity-50 mr-2">
                            {message.sender.name}
                        </span>
                    )}
                    {showTimestamp && message.timestamp && (
                        <time className="text-xs opacity-50">
                            {message.timestamp}
                        </time>
                    )}
                </div>
            ) : null}

            {/* Chat Bubble */}
            <div
                className={cn(
                    chatBubbleVariants({ color: message.color })
                )}
            >
                {message.content}
            </div>

            {/* Chat Footer */}
            {message.footer && (
                <div className="chat-footer opacity-50 text-xs">
                    {message.footer}
                </div>
            )}
        </Comp>
    )
}

/**
 * SimpleChatBubble component for standalone chat bubble usage.
 *
 * @example
 * ```tsx
 * <div className="chat chat-start">
 *   <SimpleChatBubble color="primary">
 *     Hello! How can I help you?
 *   </SimpleChatBubble>
 * </div>
 * ```
 */
export interface SimpleChatBubbleProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
        VariantProps<typeof chatBubbleVariants> {
    /**
     * Bubble content
     */
    children: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function SimpleChatBubble({
    className,
    color,
    children,
    asChild = false,
    ...props
}: SimpleChatBubbleProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(chatBubbleVariants({ color }), className)}
            {...props}
        >
            {children}
        </Comp>
    )
}

export { Chat, ChatMessage, SimpleChatBubble, chatVariants, chatBubbleVariants }
