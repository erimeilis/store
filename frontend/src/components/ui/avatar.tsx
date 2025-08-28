import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const avatarVariants = cva(
    'avatar',
    {
        variants: {
            // Placeholder variant
            placeholder: {
                false: '',
                true: 'avatar-placeholder',
            },
            // Online indicator variant
            online: {
                false: '',
                true: 'avatar-online',
            },
            // Offline indicator variant
            offline: {
                false: '',
                true: 'avatar-offline',
            },
        },
        defaultVariants: {
            placeholder: false,
            online: false,
            offline: false,
        },
    }
)

const avatarInnerVariants = cva(
    '',
    {
        variants: {
            // Size variants using Tailwind width classes
            size: {
                xs: 'w-6',
                sm: 'w-8',
                md: 'w-12',
                lg: 'w-16',
                xl: 'w-20',
                '2xl': 'w-24',
                '3xl': 'w-32',
            },
            // Shape variants
            shape: {
                rounded: 'rounded',
                'rounded-lg': 'rounded-lg',
                'rounded-xl': 'rounded-xl',
                'rounded-full': 'rounded-full',
            },
        },
        defaultVariants: {
            size: 'md',
            shape: 'rounded',
        },
    }
)

const avatarGroupVariants = cva(
    'avatar-group',
    {
        variants: {
            // Spacing variants
            spacing: {
                default: '-space-x-6',
                tight: '-space-x-4',
                loose: '-space-x-8',
            },
        },
        defaultVariants: {
            spacing: 'default',
        },
    }
)

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
    src?: string
    alt?: string
    size?: VariantProps<typeof avatarInnerVariants>['size']
    shape?: VariantProps<typeof avatarInnerVariants>['shape']
    fallback?: React.ReactNode
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
    children: React.ReactNode
}

/**
 * DaisyUI Avatar Component
 *
 * A flexible avatar component that can display images, placeholders, and status indicators.
 * Supports different sizes, shapes, and online/offline status indicators.
 */
function Avatar({
    className,
    placeholder,
    online,
    offline,
    src,
    alt,
    size = 'md',
    shape = 'rounded',
    fallback,
    children,
    ...props
}: AvatarProps) {
    const renderContent = () => {
        if (children) {
            return children
        }

        if (src) {
            return <img src={src} alt={alt} />
        }

        if (fallback) {
            return <span>{fallback}</span>
        }

        return null
    }

    return (
        <div
            className={cn(avatarVariants({placeholder, online, offline}), className)}
            {...props}
        >
            <div className={cn(avatarInnerVariants({size, shape}))}>
                {renderContent()}
            </div>
        </div>
    )
}

/**
 * DaisyUI Avatar Group Component
 *
 * Groups multiple avatars together with overlapping spacing.
 * Useful for showing teams, participants, or multiple users.
 */
function AvatarGroup({
    className,
    spacing,
    children,
    ...props
}: AvatarGroupProps) {
    return (
        <div
            className={cn(avatarGroupVariants({spacing}), className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Avatar Placeholder Component
 *
 * A placeholder avatar for displaying initials, icons, or other fallback content.
 */
function AvatarPlaceholder({
    className,
    size = 'md',
    shape = 'rounded',
    children,
    ...props
}: Omit<AvatarProps, 'placeholder'>) {
    return (
        <Avatar
            placeholder={true}
            size={size}
            shape={shape}
            className={cn('bg-neutral text-neutral-content', className)}
            {...props}
        >
            {children}
        </Avatar>
    )
}

/**
 * AvatarImage component for displaying avatar images.
 */
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    /**
     * Image source URL
     */
    src: string
    /**
     * Alternative text for the image
     */
    alt?: string
}

function AvatarImage({
    className,
    src,
    alt,
    ...props
}: AvatarImageProps) {
    return (
        <img
            className={cn(className)}
            src={src}
            alt={alt}
            {...props}
        />
    )
}

// Add compound component properties
const AvatarWithCompoundComponents = Avatar as typeof Avatar & {
  Image: typeof AvatarImage
  Group: typeof AvatarGroup
  Placeholder: typeof AvatarPlaceholder
}

AvatarWithCompoundComponents.Image = AvatarImage
AvatarWithCompoundComponents.Group = AvatarGroup
AvatarWithCompoundComponents.Placeholder = AvatarPlaceholder

export {
    AvatarWithCompoundComponents as Avatar,
    AvatarImage,
    AvatarGroup,
    AvatarPlaceholder,
    avatarVariants,
    avatarGroupVariants
}
