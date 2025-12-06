import type { StoreModule } from '../types.js';
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
 *
 * Table Generators:
 * - phone-rental-tables: Generate rental tables with phone data
 */
declare const phoneNumbersModule: StoreModule;
export default phoneNumbersModule;
//# sourceMappingURL=index.d.ts.map