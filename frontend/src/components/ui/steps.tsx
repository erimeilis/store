import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const stepsVariants = cva(
    'steps',
    {
        variants: {
            // Direction variants
            direction: {
                horizontal: '',
                vertical: 'steps-vertical',
            },
            // Color variants
            color: {
                default: '',
                primary: 'steps-primary',
                secondary: 'steps-secondary',
                accent: 'steps-accent',
                info: 'steps-info',
                success: 'steps-success',
                warning: 'steps-warning',
                error: 'steps-error',
            },
        },
        defaultVariants: {
            direction: 'horizontal',
            color: 'default',
        },
    }
)

const stepVariants = cva(
    'step',
    {
        variants: {
            // State variants
            state: {
                pending: '',
                active: 'step-primary',
                completed: 'step-primary',
                error: 'step-error',
            },
            // Color variants (for individual steps)
            color: {
                default: '',
                primary: 'step-primary',
                secondary: 'step-secondary',
                accent: 'step-accent',
                info: 'step-info',
                success: 'step-success',
                warning: 'step-warning',
                error: 'step-error',
            },
        },
        defaultVariants: {
            state: 'pending',
            color: 'default',
        },
    }
)

export interface StepItem {
    /**
     * Unique identifier for the step
     */
    id: string
    /**
     * Step title/label
     */
    title: React.ReactNode
    /**
     * Optional step description
     */
    description?: React.ReactNode
    /**
     * Custom icon for the step
     */
    icon?: React.ReactNode
    /**
     * Step state
     */
    state?: 'pending' | 'active' | 'completed' | 'error'
    /**
     * Whether the step is clickable
     */
    clickable?: boolean
    /**
     * Custom props for the step element
     */
    stepProps?: React.HTMLAttributes<HTMLLIElement>
}

export interface StepsProps
    extends Omit<React.HTMLAttributes<HTMLUListElement>, 'color'>,
        VariantProps<typeof stepsVariants> {
    /**
     * Array of step items
     */
    steps: StepItem[]
    /**
     * Current active step index
     */
    currentStep?: number
    /**
     * Callback fired when a step is clicked
     */
    onStepClick?: (stepIndex: number, step: StepItem) => void
    /**
     * Whether to show step descriptions
     * @default false
     */
    showDescriptions?: boolean
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

/**
 * Steps component for showing progress through a multi-step process.
 *
 * Based on DaisyUI's steps component with support for horizontal/vertical
 * layouts, different colors, custom icons, and interactive step navigation.
 * Perfect for onboarding flows, multi-step forms, and process indicators.
 *
 * @example
 * ```tsx
 * const steps = [
 *   { id: '1', title: 'Account Info', state: 'completed' },
 *   { id: '2', title: 'Personal Details', state: 'active' },
 *   { id: '3', title: 'Verification', state: 'pending' },
 *   { id: '4', title: 'Complete', state: 'pending' }
 * ]
 *
 * <Steps
 *   steps={steps}
 *   currentStep={1}
 *   color="primary"
 *   onStepClick={handleStepClick}
 * />
 * ```
 */
function Steps({
    className,
    direction,
    color,
    steps,
    currentStep = 0,
    onStepClick,
    showDescriptions = false,
    asChild = false,
    ...props
}: StepsProps) {
    const Comp = asChild ? Slot : 'ul'

    return (
        <Comp
            className={cn(stepsVariants({ direction, color }), className)}
            {...props}
        >
            {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                // Determine step state
                let stepState = step.state
                if (!stepState) {
                    if (isCompleted) stepState = 'completed'
                    else if (isActive) stepState = 'active'
                    else stepState = 'pending'
                }

                const isClickable = step.clickable && onStepClick

                return (
                    <li
                        key={step.id}
                        className={cn(
                            stepVariants({ state: stepState }),
                            isClickable && 'cursor-pointer hover:opacity-80',
                            step.stepProps?.className
                        )}
                        onClick={() => isClickable && onStepClick(index, step)}
                        {...step.stepProps}
                        data-content={step.icon ? undefined : (index + 1).toString()}
                    >
                        {step.icon && (
                            <div className="step-icon">
                                {step.icon}
                            </div>
                        )}

                        <div className="step-content">
                            <div className="step-title font-medium">
                                {step.title}
                            </div>
                            {showDescriptions && step.description && (
                                <div className="step-description text-sm opacity-70 mt-1">
                                    {step.description}
                                </div>
                            )}
                        </div>
                    </li>
                )
            })}
        </Comp>
    )
}

