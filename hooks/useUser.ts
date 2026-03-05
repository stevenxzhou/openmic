// get user from database
import { useState, useEffect } from "react"

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const useUser = (user_id: number) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data once after component mounts
    useEffect(() => {
        if (!user_id) return;
        
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                // TODO: Create dedicated GET /api/users/:id endpoint
                // For now, you can fetch from your database directly
                // or create this endpoint in app/api/users/[id]/route.ts
                const response = await fetch(`/api/users/${user_id}`, {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                
                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [user_id]);

    return { user, setUser, loading, error }
}

export default useUser