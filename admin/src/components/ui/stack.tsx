import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const stackVariants = cva(
    'stack',
    {
        variants: {
            // Spacing variants
            spacing: {
                none: '',
                xs: 'gap-1',
                sm: 'gap-2',
                md: 'gap-4',
                lg: 'gap-6',
                xl: 'gap-8',
            },
            // Alignment variants
            align: {
                start: 'items-start',
                center: 'items-center',
                end: 'items-end',
                stretch: 'items-stretch',
            },
            // Justify variants
            justify: {
                start: 'justify-start',
                center: 'justify-center',
                end: 'justify-end',
                between: 'justify-between',
                around: 'justify-around',
                evenly: 'justify-evenly',
            },
            // Direction variants
            direction: {
                column: 'flex-col',
                row: 'flex-row',
                'column-reverse': 'flex-col-reverse',
                'row-reverse': 'flex-row-reverse',
            },
            // Wrap variants
            wrap: {
                none: 'flex-nowrap',
                wrap: 'flex-wrap',
                'wrap-reverse': 'flex-wrap-reverse',
            },
        },
        defaultVariants: {
            spacing: 'md',
            align: 'stretch',
            justify: 'start',
            direction: 'column',
            wrap: 'none',
        },
    }
)

export interface StackProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof stackVariants> {
    /**
     * Stack children elements
     */
    children: React.ReactNode
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Stack component for organizing elements in flexible layouts.
 *
 * Based on DaisyUI's stack utility with support for different directions,
 * spacing, alignment, and wrapping options. Perfect for organizing UI elements,
 * creating consistent layouts, and managing spacing between components.
 *
 * @example
 * ```tsx
 * <Stack direction="column" spacing="md" align="center">
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 *   <Card>Card 3</Card>
 * </Stack>
 * ```
 */
function Stack({
    className,
    spacing,
    align,
    justify,
    direction,
    wrap,
    children,
    asChild = false,
    ...props
}: StackProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn(
                'flex',
                stackVariants({ spacing, align, justify, direction, wrap }),
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * HStack component for horizontal stacking (shorthand for Stack with row direction).
 *
 * @example
 * ```tsx
 * <HStack spacing="sm" align="center">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </HStack>
 * ```
 */
export type HStackProps = Omit<StackProps, 'direction'>

function HStack({ ...props }: HStackProps) {
    return <Stack direction="row" {...props} />
}

/**
 * VStack component for vertical stacking (shorthand for Stack with column direction).
 *
 * @example
 * ```tsx
 * <VStack spacing="lg" align="start">
 *   <h2>Title</h2>
 *   <p>Description text</p>
 *   <Button>Action</Button>
 * </VStack>
 * ```
 */
export type VStackProps = Omit<StackProps, 'direction'>

function VStack({ ...props }: VStackProps) {
    return <Stack direction="column" {...props} />
}

/**
 * Center component for centering content both horizontally and vertically.
 *
 * @example
 * ```tsx
 * <Center minHeight="200px">
 *   <Spinner />
 * </Center>
 * ```
 */
export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Content to center
     */
    children: React.ReactNode
    /**
     * Minimum height for the container
     */
    minHeight?: string | number
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Center({
    className,
    children,
    minHeight,
    asChild = false,
    style,
    ...props
}: CenterProps) {
    const Comp = asChild ? Slot : 'div'

    const centerStyle = {
        ...style,
        ...(minHeight && { minHeight }),
    }

    return (
        <Comp
            className={cn('flex items-center justify-center', className)}
            style={centerStyle}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * Spacer component for adding flexible space between elements.
 *
 * @example
 * ```tsx
 * <HStack>
 *   <Text>Left content</Text>
 *   <Spacer />
 *   <Button>Right action</Button>
 * </HStack>
 * ```
 */
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Spacer({
    className,
    asChild = false,
    ...props
}: SpacerProps) {
    const Comp = asChild ? Slot : 'div'

    return (
        <Comp
            className={cn('flex-1', className)}
            {...props}
        />
    )
}

/**
 * Container component for consistent content width and padding.
 *
 * @example
 * ```tsx
 * <Container maxWidth="lg" padding="md">
 *   <VStack spacing="lg">
 *     <h1>Page Title</h1>
 *     <p>Page content</p>
 *   </VStack>
 * </Container>
 * ```
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Container content
     */
    children: React.ReactNode
    /**
     * Maximum width constraint
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    /**
     * Container padding
     */
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    /**
     * Whether to center the container
     * @default true
     */
    centered?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Container({
    className,
    children,
    maxWidth = 'lg',
    padding = 'md',
    centered = true,
    asChild = false,
    ...props
}: ContainerProps) {
    const Comp = asChild ? Slot : 'div'

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        '2xl': 'max-w-7xl',
        full: 'max-w-full',
    }

    const paddingClasses = {
        none: '',
        sm: 'px-4 py-2',
        md: 'px-6 py-4',
        lg: 'px-8 py-6',
        xl: 'px-12 py-8',
    }

    return (
        <Comp
            className={cn(
                'w-full',
                maxWidthClasses[maxWidth],
                paddingClasses[padding],
                centered && 'mx-auto',
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    )
}

/**
 * Grid component for CSS Grid layouts.
 *
 * @example
 * ```tsx
 * <Grid columns={3} spacing="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Grid children elements
     */
    children: React.ReactNode
    /**
     * Number of columns
     */
    columns?: number | { sm?: number; md?: number; lg?: number; xl?: number }
    /**
     * Grid gap/spacing
     */
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /**
     * Template columns (CSS grid-template-columns value)
     */
    templateColumns?: string
    /**
     * Template rows (CSS grid-template-rows value)
     */
    templateRows?: string
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function Grid({
    className,
    children,
    columns,
    spacing = 'md',
    templateColumns,
    templateRows,
    asChild = false,
    style,
    ...props
}: GridProps) {
    const Comp = asChild ? Slot : 'div'

    const spacingClasses = {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
    }

    const getColumnsClass = () => {
        if (typeof columns === 'number') {
            return `grid-cols-${columns}`
        }
        if (columns && typeof columns === 'object') {
            const classes = []
            if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`)
            if (columns.md) classes.push(`md:grid-cols-${columns.md}`)
            if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`)
            if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`)
            return classes.join(' ')
        }
        return ''
    }

    const gridStyle = {
        ...style,
        ...(templateColumns && { gridTemplateColumns: templateColumns }),
        ...(templateRows && { gridTemplateRows: templateRows }),
    }

    return (
        <Comp
            className={cn(
                'grid',
                getColumnsClass(),
                spacingClasses[spacing],
                className
            )}
            style={gridStyle}
            {...props}
        >
            {children}
        </Comp>
    )
}

export {
    Stack,
    HStack,
    VStack,
    Center,
    Spacer,
    Container,
    Grid,
    stackVariants
}
