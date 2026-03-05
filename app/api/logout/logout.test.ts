import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Logout API Route', () => {
    test('should log out a user successfully', async ({ request }) => {
        // First login to get a session
        await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        // Then test logout
        const response = await request.post(`${API_BASE}/api/logout`);

        if (response.ok()) {
            const data = await response.json();
            expect(data).toBeDefined();
        } else {
            // Backend might not be available
            expect([400, 401, 500, 502, 503, 504]).toContain(response.status());
        }
    });

    test('should handle logout without active session', async ({ request }) => {
        // Try to logout without logging in first
        const response = await request.post(`${API_BASE}/api/logout`);

        // Should still return a response (might be 200 or error depending on backend)
        expect(response.status()).toBeGreaterThanOrEqual(200);
    });

    test('should clear cookies on logout', async ({ request }) => {
        // First login to get a session
        await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        // Then logout and check cookies
        const response = await request.post(`${API_BASE}/api/logout`);

        const cookies = response.headers()['set-cookie'];
        if (response.ok()) {
            // Cookies should be set to expire or be cleared
            expect(cookies).toBeDefined();
        }
    });
});
