import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'

import columnTypesRoutes from './get.column-types.js'
import generatorsRoutes from './get.generators.js'
import tableGeneratorsRoutes from './get.table-generators.js'

/**
 * Schema Routes
 * /api/schema/*
 *
 * Provides schema information including column types, data generators,
 * and table generators from both built-in sources and active modules.
 */
const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

// Mount sub-routes
app.route('/', columnTypesRoutes)
app.route('/', generatorsRoutes)
app.route('/', tableGeneratorsRoutes)

export default app
