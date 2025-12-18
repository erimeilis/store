import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const footerVariants = cva(
    'footer',
    {
        variants: {
            // Background variants
            background: {
                default: '',
                neutral: 'bg-neutral text-neutral-content',
                base100: 'bg-base-100',
                base200: 'bg-base-200',
                base300: 'bg-base-300',
                primary: 'bg-primary text-primary-content',
                secondary: 'bg-secondary text-secondary-content',
                accent: 'bg-accent text-accent-content',
            },
            // Layout variants
            layout: {
                default: 'p-10',
                compact: 'p-6',
                minimal: 'p-4',
            },
            // Text alignment variants
            align: {
                start: 'text-start',
                center: 'text-center',
                end: 'text-end',
            },
        },
        defaultVariants: {
            background: 'default',
            layout: 'default',
            align: 'start',
        },
    }
)

const footerTitleVariants = cva(
    'footer-title',
    {
        variants: {
            // Size variants
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
                xl: 'text-xl',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

export interface FooterSection {
    /**
     * Unique identifier for the section
     */
    id: string
    /**
     * Section title
     */
    title?: React.ReactNode
    /**
     * Section content/items
     */
    content?: React.ReactNode
    /**
     * Array of links for this section
     */
    links?: Array<{
        label: React.ReactNode
        href?: string
        onClick?: () => void
        external?: boolean
        props?: React.AnchorHTMLAttributes<HTMLAnchorElement>
    }>
    /**
     * Custom section props
     */
    sectionProps?: React.HTMLAttributes<HTMLDivElement>
}

export interface FooterProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
        VariantProps<typeof footerVariants> {
    /**
     * Footer sections
     */
    sections?: FooterSection[]
    /**
     * Footer title/branding
     */
    title?: React.ReactNode
    /**
     * Footer description/tagline
     */
    description?: React.ReactNode
    /**
     * Copyright information
     */
    copyright?: React.ReactNode
    /**
     * Social media links
     */
    socialLinks?: Array<{
        label: string
        href: string
        icon?: React.ReactNode
        external?: boolean
    }>
    /**
     * Additional content above sections
     */
    header?: React.ReactNode
    /**
     * Additional content below sections
     */
    bottom?: React.ReactNode
    /**
     * Whether to show divider above footer
     */
    showDivider?: boolean
    /**
     * Custom title props
     */
    titleProps?: React.HTMLAttributes<HTMLHeadingElement>
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Footer component for application layouts and page footers.
 *
 * Based on DaisyUI's footer component with support for multiple sections,
 * social links, copyright information, and flexible layouts.
 * Perfect for application footers, landing pages, and content pages.
 *
 * @example
 * ```tsx
 * const footerSections = [
 *   {
 *     id: 'services',
 *     title: 'Services',
 *     links: [
 *       { label: 'Mobile Plans', href: '/plans/mobile' },
 *       { label: 'Internet', href: '/plans/internet' },
 *       { label: 'Business', href: '/business' }
 *     ]
 *   },
 *   {
 *     id: 'support',
 *     title: 'Support',
 *     links: [
 *       { label: 'Help Center', href: '/help' },
 *       { label: 'Contact Us', href: '/contact' },
 *       { label: 'Community', href: '/community' }
 *     ]
 *   }
 * ]
 *
 * <Footer
 *   title="HellTelecom"
 *   description="Your trusted telecommunications provider"
 *   sections={footerSections}
 *   copyright="© 2024 HellTelecom. All rights reserved."
 *   background="neutral"
 *   showDivider
 * />
 * ```
 */
function Footer({
    className,
    background,
    layout,
    align,
    sections = [],
    title,
    description,
    copyright,
    socialLinks = [],
    header,
    bottom,
    showDivider = false,
    titleProps,
    asChild = false,
    children,
    ...props
}: FooterProps) {
    const Comp = asChild ? Slot : 'footer'

    return (
        <>
            {showDivider && (
                <div className="divider my-0"></div>
            )}
            <Comp
                className={cn(footerVariants({ background, layout, align }), className)}
                {...props}
            >
                {/* Header Content */}
                {header}

                {/* Main Footer Content */}
                {children ? (
                    children
                ) : (
                    <>
                        {/* Brand Section */}
                        {(title || description) && (
                            <nav>
                                {title && (
                                    <h6
                                        className={cn(footerTitleVariants({}), titleProps?.className)}
                                        {...titleProps}
                                    >
                                        {title}
                                    </h6>
                                )}
                                {description && (
                                    <div className="text-sm opacity-70 mt-2">
                                        {description}
                                    </div>
                                )}
                            </nav>
                        )}

                        {/* Footer Sections */}
                        {sections.map((section) => (
                            <nav key={section.id} {...section.sectionProps}>
                                {section.title && (
                                    <h6 className={cn(footerTitleVariants({}))}>
                                        {section.title}
                                    </h6>
                                )}

                                {section.content && (
                                    <div>{section.content}</div>
                                )}

                                {section.links && section.links.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {section.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.href}
                                                onClick={link.onClick}
                                                className="link link-hover"
                                                target={link.external ? '_blank' : undefined}
                                                rel={link.external ? 'noopener noreferrer' : undefined}
                                                {...link.props}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </nav>
                        ))}

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <nav>
                                <h6 className={cn(footerTitleVariants({}))}>
                                    Follow Us
                                </h6>
                                <div className="grid grid-flow-col gap-4">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            aria-label={social.label}
                                            className="link link-hover"
                                            target={social.external !== false ? '_blank' : undefined}
                                            rel={social.external !== false ? 'noopener noreferrer' : undefined}
                                        >
                                            {social.icon || social.label}
                                        </a>
                                    ))}
                                </div>
                            </nav>
                        )}
                    </>
                )}

                {/* Bottom Content */}
                {bottom}
            </Comp>

            {/* Copyright Section */}
            {copyright && (
                <footer
                    className={cn(
                        'footer footer-center border-base-300 border-t px-10 py-4',
                        background === 'neutral' && 'bg-neutral text-neutral-content border-neutral-content/10',
                        background === 'primary' && 'bg-primary text-primary-content border-primary-content/10',
                        background === 'secondary' && 'bg-secondary text-secondary-content border-secondary-content/10',
                        background === 'accent' && 'bg-accent text-accent-content border-accent-content/10',
                        background === 'base100' && 'bg-base-100',
                        background === 'base200' && 'bg-base-200',
                        background === 'base300' && 'bg-base-300'
                    )}
                >
                    <aside>
                        <p>{copyright}</p>
                    </aside>
                </footer>
            )}
        </>
    )
}

/**
 * FooterSection component for individual footer sections.
 *
 * @example
 * ```tsx
 * <FooterSection
 *   title="Company"
 *   links={[
 *     { label: 'About Us', href: '/about' },
 *     { label: 'Careers', href: '/careers' },
 *     { label: 'Press', href: '/press' }
 *   ]}
 * />
 * ```
 */
export interface FooterSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /**
     * Section title
     */
    title?: React.ReactNode
    /**
     * Section content
     */
    children?: React.ReactNode
    /**
     * Array of links
     */
    links?: FooterSection['links']
    /**
     * Title size variant
     */
    titleSize?: VariantProps<typeof footerTitleVariants>['size']
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function FooterSection({
    className,
    title,
    children,
    links = [],
    titleSize,
    asChild = false,
    ...props
}: FooterSectionProps) {
    const Comp = asChild ? Slot : 'nav'

    return (
        <Comp className={cn(className)} {...props}>
            {title && (
                <h6 className={cn(footerTitleVariants({ size: titleSize }))}>
                    {title}
                </h6>
            )}

            {children}

            {links.length > 0 && (
                <div className="flex flex-col gap-2">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            onClick={link.onClick}
                            className="link link-hover"
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            {...link.props}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}
        </Comp>
    )
}

/**
 * SimpleFooter component for basic footer layouts.
 *
 * @example
 * ```tsx
 * <SimpleFooter
 *   companyName="HellTelecom"
 *   year="2024"
 *   links={[
 *     { label: 'Privacy Policy', href: '/privacy' },
 *     { label: 'Terms of Service', href: '/terms' }
 *   ]}
 * />
 * ```
 */
export interface SimpleFooterProps extends Omit<FooterProps, 'sections' | 'copyright'> {
    /**
     * Company name for copyright
     */
    companyName: string
    /**
     * Copyright year
     */
    year?: string
    /**
     * Simple array of footer links
     */
    links?: Array<{
        label: React.ReactNode
        href: string
        external?: boolean
    }>
    /**
     * Whether to show "All rights reserved"
     */
    showRightsReserved?: boolean
}

function SimpleFooter({
    companyName,
    year = new Date().getFullYear().toString(),
    links = [],
    showRightsReserved = true,
    ...props
}: SimpleFooterProps) {
    const copyrightText = `© ${year} ${companyName}.${showRightsReserved ? ' All rights reserved.' : ''}`

    const footerSections = links.length > 0 ? [
        {
            id: 'links',
            links: links.map(link => ({
                label: link.label,
                href: link.href,
                external: link.external,
            }))
        }
    ] : []

    return (
        <Footer
            sections={footerSections}
            copyright={copyrightText}
            {...props}
        />
    )
}

/**
 * AppFooter component specifically designed for application layouts.
 *
 * @example
 * ```tsx
 * <AppFooter
 *   appName="HellTelecom"
 *   version="1.0.0"
 *   supportLinks={[
 *     { label: 'Help', href: '/help' },
 *     { label: 'Contact', href: '/contact' }
 *   ]}
 *   legalLinks={[
 *     { label: 'Privacy', href: '/privacy' },
 *     { label: 'Terms', href: '/terms' }
 *   ]}
 * />
 * ```
 */
export interface AppFooterProps extends Omit<FooterProps, 'sections'> {
    /**
     * Application name
     */
    appName: string
    /**
     * Application version
     */
    version?: string
    /**
     * Support/help links
     */
    supportLinks?: Array<{
        label: React.ReactNode
        href: string
        external?: boolean
    }>
    /**
     * Legal/policy links
     */
    legalLinks?: Array<{
        label: React.ReactNode
        href: string
        external?: boolean
    }>
    /**
     * Company links
     */
    companyLinks?: Array<{
        label: React.ReactNode
        href: string
        external?: boolean
    }>
}

function AppFooter({
    appName,
    version,
    supportLinks = [],
    legalLinks = [],
    companyLinks = [],
    ...props
}: AppFooterProps) {
    const sections: FooterSection[] = []

    if (supportLinks.length > 0) {
        sections.push({
            id: 'support',
            title: 'Support',
            links: supportLinks.map(link => ({
                label: link.label,
                href: link.href,
                external: link.external,
            }))
        })
    }

    if (companyLinks.length > 0) {
        sections.push({
            id: 'company',
            title: 'Company',
            links: companyLinks.map(link => ({
                label: link.label,
                href: link.href,
                external: link.external,
            }))
        })
    }

    if (legalLinks.length > 0) {
        sections.push({
            id: 'legal',
            title: 'Legal',
            links: legalLinks.map(link => ({
                label: link.label,
                href: link.href,
                external: link.external,
            }))
        })
    }

    const appTitle = version ? `${appName} v${version}` : appName

    return (
        <Footer
            title={appTitle}
            sections={sections}
            {...props}
        />
    )
}

export {
    Footer,
    FooterSection,
    SimpleFooter,
    AppFooter,
    footerVariants,
    footerTitleVariants
}
