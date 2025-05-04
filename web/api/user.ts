export type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    primary_social_media_alias: string;
    user_type: string;
    role: string;
}

async function getUserData(user_id: number) {
    const response = await fetch('http://127.0.0.1:5000/api/users' + `/${user_id}`);
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

    const response = await fetch('http://127.0.0.1:5001/api/login', {
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

async function signup(email: string, password: string, first_name: string, last_name: string) {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);

    const response = await fetch('http://127.0.0.1:5001/api/signup', {
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
export { login, signup };