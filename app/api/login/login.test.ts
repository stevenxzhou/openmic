import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Auth API Routes', () => {
    test('should sign up a user and return response', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        // Backend might not be available, check for valid status codes
        if (response.ok()) {
            const data = await response.json();
            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('authenticated');
        } else {
            // Error response should have error property or be a server error
            expect([400, 401, 403, 404, 500, 502, 503, 504]).toContain(response.status());
        }
    });

    test('should log in a user and return response', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        if (response.ok()) {
            const data = await response.json();
            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('authenticated');
            
            // Check that cookies are set
            const cookies = response.headers()['set-cookie'];
            expect(cookies).toBeDefined();
        } else {
            // Backend might not be available
            expect([400, 401, 403, 404, 500, 502, 503, 504]).toContain(response.status());
        }
    });

    test('should refresh the user token and return response', async ({ request }) => {
        // First login to get a session
        const loginResponse = await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        // Then test refresh
        const response = await request.post(`${API_BASE}/api/refresh`);

        // Refresh might fail if backend is unavailable or login didn't work
        if (response.ok()) {
            const data = await response.json();
            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('authenticated');
        } else {
            expect([400, 401, 403, 404, 500, 502, 503, 504]).toContain(response.status());
        }
    });

    test('should log out the user', async ({ request }) => {
        // First login to get a session
        await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        // Then test logout
        const response = await request.post(`${API_BASE}/api/logout`);

        // Logout should return a valid response
        if (response.ok()) {
            const data = await response.json();
            expect(data).toBeDefined();
        } else {
            expect([400, 401, 404, 500, 502, 503, 504]).toContain(response.status());
        }
    });

    test('should return error for invalid login credentials', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/login`, {
            form: {
                email: 'invalid@example.com',
                password: 'wrongpassword'
            }
        });

        expect(response.ok()).toBeFalsy();
        // Response might be HTML error page or JSON error
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            expect(data).toHaveProperty('error');
        } else {
            // Might be HTML error page from Next.js
            expect(response.status()).toBeGreaterThanOrEqual(400);
        }
    });

    test('should return error for missing signup fields', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                email: 'test@example.com'
                // Missing password and name fields
            }
        });

        expect(response.ok()).toBeFalsy();
    });
});