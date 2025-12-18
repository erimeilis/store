/**
 * Admin Tools Component
 * Displays generator buttons for admin users to create test data
 */

'use client'

import React, { useState, useEffect } from 'react'
import { IconWand, IconShoppingCart, IconClockDollar, IconPhone } from '@tabler/icons-react'
import { generateDummyTables, fetchTableGenerators, TableGenerator } from '@/handlers/admin'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

// Icon mapping for generator icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number | string }>> = {
    'wand': IconWand,
    'shopping-cart': IconShoppingCart,
    'clock-dollar': IconClockDollar,
    'phone': IconPhone,
}

// Color type for Button component
type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'neutral'

interface AdminToolsProps {
    userId: string
}

export function AdminTools({ userId }: AdminToolsProps) {
    const [generators, setGenerators] = useState<TableGenerator[]>([])
    const [loadingGenerators, setLoadingGenerators] = useState(true)
    const [activeGeneratorId, setActiveGeneratorId] = useState<string | null>(null)
    const [confirmGeneratorId, setConfirmGeneratorId] = useState<string | null>(null)

    // Fetch generators on mount
    useEffect(() => {
        async function loadGenerators() {
            const result = await fetchTableGenerators()
            if (result.success) {
                setGenerators(result.generators)
            } else {
                console.error('Failed to load generators:', result.error)
            }
            setLoadingGenerators(false)
        }
        loadGenerators()
    }, [])

    // Get icon component for a generator
    const getGeneratorIcon = (generator: TableGenerator) => {
        const IconComponent = generator.icon ? ICON_MAP[generator.icon] : IconWand
        return IconComponent || IconWand
    }

    // Get button color for generator
    const getButtonColor = (generator: TableGenerator): ButtonColor => {
        const validColors: ButtonColor[] = ['primary', 'secondary', 'success', 'warning', 'info', 'error', 'neutral']
        return generator.color && validColors.includes(generator.color as ButtonColor)
            ? (generator.color as ButtonColor)
            : 'neutral'
    }

    // Dynamic generator handler
    const handleGenerateFromGenerator = async (generator: TableGenerator) => {
        setActiveGeneratorId(generator.id)
        setConfirmGeneratorId(null)

        try {
            const result = await generateDummyTables(
                userId,
                generator.defaultTableCount,
                generator.defaultRowCount,
                generator.tableType
            )

            if (result.success) {
                const moduleSuffix = generator.moduleName ? ` (${generator.moduleName})` : ''
                toast.success(`Success! Generated ${result.tablesCreated} ${generator.displayName.toLowerCase()}${moduleSuffix} with ${result.rowsCreated} total rows.`, {
                    duration: 5000
                })
                window.location.reload()
            } else {
                toast.error(`Error: ${result.error}`)
            }
        } catch (error) {
            console.error(`Error generating ${generator.displayName}:`, error)
            toast.error(`Failed to generate ${generator.displayName}. Check console for details.`)
        } finally {
            setActiveGeneratorId(null)
        }
    }

    const coreGenerators = generators.filter(g => !g.moduleName)
    const moduleGenerators = generators.filter(g => g.moduleName)
    const anyGenerating = activeGeneratorId !== null

    return (
        <>
            <div className="mb-4 p-4 bg-warning/10 border border-warning rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <IconWand className="h-5 w-5 text-warning flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-warning">Admin Tools</h3>
                            <p className="text-sm text-gray-600 hidden sm:block">Generate test data for development and testing</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {loadingGenerators ? (
                            <span className="loading loading-spinner loading-sm text-warning"></span>
                        ) : (
                            <>
                                {/* Core generators (no moduleName) */}
                                {coreGenerators.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {coreGenerators.map((generator) => {
                                            const IconComponent = getGeneratorIcon(generator)
                                            const isActive = activeGeneratorId === generator.id

                                            return (
                                                <Button
                                                    key={generator.id}
                                                    onClick={() => setConfirmGeneratorId(generator.id)}
                                                    disabled={anyGenerating}
                                                    size="sm"
                                                    color={getButtonColor(generator)}
                                                    icon={IconComponent}
                                                    processing={isActive}
                                                >
                                                    {isActive ? 'Generating...' : `Generate ${generator.defaultTableCount} ${generator.displayName}`}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                )}
                                {/* Module generators (have moduleName) */}
                                {moduleGenerators.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {moduleGenerators.map((generator) => {
                                            const IconComponent = getGeneratorIcon(generator)
                                            const isActive = activeGeneratorId === generator.id

                                            return (
                                                <Button
                                                    key={generator.id}
                                                    onClick={() => setConfirmGeneratorId(generator.id)}
                                                    disabled={anyGenerating}
                                                    size="sm"
                                                    color={getButtonColor(generator)}
                                                    style="outline"
                                                    icon={IconComponent}
                                                    processing={isActive}
                                                    title={`From module: ${generator.moduleName}`}
                                                >
                                                    {isActive ? 'Generating...' : `Generate ${generator.defaultTableCount} ${generator.displayName}`}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmGeneratorId && (() => {
                const generator = generators.find(g => g.id === confirmGeneratorId)
                if (!generator) return null
                const IconComponent = getGeneratorIcon(generator)
                const totalRows = generator.defaultTableCount * generator.defaultRowCount
                const colorClass = generator.color ? `text-${generator.color}` : 'text-neutral'
                const isGenerating = activeGeneratorId === generator.id

                return (
                    <dialog id="confirm-generator-modal" className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <IconComponent className={`h-6 w-6 ${colorClass}`} />
                                Confirm {generator.displayName} Generation
                            </h3>
                            <p className="py-4">
                                This will generate <strong>{generator.defaultTableCount} {generator.displayName.toLowerCase()}</strong> with <strong>{generator.defaultRowCount} records</strong> each.
                            </p>
                            <p className={`${colorClass} text-sm`}>
                                {totalRows >= 10000 ? '⚠️' : '✓'} This action will create a total of <strong>{totalRows.toLocaleString()} records</strong> in your database.
                            </p>
                            {generator.moduleName && (
                                <p className="text-secondary text-sm mt-2">
                                    🧩 Provided by module: <strong>{generator.moduleName}</strong>
                                </p>
                            )}
                            <p className="text-base-content/70 text-sm mt-2">
                                {generator.description}
                            </p>
                            <div className="modal-action">
                                <Button
                                    onClick={() => setConfirmGeneratorId(null)}
                                    style="ghost"
                                    disabled={isGenerating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleGenerateFromGenerator(generator)}
                                    color={getButtonColor(generator)}
                                    processing={isGenerating}
                                >
                                    {isGenerating ? 'Generating...' : `Yes, Generate ${generator.displayName}`}
                                </Button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setConfirmGeneratorId(null)}>close</button>
                        </form>
                    </dialog>
                )
            })()}
        </>
    )
}
