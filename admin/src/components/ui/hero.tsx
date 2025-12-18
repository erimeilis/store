import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const heroVariants = cva(
    'hero',
    {
        variants: {
            // Size variants
            size: {
                sm: 'min-h-96',
                md: 'min-h-screen',
                lg: 'min-h-screen',
                full: 'h-screen',
            },
            // Background variants
            background: {
                none: '',
                overlay: 'hero-overlay',
            },
        },
        defaultVariants: {
            size: 'md',
            background: 'none',
        },
    }
)

const heroContentVariants = cva(
    'hero-content',
    {
        variants: {
            // Layout variants
            layout: {
                center: 'text-center',
                left: 'text-left',
                right: 'text-right',
            },
            // Direction variants
            direction: {
                column: 'flex-col',
                row: 'flex-row',
                'row-reverse': 'flex-row-reverse',
            },
            // Alignment variants
            align: {
                center: 'items-center',
                start: 'items-start',
                end: 'items-end',
            },
            // Justify variants
            justify: {
                center: 'justify-center',
                start: 'justify-start',
                end: 'justify-end',
                between: 'justify-between',
            },
        },
        defaultVariants: {
            layout: 'center',
            direction: 'column',
            align: 'center',
            justify: 'center',
        },
    }
)

export interface HeroProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof heroVariants> {
    /**
     * Hero content
     */
    children: React.ReactNode
    /**
     * Background image URL
     */
    backgroundImage?: string
    /**
     * Background video URL
     */
    backgroundVideo?: string
    /**
     * Background overlay color/class
     */
    overlayColor?: string
    /**
     * Custom content layout props
     */
    contentProps?: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof heroContentVariants>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Hero component for creating impactful landing sections and banners.
 *
 * Based on DaisyUI's hero component with support for different sizes,
 * background images/videos, overlays, and flexible content layouts.
 * Perfect for landing pages, promotional sections, and call-to-action areas.
 *
 * @example
 * ```tsx
 * <Hero
 *   size="full"
 *   backgroundImage="/hero-bg.jpg"
 *   background="overlay"
 *   overlayColor="bg-opacity-60"
 * >
 *   <div className="max-w-md">
 *     <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
 *     <p className="mb-5">Provident cupiditate voluptatem et in...</p>
 *     <Button color="primary">Get Started</Button>
 *   </div>
 * </Hero>
 * ```
 */
function Hero({
    className,
    size,
    background,
    children,
    backgroundImage,
    backgroundVideo,
    overlayColor,
    contentProps,
    asChild = false,
    style,
    ...props
}: HeroProps) {
    const Comp = asChild ? Slot : 'div'

    const heroStyle = {
        ...style,
        ...(backgroundImage && {
            backgroundImage: `url(${backgroundImage})`,
        }),
    }

    return (
        <Comp
            className={cn(heroVariants({ size, background }), className)}
            style={heroStyle}
            {...props}
        >
            {/* Background Video */}
            {backgroundVideo && (
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
            )}

            {/* Overlay */}
            {background === 'overlay' && (
                <div className={cn('hero-overlay', overlayColor)} />
            )}

            {/* Content */}
            <div
                className={cn(
                    heroContentVariants({
                        layout: contentProps?.layout,
                        direction: contentProps?.direction,
                        align: contentProps?.align,
                        justify: contentProps?.justify,
                    }),
                    contentProps?.className
                )}
                {...contentProps}
            >
                {children}
            </div>
        </Comp>
    )
}

/**
 * HeroTitle component for hero section titles.
 *
 * @example
 * ```tsx
 * <HeroTitle size="xl" className="text-white">
 *   Welcome to HellTelecom
 * </HeroTitle>
 * ```
 */
export interface HeroTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /**
     * Title size
     */
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    /**
     * HTML heading level
     * @default 1
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function HeroTitle({
    className,
    size = 'xl',
    level = 1,
    children,
    asChild = false,
    ...props
}: HeroTitleProps) {
    const sizeClasses = {
        sm: 'text-2xl md:text-3xl',
        md: 'text-3xl md:text-4xl',
        lg: 'text-4xl md:text-5xl',
        xl: 'text-5xl md:text-6xl',
        '2xl': 'text-6xl md:text-7xl',
    }

    const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements
    const Comp = asChild ? Slot : HeadingTag

    return React.createElement(
        Comp,
        {
            className: cn(
                'font-bold leading-tight',
                sizeClasses[size],
                className
            ),
            ...props
        },
        children
    )
}

/**
 * HeroSubtitle component for hero section descriptions.
 *
 * @example
 * ```tsx
 * <HeroSubtitle className="text-white/80">
 *   Experience the future of telecommunications
 * </HeroSubtitle>
 * ```
 */
export interface HeroSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
    /**
     * Subtitle size
     */
    size?: 'sm' | 'md' | 'lg'
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function HeroSubtitle({
    className,
    size = 'md',
    children,
    asChild = false,
    ...props
}: HeroSubtitleProps) {
    const sizeClasses = {
        sm: 'text-sm md:text-base',
        md: 'text-base md:text-lg',
        lg: 'text-lg md:text-xl',
    }

    const Comp = asChild ? Slot : 'p'

    return (
        <Comp
            className={cn(
                'leading-relaxed opacity-90',
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * HeroActions component for hero section action buttons.
 *
 * @example
 * ```tsx
 * <HeroActions>
 *   <Button color="primary" size="lg">Get Started</Button>
 *   <Button style="outline" size="lg">Learn More</Button>
 * </HeroActions>
 * ```
 */
export interface HeroActionsProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Layout direction
     */
    direction?: 'row' | 'column'
    /**
     * Gap between actions
     */
    gap?: 'sm' | 'md' | 'lg'
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function HeroActions({
    className,
    direction = 'row',
    gap = 'md',
    children,
    asChild = false,
    ...props
}: HeroActionsProps) {
    const directionClasses = {
        row: 'flex-row',
        column: 'flex-col',
    }

    const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
    }

    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(
                'flex items-center justify-center',
                directionClasses[direction],
                gapClasses[gap],
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * SimpleHero component with pre-built layout for common hero patterns.
 *
 * @example
 * ```tsx
 * <SimpleHero
 *   title="Welcome to HellTelecom"
 *   subtitle="Experience the future of telecommunications"
 *   backgroundImage="/hero-bg.jpg"
 *   actions={
 *     <>
 *       <Button color="primary" size="lg">Get Started</Button>
 *       <Button style="outline" size="lg">Learn More</Button>
 *     </>
 *   }
 * />
 * ```
 */
export interface SimpleHeroProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
        VariantProps<typeof heroVariants> {
    /**
     * Hero title
     */
    title: React.ReactNode
    /**
     * Hero subtitle/description
     */
    subtitle?: React.ReactNode
    /**
     * Action buttons or elements
     */
    actions?: React.ReactNode
    /**
     * Additional content above title
     */
    preTitle?: React.ReactNode
    /**
     * Additional content below actions
     */
    postActions?: React.ReactNode
    /**
     * Background image URL
     */
    backgroundImage?: string
    /**
     * Background video URL
     */
    backgroundVideo?: string
    /**
     * Background overlay color/class
     */
    overlayColor?: string
    /**
     * Custom content layout props
     */
    contentProps?: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof heroContentVariants>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
    /**
     * Title component props
     */
    titleProps?: Omit<HeroTitleProps, 'children'>
    /**
     * Subtitle component props
     */
    subtitleProps?: Omit<HeroSubtitleProps, 'children'>
    /**
     * Actions container props
     */
    actionsProps?: Omit<HeroActionsProps, 'children'>
}

function SimpleHero({
    title,
    subtitle,
    actions,
    preTitle,
    postActions,
    titleProps,
    subtitleProps,
    actionsProps,
    ...heroProps
}: SimpleHeroProps) {
    return (
        <Hero {...heroProps}>
            <div className="max-w-md space-y-6">
                {preTitle && <div>{preTitle}</div>}

                <HeroTitle {...titleProps}>
                    {title}
                </HeroTitle>

                {subtitle && (
                    <HeroSubtitle {...subtitleProps}>
                        {subtitle}
                    </HeroSubtitle>
                )}

                {actions && (
                    <HeroActions {...actionsProps}>
                        {actions}
                    </HeroActions>
                )}

                {postActions && <div>{postActions}</div>}
            </div>
        </Hero>
    )
}

export {
    Hero,
    HeroTitle,
    HeroSubtitle,
    HeroActions,
    SimpleHero,
    heroVariants,
    heroContentVariants
}
