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
    const [showInput, setShowInput] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const {currentPage, lastPage, links, prevPageUrl, nextPageUrl} = items

    // Reset input value when currentPage changes (after navigation)
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = currentPage.toString()
        }
    }, [currentPage])

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
        if (page && page >= 1 && page <= lastPage && page !== currentPage) {
            const url = new URL(window.location.href)
            url.searchParams.set('page', page.toString())
            window.location.href = url.toString()
        }
        setShowInput(false)
    }, [currentPage, lastPage])

    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputRef.current) {
            submitPageInput(inputRef.current.value)
        }
    }

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Clear existing debounce timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Only set debounce if there's a valid complete page number
        const pageNum = parseInt(value)
        if (pageNum && pageNum >= 1 && pageNum <= lastPage && pageNum !== currentPage) {
            // Set new debounce timeout for mobile users (1.5 seconds after stop typing)
            debounceRef.current = setTimeout(() => {
                submitPageInput(value)
            }, 1500)
        }
    }

    const handlePageInputBlur = (originalOnBlur?: () => void) => {
        // Clear debounce timeout since we're submitting immediately
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        if (inputRef.current) {
            const trimmedInput = inputRef.current.value.trim()
            if (trimmedInput && trimmedInput !== currentPage.toString()) {
                submitPageInput(trimmedInput)
            } else if (!trimmedInput) {
                // If input is empty on blur, reset it to current page
                inputRef.current.value = currentPage.toString()
            }
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

        if (lastPage <= maxVisiblePages) {
            // Show all pages if total pages fit within maxVisiblePages
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            let start = Math.max(2, currentPage - halfVisible)
            let end = Math.min(lastPage - 1, currentPage + halfVisible)

            // Adjust start and end to maintain maxVisiblePages count
            if (currentPage <= halfVisible + 1) {
                end = maxVisiblePages - 1
            } else if (currentPage >= lastPage - halfVisible) {
                start = lastPage - maxVisiblePages + 2
            }

            // Add ellipsis before middle pages if needed
            if (start > 2) {
                pages.push('ellipsis-start')
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                if (i > 1 && i < lastPage) {
                    pages.push(i)
                }
            }

            // Add ellipsis after middle pages if needed
            if (end < lastPage - 1) {
                pages.push('ellipsis-end')
            }

            // Always show last page
            if (lastPage > 1) {
                pages.push(lastPage)
            }
        }

        return pages
    }

    const visiblePages = getVisiblePages()

    // Reusable page input component (uncontrolled)
    const PageInputComponent = ({className = '', onBlur, autoFocus = false}: {
        className?: string
        onBlur?: () => void
        autoFocus?: boolean
    }) => (
        <form onSubmit={handlePageInputSubmit} className={className}>
            <Input
                ref={inputRef}
                type="number"
                min="1"
                max={lastPage}
                defaultValue={currentPage.toString()}
                onChange={handlePageInputChange}
                onBlur={() => handlePageInputBlur(onBlur)}
                className="w-16 h-8 text-center"
                placeholder={currentPage.toString()}
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
                {/* Page input - only show if there's more than one page */}
                {lastPage > 1 && (
                    <div className={`flex items-center gap-2 ml-4 ${showPageInput ? '' : 'md:hidden'}`}>
                        <span className="text-sm text-base-content/70">Go to:</span>
                        <PageInputComponent/>
                    </div>
                )}
            </div>
            {/* Only show pagination controls if there's more than one page */}
            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="join">
                    {showPrevNext && prevPageUrl && (
                        <Button
                            key="prev-button"
                            size={size}
                            className="join-item"
                            onClick={() => handlePageClick(prevPageUrl)}
                            aria-label="Previous page"
                        >
                            <IconChevronLeft size={16}/>
                        </Button>
                    )}

                    {/* Mobile: Compact pagination */}
                    <div key="mobile-pagination" className="flex md:hidden">
                        {/* Show active_page-1 if it exists and is > 1 */}
                        {currentPage > 1 && (
                            <Button
                                key={currentPage - 1}
                                size={size}
                                className="join-item"
                                onClick={() => {
                                    const prevPageLink = links?.find(link => {
                                        const linkLabel = link.label.replace(/&.*?;/g, '')
                                        return parseInt(linkLabel) === currentPage - 1
                                    })
                                    if (prevPageLink?.url) {
                                        handlePageClick(prevPageLink.url)
                                    }
                                }}
                            >
                                {currentPage - 1}
                            </Button>
                        )}

                        {/* Current active page */}
                        <Button
                            key={currentPage}
                            size={size}
                            behaviour="active"
                            className="join-item"
                        >
                            {currentPage}
                        </Button>

                        {/* Ellipsis - show if there's a gap between current area and last area */}
                        {!showInput && lastPage > 1 && lastPage > currentPage + 1 && (
                            <EllipsisButton/>
                        )}

                        {/* Show lastPage-1 if it exists and is different from currentPage and currentPage-1 */}
                        {lastPage > 1 && lastPage - 1 > currentPage && lastPage - 1 !== currentPage - 1 && (
                            <Button
                                key={lastPage - 1}
                                size={size}
                                className="join-item"
                                onClick={() => {
                                    const secondLastPageLink = links?.find(link => {
                                        const linkLabel = link.label.replace(/&.*?;/g, '')
                                        return parseInt(linkLabel) === lastPage - 1
                                    })
                                    if (secondLastPageLink?.url) {
                                        handlePageClick(secondLastPageLink.url)
                                    }
                                }}
                            >
                                {lastPage - 1}
                            </Button>
                        )}

                        {/* Last page - only show if it's different from currentPage */}
                        {lastPage > 1 && lastPage !== currentPage && (
                            <Button
                                size={size}
                                className="join-item"
                                onClick={() => handlePageClick(items.lastPageUrl || '')}
                            >
                                {lastPage}
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
                            const isActive = pageNumber === currentPage

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

                    {showPrevNext && nextPageUrl && (
                        <Button
                            key="next-button"
                            size={size}
                            className="join-item"
                            onClick={() => handlePageClick(nextPageUrl)}
                            aria-label="Next page"
                        >
                            <IconChevronRight size={16}/>
                        </Button>
                    )}
                </div>
            </div>
            )}
        </div>
    )
}
