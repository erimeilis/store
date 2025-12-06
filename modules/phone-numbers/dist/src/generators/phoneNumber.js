const COUNTRY_PATTERNS = {
    US: {
        code: '+1',
        areaCodeRanges: [
            { min: 201, max: 989 }, // Valid US area codes range
        ],
        subscriberLength: 7,
        format: (area, sub) => `+1 (${area}) ${sub.slice(0, 3)}-${sub.slice(3)}`,
    },
    GB: {
        code: '+44',
        areaCodeRanges: [
            { min: 20, max: 29 }, // London
            { min: 113, max: 119 }, // Leeds, etc.
            { min: 121, max: 129 }, // Birmingham, etc.
            { min: 131, max: 139 }, // Edinburgh, etc.
            { min: 141, max: 149 }, // Glasgow, etc.
            { min: 151, max: 159 }, // Liverpool, etc.
            { min: 161, max: 169 }, // Manchester, etc.
        ],
        subscriberLength: 8,
        format: (area, sub) => `+44 ${area} ${sub.slice(0, 4)} ${sub.slice(4)}`,
    },
    DE: {
        code: '+49',
        areaCodeRanges: [
            { min: 30, max: 39 }, // Berlin
            { min: 40, max: 49 }, // Hamburg
            { min: 69, max: 69 }, // Frankfurt
            { min: 89, max: 89 }, // Munich
            { min: 221, max: 229 }, // Cologne area
            { min: 211, max: 219 }, // Düsseldorf area
        ],
        subscriberLength: 7,
        format: (area, sub) => `+49 ${area} ${sub}`,
    },
    FR: {
        code: '+33',
        areaCodeRanges: [
            { min: 1, max: 5 }, // Geographic codes
        ],
        subscriberLength: 8,
        format: (area, sub) => `+33 ${area} ${sub.slice(0, 2)} ${sub.slice(2, 4)} ${sub.slice(4, 6)} ${sub.slice(6)}`,
    },
    AU: {
        code: '+61',
        areaCodeRanges: [
            { min: 2, max: 2 }, // NSW, ACT
            { min: 3, max: 3 }, // VIC, TAS
            { min: 7, max: 7 }, // QLD
            { min: 8, max: 8 }, // SA, NT, WA
        ],
        subscriberLength: 8,
        format: (area, sub) => `+61 ${area} ${sub.slice(0, 4)} ${sub.slice(4)}`,
    },
    JP: {
        code: '+81',
        areaCodeRanges: [
            { min: 3, max: 3 }, // Tokyo
            { min: 6, max: 6 }, // Osaka
            { min: 45, max: 45 }, // Yokohama
            { min: 52, max: 52 }, // Nagoya
            { min: 75, max: 75 }, // Kyoto
            { min: 78, max: 78 }, // Kobe
            { min: 92, max: 92 }, // Fukuoka
        ],
        subscriberLength: 8,
        format: (area, sub) => `+81 ${area}-${sub.slice(0, 4)}-${sub.slice(4)}`,
    },
};
/**
 * US carrier-specific prefixes for realistic DID numbers
 */
const US_CARRIER_PREFIXES = {
    'AT&T': ['210', '214', '281', '310', '312', '404', '415', '469', '512', '650'],
    'Verizon': ['201', '212', '215', '301', '347', '516', '617', '703', '732', '908'],
    'T-Mobile': ['206', '213', '253', '303', '425', '503', '602', '702', '720', '818'],
};
/**
 * Generate a random number within a range
 */
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Generate random digits of specified length
 */
function randomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        // First digit of subscriber shouldn't be 0 or 1 for US numbers
        if (i === 0) {
            result += randomInRange(2, 9).toString();
        }
        else {
            result += randomInRange(0, 9).toString();
        }
    }
    return result;
}
/**
 * Phone number generator
 * Generates realistic phone numbers for various countries
 */
