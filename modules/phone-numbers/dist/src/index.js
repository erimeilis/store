import { didColumnType, phoneColumnType, carrierColumnType } from './columnTypes/did.js';
import { phoneNumberGenerator, didNumberGenerator } from './generators/phoneNumber.js';
/**
 * @store/phone-numbers module
 *
 * Provides phone number column types and data generators for
 * telecommunications data management.
 *
 * Column Types:
 * - did: Direct Inward Dialing numbers with country-specific validation
 * - phone: General phone numbers with flexible validation
 * - carrier: Telecom carrier/provider names
 *
 * Data Generators:
 * - phone-number: Generate realistic phone numbers
 * - did-number: Generate DID numbers with carrier patterns
 */
const phoneNumbersModule = {
    id: '@store/phone-numbers',
    version: '1.0.0',
    columnTypes: [
        didColumnType,
        phoneColumnType,
        carrierColumnType,
    ],
    dataGenerators: [
        phoneNumberGenerator,
        didNumberGenerator,
    ],
    async onActivate(context) {
        context.logger.info('Phone Numbers module activated', {
            version: context.version,
            settings: context.settings,
        });
        // Log available column types
        context.logger.debug('Registered column types', {
            types: ['did', 'phone', 'carrier'],
        });
        // Log available generators
        context.logger.debug('Registered data generators', {
            generators: ['phone-number', 'did-number'],
        });
    },
    async onDeactivate(context) {
        context.logger.info('Phone Numbers module deactivated');
    },
};
export default phoneNumbersModule;
//# sourceMappingURL=index.js.map