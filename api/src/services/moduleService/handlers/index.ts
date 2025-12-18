/**
 * Built-in Module Handlers
 * Exports all validation, formatting, and generation handlers
 */

export {
  validate,
  getValidationHandlers,
} from './validation.js'

export {
  format,
  getFormatHandlers,
} from './format.js'

export {
  generate,
  generateRow,
  generateRows,
  getGenerationHandlers,
  getCommonFakerMethods,
  type GenerationContext,
} from './generation.js'
