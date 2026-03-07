import crypto from 'crypto';

// Use environment variable for encryption key, fallback to default for dev
const ENCRYPTION_KEY = (process.env.SESSION_ENCRYPTION_KEY || 'default-dev-key-change-in-production').padEnd(32, '0').slice(0, 32);

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt session data
 */
export function encryptSession(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (IV needs to be sent with encrypted data for decryption)
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt session data
 */
export function decryptSession(encryptedData: string): string | null {
    try {
        const [ivHex, encrypted] = encryptedData.split(':');
        if (!ivHex || !encrypted) return null;
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Session decryption error:', error);
        return null;
    }
}

/**
 * Create an encrypted session token with user ID
 */
export function createSessionToken(userId: number, email: string): string {
    const data = JSON.stringify({
        userId,
        email,
        createdAt: new Date().toISOString(),
    });
    return encryptSession(data);
}

/**
 * Validate and extract user data from an encrypted session token
 */
export function validateSessionToken(token: string): { userId: number; email: string } | null {
    const decrypted = decryptSession(token);
    if (!decrypted) return null;
    
    try {
        const data = JSON.parse(decrypted);
        return { userId: data.userId, email: data.email };
    } catch (error) {
        console.error('Session token validation error:', error);
        return null;
    }
}
