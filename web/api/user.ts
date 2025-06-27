export type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    primary_social_media_alias: string;
    user_type: string;
    role: string;
}

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

async function getUserData(user_id: number) {
    const response = await fetch(`${openmicApiBase}/api/users` + `/${user_id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

async function login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${openmicApiBase}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

async function refresh() {
    const response = await fetch(`${openmicApiBase}/api/refresh`, {
        method: 'POST',
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

async function signup(email: string, password: string, first_name: string, last_name: string) {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);

    const response = await fetch(`${openmicApiBase}/api/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

export default getUserData;
export { login, signup, refresh };