/**
 * ProgressSteps component with built-in progress calculation.
 *
 * @example
 * ```tsx
 * <ProgressSteps
 *   steps={steps}
 *   completedSteps={2}
 *   showProgress
 *   showPercentage
 * />
 * ```
 */
export interface ProgressStepsProps extends Omit<StepsProps, 'currentStep'> {
    /**
     * Number of completed steps
     */
    completedSteps?: number
    /**
     * Whether to show progress bar
     * @default false
     */
    showProgress?: boolean
    /**
     * Whether to show percentage
     * @default false
     */
    showPercentage?: boolean
    /**
     * Custom progress bar props
     */
    progressProps?: React.HTMLAttributes<HTMLDivElement>
}

function ProgressSteps({
    steps,
    completedSteps = 0,
    showProgress = false,
    showPercentage = false,
    progressProps,
    className,
    ...props
}: ProgressStepsProps) {
    const progress = Math.min((completedSteps / steps.length) * 100, 100)
    const currentStep = Math.min(completedSteps, steps.length - 1)

    return (
        <div className={cn('space-y-4', className)}>
            {/* Progress bar */}
            {showProgress && (
                <div className="space-y-2">
                    <div
                        className={cn(
                            'w-full bg-base-300 rounded-full h-2',
                            progressProps?.className
                        )}
                        {...progressProps}
                    >
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {showPercentage && (
                        <div className="text-center text-sm text-base-content/70">
                            {Math.round(progress)}% Complete
                        </div>
                    )}
                </div>
            )}

            {/* Steps */}
            <Steps
                steps={steps}
                currentStep={currentStep}
                {...props}
            />
        </div>
    )
}

/**
 * SimpleStep component for individual step usage.
 *
 * @example
 * ```tsx
 * <ul className="steps">
 *   <SimpleStep state="completed">Register</SimpleStep>
 *   <SimpleStep state="active">Choose plan</SimpleStep>
 *   <SimpleStep state="pending">Purchase</SimpleStep>
 *   <SimpleStep state="pending">Receive Product</SimpleStep>
 * </ul>
 * ```
 */
export interface SimpleStepProps
    extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'color'>,
        VariantProps<typeof stepVariants> {
    /**
     * Step content
     */
    children: React.ReactNode
    /**
     * Custom icon for the step
     */
    icon?: React.ReactNode
    /**
     * Step number (if no icon provided)
     */
    stepNumber?: number
    /**
     * Whether to use as a child component (renders as Slot)
     */
    asChild?: boolean
}

function SimpleStep({
    className,
    state,
    color,
    children,
    icon,
    stepNumber,
    asChild = false,
    ...props
}: SimpleStepProps) {
    const Comp = asChild ? Slot : 'li'

    return (
        <Comp
            className={cn(stepVariants({ state, color }), className)}
            data-content={icon ? undefined : stepNumber?.toString()}
            {...props}
        >
            {icon && (
                <div className="step-icon">
                    {icon}
                </div>
            )}
            {children}
        </Comp>
    )
}

/**
 * StepConnector component for custom step connections.
 *
 * @example
 * ```tsx
 * <div className="flex items-center">
 *   <SimpleStep state="completed">Step 1</SimpleStep>
 *   <StepConnector />
 *   <SimpleStep state="active">Step 2</SimpleStep>
 * </div>
 * ```
 */
export interface StepConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether the connector is active (connecting completed steps)
     */
    active?: boolean
    /**
     * Connector orientation
     */
    orientation?: 'horizontal' | 'vertical'
}

function StepConnector({
    className,
    active = false,
    orientation = 'horizontal',
    ...props
}: StepConnectorProps) {
    return (
        <div
            className={cn(
                'step-connector',
                orientation === 'horizontal' ? 'w-8 h-0.5' : 'w-0.5 h-8',
                active ? 'bg-primary' : 'bg-base-300',
                'transition-colors duration-200',
                className
            )}
            {...props}
        />
    )
}

export {
    Steps,
    ProgressSteps,
    SimpleStep,
    StepConnector,
    stepsVariants,
    stepVariants
}