export const phoneNumberGenerator = {
    id: 'phone-number',
    displayName: 'Phone Number',
    description: 'Generate realistic phone numbers with country-specific formatting',
    icon: 'phone',
    category: 'Telecom',
    outputType: 'phone',
    options: [
        {
            id: 'country',
            type: 'select',
            displayName: 'Country',
            description: 'Country for phone number format',
            default: 'US',
            options: [
                { value: 'US', label: 'United States (+1)' },
                { value: 'GB', label: 'United Kingdom (+44)' },
                { value: 'DE', label: 'Germany (+49)' },
                { value: 'FR', label: 'France (+33)' },
                { value: 'AU', label: 'Australia (+61)' },
                { value: 'JP', label: 'Japan (+81)' },
            ],
        },
        {
            id: 'format',
            type: 'select',
            displayName: 'Format',
            description: 'Output format style',
            default: 'international',
            options: [
                { value: 'international', label: 'International (+1 555-123-4567)' },
                { value: 'e164', label: 'E.164 (+15551234567)' },
                { value: 'digits', label: 'Digits only (5551234567)' },
            ],
        },
    ],
    generate(count, options) {
        const country = options?.country || 'US';
        const format = options?.format || 'international';
        const pattern = COUNTRY_PATTERNS[country] || COUNTRY_PATTERNS.US;
        const results = [];
        for (let i = 0; i < count; i++) {
            // Generate area code
            const areaCodeRange = pattern.areaCodeRanges[randomInRange(0, pattern.areaCodeRanges.length - 1)];
            const areaCode = randomInRange(areaCodeRange.min, areaCodeRange.max).toString();
            // Generate subscriber number
            const subscriber = randomDigits(pattern.subscriberLength);
            // Format based on requested style
            let number;
            switch (format) {
                case 'e164':
                    number = `${pattern.code}${areaCode}${subscriber}`.replace(/\s/g, '');
                    break;
                case 'digits':
                    number = `${areaCode}${subscriber}`;
                    break;
                default:
                    number = pattern.format(areaCode, subscriber);
            }
            results.push(number);
        }
        return results;
    },
    preview(options) {
        const samples = this.generate(3, options);
        return samples.join(', ');
    },
};
/**
 * DID number generator
 * Generates realistic DID numbers with optional carrier assignment
 */
export const didNumberGenerator = {
    id: 'did-number',
    displayName: 'DID Number',
    description: 'Generate Direct Inward Dialing numbers with carrier-specific patterns',
    icon: 'phone-forwarded',
    category: 'Telecom',
    outputType: 'did',
    options: [
        {
            id: 'country',
            type: 'select',
            displayName: 'Country',
            description: 'Country for DID format',
            default: 'US',
            options: [
                { value: 'US', label: 'United States (+1)' },
                { value: 'GB', label: 'United Kingdom (+44)' },
                { value: 'DE', label: 'Germany (+49)' },
            ],
        },
        {
            id: 'carrier',
            type: 'select',
            displayName: 'Carrier (US only)',
            description: 'Generate numbers from specific carrier ranges',
            default: 'any',
            options: [
                { value: 'any', label: 'Any Carrier' },
                { value: 'AT&T', label: 'AT&T' },
                { value: 'Verizon', label: 'Verizon' },
                { value: 'T-Mobile', label: 'T-Mobile' },
            ],
        },
        {
            id: 'includeExtension',
            type: 'boolean',
            displayName: 'Include Extension',
            description: 'Add random extension numbers',
            default: false,
        },
        {
            id: 'sequential',
            type: 'boolean',
            displayName: 'Sequential',
            description: 'Generate sequential numbers (for DID blocks)',
            default: false,
        },
    ],
    generate(count, options) {
        const country = options?.country || 'US';
        const carrier = options?.carrier || 'any';
        const includeExtension = options?.includeExtension;
        const sequential = options?.sequential;
        const pattern = COUNTRY_PATTERNS[country] || COUNTRY_PATTERNS.US;
        const results = [];
        // For sequential generation, pick a starting point
        let baseNumber = null;
        let currentSubscriber = 0;
        for (let i = 0; i < count; i++) {
            let areaCode;
            let subscriber;
            if (sequential && baseNumber) {
                // Generate sequential numbers
                currentSubscriber++;
                subscriber = currentSubscriber.toString().padStart(pattern.subscriberLength, '0');
                areaCode = baseNumber;
            }
            else {
                // Generate random numbers
                if (country === 'US' && carrier !== 'any' && US_CARRIER_PREFIXES[carrier]) {
                    // Use carrier-specific area codes
                    const carrierCodes = US_CARRIER_PREFIXES[carrier];
                    areaCode = carrierCodes[randomInRange(0, carrierCodes.length - 1)];
                }
                else {
                    // Use general area codes
                    const areaCodeRange = pattern.areaCodeRanges[randomInRange(0, pattern.areaCodeRanges.length - 1)];
                    areaCode = randomInRange(areaCodeRange.min, areaCodeRange.max).toString();
                }
                subscriber = randomDigits(pattern.subscriberLength);
                if (sequential && !baseNumber) {
                    baseNumber = areaCode;
                    currentSubscriber = parseInt(subscriber, 10);
                }
            }
            // Format the number
            let number = pattern.format(areaCode, subscriber);
            // Add extension if requested
            if (includeExtension) {
                const ext = randomInRange(100, 9999).toString();
                number = `${number} x${ext}`;
            }
            results.push(number);
        }
        return results;
    },
    preview(options) {
        const samples = this.generate(3, options);
        return samples.join(', ');
    },
};
//# sourceMappingURL=phoneNumber.js.map