import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ActionType, useGlobalContext, InitialUser } from "@/context/useGlobalContext";
import { logout } from "@/api/user";

interface HeaderProps {
    backBtnLink?: string;  // Optional prop with '?'
}
const Header: React.FC<HeaderProps> = ({ backBtnLink }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { user, dispatch }  = useGlobalContext();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Checking click bubble 
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        // top -> down capture phase before bubling. 
        document.addEventListener('mousedown', handleClickOutside, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, []);

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    }
    
    const userLogoutHandler = async () => {
        toggleProfileMenu();
        let logoutData = await logout();
        dispatch({ type: ActionType.SET_USER, payload: { ...InitialUser, authenticated: logoutData.authenticated } });
    }

    return (
        <>
            <header className="flex justify-between bg-yellow-500 items-center w-full fixed z-50">
                <div className="flex px-4 items-center">
                    <button className="hover:opacity-50 transition-opacity">
                        {
                            backBtnLink && (
                                <Link href={backBtnLink}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" // Tailwind classes for size 
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> </svg>
                                </Link>
                            )
                        }

                    </button>
                </div>
                <div>
                    <img className="mt-1" src="https://placehold.co/220x50/transparent/31343C?font=poppins&text=Open%20Mic%20Night"></img>
                </div>
                <div className="pr-4 flex items-center">
                    {!user.authenticated ? (
                        <Link href='/login'>
                            Sign in
                        </Link>
                    ) :
                        (
                            <button ref={buttonRef} className="rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:opacity-80 transition-opacity" onClick={() => toggleProfileMenu()}>
                                <img className="rounded-full w-12 h-12 p-1" src="https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg" />
                            </button>
                        )}
                </div>
                {showProfileMenu && (
                    <div ref={menuRef} className="right-0 top-14 absolute">
                        <ul className="w-[200px]">
                            <li className="bg-yellow-300 border-b-2 hover:opacity-80 transition-opacity hidden">
                                <button className="w-full h-8">Settings</button>
                            </li>
                            <li className="bg-yellow-300 hover:opacity-80 transition-opacity">
                                <button className="w-full h-8" onClick={() => userLogoutHandler()}>Logout</button>
                            </li>
                        </ul>
                    </div>
                )}
            </header>
            <div className="h-[45px]" /> {/* Same height as header */}
        </>
    )

}

export default Header;
