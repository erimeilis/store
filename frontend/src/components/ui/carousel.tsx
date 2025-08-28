import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const carouselVariants = cva(
    'carousel',
    {
        variants: {
            // Snap behavior variants
            snap: {
                start: '',
                center: 'carousel-center',
                end: 'carousel-end',
            },
            // Direction variants
            direction: {
                horizontal: '',
                vertical: 'carousel-vertical',
            },
        },
        defaultVariants: {
            snap: 'start',
            direction: 'horizontal',
        },
    }
)

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof carouselVariants> {
    children: React.ReactNode
    showNavigation?: boolean
    showIndicators?: boolean
    onSlideChange?: (index: number) => void
}

export interface CarouselWithNavigationProps extends Omit<CarouselProps, 'children'> {
    slides: Array<{
        id: string
        content: React.ReactNode
    }>
}

/**
 * DaisyUI Carousel Item Component
 *
 * Individual carousel item that holds content within the carousel.
 * Can be sized using Tailwind width/height classes.
 */
function CarouselItem({
    className,
    children,
    ...props
}: CarouselItemProps) {
    return (
        <div
            className={cn('carousel-item', className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * DaisyUI Carousel Component
 *
 * A flexible carousel component that supports horizontal/vertical scrolling,
 * different snap behaviors, and custom content. Follows DaisyUI's structure exactly.
 */
function Carousel({
    className,
    snap,
    direction,
    children,
    ...props
}: CarouselProps) {
    return (
        <div
            className={cn(carouselVariants({snap, direction}), className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * DaisyUI Carousel with Navigation Component
 *
 * Enhanced carousel with built-in navigation buttons and indicators.
 * Uses anchor links for navigation as per DaisyUI examples.
 */
function CarouselWithNavigation({
    className,
    snap,
    direction,
    slides,
    showNavigation = true,
    showIndicators = false,
    onSlideChange,
    ...props
}: CarouselWithNavigationProps) {
    const handleSlideChange = (index: number) => {
        onSlideChange?.(index)
    }

    const renderNavigationButton = (targetSlide: string, direction: 'prev' | 'next', currentIndex: number) => {
        const targetIndex = direction === 'next'
            ? (currentIndex + 1) % slides.length
            : currentIndex === 0 ? slides.length - 1 : currentIndex - 1

        return (
            <a
                href={`#${targetSlide}`}
                className="btn btn-circle"
                onClick={() => handleSlideChange(targetIndex)}
                aria-label={`Go to ${direction === 'next' ? 'next' : 'previous'} slide`}
            >
                {direction === 'next' ? '❯' : '❮'}
            </a>
        )
    }

    return (
        <>
            <div
                className={cn(carouselVariants({snap, direction}), 'w-full', className)}
                {...props}
            >
                {slides.map((slide, index) => {
                    const prevSlide = index === 0 ? slides[slides.length - 1] : slides[index - 1]
                    const nextSlide = index === slides.length - 1 ? slides[0] : slides[index + 1]

                    return (
                        <div
                            key={slide.id}
                            id={slide.id}
                            className="carousel-item relative w-full"
                        >
                            {slide.content}

                            {showNavigation && (
                                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                                    {renderNavigationButton(prevSlide.id, 'prev', index)}
                                    {renderNavigationButton(nextSlide.id, 'next', index)}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {showIndicators && (
                <div className="flex w-full justify-center gap-2 py-2">
                    {slides.map((slide, index) => (
                        <a
                            key={`indicator-${slide.id}`}
                            href={`#${slide.id}`}
                            className="btn btn-xs"
                            onClick={() => handleSlideChange(index)}
                        >
                            {index + 1}
                        </a>
                    ))}
                </div>
            )}
        </>
    )
}

/**
 * Simple Carousel Component
 *
 * A basic carousel wrapper for custom implementations.
 * Provides just the carousel container without navigation.
 */
function SimpleCarousel({
    className,
    snap,
    direction,
    children,
    ...props
}: Omit<CarouselProps, 'showNavigation' | 'showIndicators' | 'onSlideChange'>) {
    return (
        <Carousel
            className={className}
            snap={snap}
            direction={direction}
            {...props}
        >
            {children}
        </Carousel>
    )
}

export {Carousel, CarouselItem, CarouselWithNavigation, SimpleCarousel, carouselVariants}
