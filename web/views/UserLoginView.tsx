import { useState } from 'react';
import { login } from '../api/user';
import { useGlobalContext, ActionType } from '@/context/useGlobalContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const UserLoginView = () => {
    const { user }  = useGlobalContext();
    const router = useRouter();

    if (user.authenticated) {
        router.push('/events');
    }

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { dispatch } = useGlobalContext();

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        // Handle login logic here
        try {
            const loginData = await login(formData.email, formData.password);
            dispatch({ type: ActionType.SET_USER, payload: { first_name: loginData.first_name, authenticated: true, email: loginData.email, exp: loginData.exp, role: loginData.role } });
            router.push('/events');
        } catch (error) {
            // Display error message on the login page
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Card Container */}
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                    {/* Form Header */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Login
                    </h2>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        focus:border-transparent"
                                placeholder="your@email.com"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        focus:border-transparent"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
                                    hover:bg-blue-700 focus:outline-none focus:ring-2 
                                    focus:ring-blue-500 focus:ring-offset-2 
                                    transition duration-150 ease-in-out"
                        >
                            Login
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">Don't have an account? </span>
                        <Link 
                            href="/signup" 
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Sign up
                        </Link>
                    </div>
                    <div className="mt-2 text-center">
                        <Link
                            href="/events"
                            className="text-sm text-gray-500 hover:text-blue-600 underline"
                        >
                            Continue as guest
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLoginView;