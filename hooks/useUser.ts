// get user from api
import { useState, useEffect } from "react"

export type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    primary_social_media_alias: string;
    user_type: string;
    role: string;
}

const useUser = (user_id: number) => {

    const [user, setUser] = useState<User | null>(null);

    // Fetch user data once after component mounts
    useEffect(() => {
        const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';
        fetch(`${openmicApiBase}/api/users/${user_id}`)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    }, [user_id]);

    return { user, setUser }
}

export default useUser