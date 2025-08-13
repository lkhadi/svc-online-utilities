/**
 * UUID v7 Generator
 * Implementation based on the draft UUID v7 specification
 * https://www.ietf.org/archive/id/draft-peabody-uuid-07.html
 */
class UUIDv7Generator {
    constructor() {
        this.lastTimestamp = 0;
        this.counter = 0;
    }

    /**
     * Generate a new UUID v7
     * @returns {string} A UUID v7 string
     */
    generate() {
        // Get current timestamp in milliseconds
        const timestamp = Date.now();
        
        // Handle clock regression by using the last timestamp
        // Or use the current timestamp if it's newer
        const currentTimestamp = Math.max(timestamp, this.lastTimestamp);
        
        // If timestamp hasn't changed, increment counter
        // Otherwise reset the counter
        if (currentTimestamp === this.lastTimestamp) {
            this.counter = (this.counter + 1) & 0xFFF; // Keep within 12 bits
            
            // If counter overflows, wait for next millisecond
            if (this.counter === 0) {
                // Wait until we're in a new millisecond
                while (Date.now() <= currentTimestamp) {
                    // Busy wait (in a real implementation, we might use a more sophisticated approach)
                }
                this.lastTimestamp = Date.now();
            }
        } else {
            this.counter = 0;
            this.lastTimestamp = currentTimestamp;
        }

        // Convert timestamp to a 48-bit big-endian hex value
        const time = BigInt(currentTimestamp) & BigInt('0xFFFFFFFFFFFF');
        const timeHex = time.toString(16).padStart(12, '0');
        
        // Generate random values for the rest of the UUID
        const randA = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
        
        // Version (7) goes in the most significant 4 bits of this octet
        const version = 0x7000 | (Math.floor(Math.random() * 0x1000));
        const verHex = version.toString(16).padStart(4, '0');
        
        // Variant (binary 10xx) goes in the most significant bits of this octet
        const variant = 0x8000 | (Math.floor(Math.random() * 0x4000));
        const varHex = variant.toString(16).padStart(4, '0');
        
        const randB = Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padStart(12, '0');

        // Assemble the UUID in the 8-4-4-4-12 format
        return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}${randA.slice(0, 2)}-${verHex.slice(0, 2)}${randA.slice(2, 4)}-${varHex}${randB.slice(0, 2)}-${randB.slice(2)}`;
    }

    /**
     * Validate if a string is a valid UUID v7
     * @param {string} uuid String to validate
     * @returns {boolean} True if the string is a valid UUID v7
     */
    validate(uuid) {
        // Basic format check using regex
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }

    /**
     * Extract the timestamp from a UUID v7
     * @param {string} uuid A UUID v7 string
     * @returns {number|null} The timestamp in milliseconds or null if invalid
     */
    extractTimestamp(uuid) {
        if (!this.validate(uuid)) {
            return null;
        }

        // Remove hyphens and extract the time bits
        const parts = uuid.replace(/-/g, '');
        const timePart = parts.substring(0, 12);
        
        // Convert from hex to a number (milliseconds since Unix epoch)
        return parseInt(timePart, 16);
    }
}