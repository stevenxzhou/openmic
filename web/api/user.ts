export type User = {
    user_id: number;
    username: string;
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

export default getUserData;