/**
 * Module Service - JSON-Only Architecture
 *
 * Manages module lifecycle for JSON-based modules.
 * No code execution - modules are pure configuration.
 */

// Module Manager
export { ModuleManagerService, createModuleManager } from './moduleManager.js'

// Built-in Handlers
export {
  validate,
  getValidationHandlers,
  format,
  getFormatHandlers,
  generate,
  generateRow,
  generateRows,
  getGenerationHandlers,
  getCommonFakerMethods,
  type GenerationContext,
} from './handlers/index.js'
