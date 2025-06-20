import { ChangeEvent, FormEvent, useState } from "react";
import { signup } from '../api/user';
import { useGlobalContext } from "@/context/useGlobalContext";
import { useRouter } from 'next/navigation';
import Link from "next/link";

const UserSignupView = () => {

    const { user }  = useGlobalContext();
    const router = useRouter();

    if (user.authenticated) {
        router.push('/events');
    }

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rePassword:'',
        firstName: '',
        lastName: '',
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        signup(formData.email, formData.password, formData.firstName, formData.lastName);
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Card Container */}
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                    {/* Form Header */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Sign Up
                    </h2>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label 
                                    htmlFor="firstName" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    First Name
                                </label>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    id="firstName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                            focus:border-transparent"
                                    placeholder="John"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label 
                                    htmlFor="lastName" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Last Name
                                </label>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    id="lastName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                            focus:border-transparent"
                                    placeholder="Doe"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

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
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
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
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label 
                                htmlFor="confirmPassword" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                id="confirmPassword"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md
                                    hover:bg-yellow-700 focus:outline-none focus:ring-2 
                                    focus:ring-yellow-500 focus:ring-offset-2 
                                    transition duration-150 ease-in-out"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">Already have an account? </span>
                        <Link 
                            href="/login" 
                            className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserSignupView;