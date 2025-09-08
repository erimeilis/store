import * as React from 'react'

// Hook for prefetching pages
function usePrefetch() {
    const prefetchedUrls = React.useRef(new Set<string>())

    const prefetch = React.useCallback((url: string) => {
        if (prefetchedUrls.current.has(url)) return

        // Create prefetch link element
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.as = 'document'
        
        // Add to document head
        document.head.appendChild(link)
        prefetchedUrls.current.add(url)
        
        // Clean up after some time to prevent memory leaks
        setTimeout(() => {
            if (document.head.contains(link)) {
                document.head.removeChild(link)
            }
            prefetchedUrls.current.delete(url)
        }, 60000) // Remove after 1 minute
    }, [])

    return { prefetch }
}

export interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
    prefetch?: boolean
    prefetchOn?: 'hover' | 'visible' | 'immediate'
}

/**
 * Enhanced Link Component with Prefetching
 * 
 * Automatically prefetches linked pages to eliminate navigation delays and theme flashing.
 */
export function PrefetchLink({ 
    href, 
    children, 
    className,
    prefetch = true,
    prefetchOn = 'hover',
    ...props 
}: PrefetchLinkProps) {
    const { prefetch: prefetchUrl } = usePrefetch()
    const linkRef = React.useRef<HTMLAnchorElement>(null)

    // Immediate prefetch
    React.useEffect(() => {
        if (prefetch && prefetchOn === 'immediate') {
            prefetchUrl(href)
        }
    }, [href, prefetch, prefetchOn, prefetchUrl])

    // Visible prefetch using Intersection Observer
    React.useEffect(() => {
        if (!prefetch || prefetchOn !== 'visible' || !linkRef.current) return

        // eslint-disable-next-line no-undef
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        prefetchUrl(href)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { rootMargin: '100px' } // Start prefetch when element is 100px from viewport
        )

        observer.observe(linkRef.current)

        return () => observer.disconnect()
    }, [href, prefetch, prefetchOn, prefetchUrl])

    const handleMouseEnter = React.useCallback(() => {
        if (prefetch && prefetchOn === 'hover') {
            prefetchUrl(href)
        }
    }, [href, prefetch, prefetchOn, prefetchUrl])

    return (
        <a 
            ref={linkRef}
            href={href} 
            onMouseEnter={handleMouseEnter}
            className={className}
            {...props}
        >
            {children}
        </a>
    )
}

export { usePrefetch }