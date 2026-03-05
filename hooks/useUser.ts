// get user from api
import { useState, useEffect } from "react"
import type { User } from "../api/user"
import getUserData from "../api/user"

const useUser = (user_id: number) => {

    const [user, setUser] = useState<User | null>(null);

    // Fetch user data once after component mounts
    useEffect(() => {
        getUserData(user_id)
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    }, []); // Empty dependency array ensures this runs only once

    return { user, setUser }
}

export default useUser