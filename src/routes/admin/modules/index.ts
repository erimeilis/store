import { Hono } from 'hono'
import type { Bindings } from '@/types/bindings.js'
import type { HonoVariables } from '@/types/hono.js'

// Import individual route handlers
import getModules from './get.js'
import getModuleById from './get.id.js'
import getAvailableModules from './get.available.js'
import postInstall from './post.install.js'
import postModuleAction from './post.id.action.js'
import patchModuleSettings from './patch.id.settings.js'
import deleteModule from './delete.id.js'
import getModuleEvents from './get.id.events.js'
import getModuleAnalytics from './get.id.analytics.js'
import postReloadAll from './post.reload.js'

/**
 * Admin Module Routes
 * Administrative endpoints for module management
 * Base path: /api/admin/modules
 */
const app = new Hono<{ Bindings: Bindings; Variables: HonoVariables }>()

// Mount routes - specific paths before parameterized ones
app.route('/', getModules)
app.route('/', getAvailableModules)  // Must be before /:id routes
app.route('/', postInstall)
app.route('/', getModuleById)        // Parameterized routes last
app.route('/', postModuleAction)
app.route('/', patchModuleSettings)
app.route('/', deleteModule)
app.route('/', getModuleEvents)
app.route('/', getModuleAnalytics)
app.route('/', postReloadAll)

export default app
