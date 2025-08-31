import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {IModel, IPaginatedResponse} from '@/types/models'
import {IconChevronLeft, IconChevronRight} from '@tabler/icons-react'

export interface PaginationProps<T extends IModel> {
    items: IPaginatedResponse<T>
    showPrevNext?: boolean
    showPageInput?: boolean
    maxVisiblePages?: number
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function Pagination<T extends IModel>({
                                                 items,
                                                 showPrevNext = true,
                                                 showPageInput = true,
                                                 maxVisiblePages = 7,
                                                 size = 'sm',
                                                 className,
                                             }: PaginationProps<T>) {
    const [pageInput, setPageInput] = useState('')
    const [showInput, setShowInput] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const {current_page, last_page, links, prev_page_url, next_page_url} = items

    useEffect(() => {
        setPageInput(current_page.toString())
    }, [current_page])

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [])

    const submitPageInput = useCallback((inputValue: string) => {
        const page = parseInt(inputValue)
        if (page && page >= 1 && page <= last_page && page !== current_page) {
            const url = new URL(window.location.href)
            url.searchParams.set('page', page.toString())
            window.location.href = url.toString()
        }
        setShowInput(false)
    }, [current_page, last_page])

    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitPageInput(pageInput)
    }

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPageInput(value)

        // Clear existing debounce timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Set new debounce timeout for mobile users (1.5 seconds after stop typing)
        debounceRef.current = setTimeout(() => {
            if (value && value !== current_page.toString()) {
                submitPageInput(value)
            }
        }, 1500)
    }

    const handlePageInputBlur = (originalOnBlur?: () => void) => {
        // Clear debounce timeout since we're submitting immediately
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Submit the form if the value has changed
        if (pageInput && pageInput !== current_page.toString()) {
            submitPageInput(pageInput)
        }

        // Call original onBlur handler if provided
        if (originalOnBlur) {
            originalOnBlur()
        }
    }

    const handlePageClick = (url: string) => {
        window.location.href = url
    }

    // Generate visible page numbers with ellipsis logic
    const getVisiblePages = () => {
        const pages = []
        const halfVisible = Math.floor(maxVisiblePages / 2)

        if (last_page <= maxVisiblePages) {
            // Show all pages if total pages fit within maxVisiblePages
            for (let i = 1; i <= last_page; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            let start = Math.max(2, current_page - halfVisible)
            let end = Math.min(last_page - 1, current_page + halfVisible)

            // Adjust start and end to maintain maxVisiblePages count
            if (current_page <= halfVisible + 1) {
                end = maxVisiblePages - 1
            } else if (current_page >= last_page - halfVisible) {
                start = last_page - maxVisiblePages + 2
            }

            // Add ellipsis before middle pages if needed
            if (start > 2) {
                pages.push('ellipsis-start')
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                if (i > 1 && i < last_page) {
                    pages.push(i)
                }
            }

            // Add ellipsis after middle pages if needed
            if (end < last_page - 1) {
                pages.push('ellipsis-end')
            }

            // Always show last page
            if (last_page > 1) {
                pages.push(last_page)
            }
        }

        return pages
    }

    const visiblePages = getVisiblePages()

    // Don't render if only one page
    if (last_page <= 1) {
        return null
    }

    // Reusable page input component
    const PageInputComponent = ({className = '', onBlur, autoFocus = false}: {
        className?: string
        onBlur?: () => void
        autoFocus?: boolean
    }) => (
        <form onSubmit={handlePageInputSubmit} className={className}>
            <Input
                type="number"
                min="1"
                max={last_page}
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={() => handlePageInputBlur(onBlur)}
                className="w-16 h-8 text-center"
                placeholder={current_page.toString()}
                autoFocus={autoFocus}
            />
        </form>
    )


    const EllipsisButton = () => (
        <Button
            size={size}
            behaviour="disabled"
            className="join-item"
        >
            ...
        </Button>
    )

    return (
        <div className={`mt-4 flex flex-col sm:flex-row items-center justify-between ${className}`}>
            <div className="flex flex-row items-center text-muted-foreground text-sm">
                <div>Showing {items.from} to {items.to} of {items.total} entries</div>
                {/* Page input - always show on mobile, conditional on desktop */}
                <div className={`flex items-center gap-2 ml-4 ${showPageInput ? '' : 'md:hidden'}`}>
                    <span className="text-sm text-base-content/70">Go to:</span>
                    <PageInputComponent/>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="join">
                    {showPrevNext && prev_page_url && (
                        <Button
                            key="prev-button"
                            size={size}
                            className="join-item"
                            onClick={() => handlePageClick(prev_page_url)}
                            aria-label="Previous page"
                        >
                            <IconChevronLeft size={16}/>
                        </Button>
                    )}

                    {/* Mobile: Compact pagination */}
                    <div key="mobile-pagination" className="flex md:hidden">
                        {/* Show active_page-1 if it exists and is > 1 */}
                        {current_page > 1 && (
                            <Button
                                key={current_page - 1}
                                size={size}
                                className="join-item"
                                onClick={() => {
                                    const prevPageLink = links?.find(link => {
                                        const linkLabel = link.label.replace(/&.*?;/g, '')
                                        return parseInt(linkLabel) === current_page - 1
                                    })
                                    if (prevPageLink?.url) {
                                        handlePageClick(prevPageLink.url)
                                    }
                                }}
                            >
                                {current_page - 1}
                            </Button>
                        )}

                        {/* Current active page */}
                        <Button
                            key={current_page}
                            size={size}
                            behaviour="active"
                            className="join-item"
                        >
                            {current_page}
                        </Button>

                        {/* Ellipsis - show if there's a gap between current area and last area */}
                        {!showInput && last_page > 1 && last_page > current_page + 1 && (
                            <EllipsisButton/>
                        )}

                        {/* Show last_page-1 if it exists and is different from current_page and current_page-1 */}
                        {last_page > 1 && last_page - 1 > current_page && last_page - 1 !== current_page - 1 && (
                            <Button
                                key={last_page - 1}
                                size={size}
                                className="join-item"
                                onClick={() => {
                                    const secondLastPageLink = links?.find(link => {
                                        const linkLabel = link.label.replace(/&.*?;/g, '')
                                        return parseInt(linkLabel) === last_page - 1
                                    })
                                    if (secondLastPageLink?.url) {
                                        handlePageClick(secondLastPageLink.url)
                                    }
                                }}
                            >
                                {last_page - 1}
                            </Button>
                        )}

                        {/* Last page - only show if it's different from current_page */}
                        {last_page > 1 && last_page !== current_page && (
                            <Button
                                size={size}
                                className="join-item"
                                onClick={() => handlePageClick(items.last_page_url)}
                            >
                                {last_page}
                            </Button>
                        )}
                    </div>

                    {/* Desktop: Full pagination */}
                    <div key="desktop-pagination" className="hidden md:flex">
                        {visiblePages.map((page, index) => {
                            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                                return <EllipsisButton key={`ellipsis-${index}`}/>
                            }

                            const pageNumber = page as number
                            const isActive = pageNumber === current_page

                            // Find the corresponding link for this page
                            const pageLink = links?.find(link => {
                                const linkLabel = link.label.replace(/&.*?;/g, '') // Remove HTML entities
                                return parseInt(linkLabel) === pageNumber
                            })

                            return (
                                <Button
                                    key={pageNumber}
                                    size={size}
                                    behaviour={isActive ? 'active' : 'default'}
                                    className="join-item"
                                    onClick={() => pageLink?.url && handlePageClick(pageLink.url)}
                                    disabled={!pageLink?.url}
                                >
                                    {pageNumber}
                                </Button>
                            )
                        })}
                    </div>

                    {showPrevNext && next_page_url && (
                        <Button
                            key="next-button"
                            size={size}
                            className="join-item"
                            onClick={() => handlePageClick(next_page_url)}
                            aria-label="Next page"
                        >
                            <IconChevronRight size={16}/>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
