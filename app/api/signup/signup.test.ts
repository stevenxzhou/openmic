import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Signup API Route', () => {
    test('should sign up a user successfully with all fields', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        expect(response.ok()).toBeTruthy();
        if (response.ok()) {
            const data = await response.json();
            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('authenticated');
        }
    });

    test('should return error for missing email', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                password: 'password123',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        expect(response.ok()).toBeFalsy();
    });

    test('should return error for missing password', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        expect(response.ok()).toBeFalsy();
    });

    test('should set cookies on successful signup', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/signup`, {
            form: {
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        const cookies = response.headers()['set-cookie'];
        if (response.ok()) {
            expect(cookies).toBeDefined();
        }
    });
});
