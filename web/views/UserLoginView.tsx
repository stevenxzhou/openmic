import { useState } from 'react';

const UserLoginView = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        // Handle login logic here
        console.log('Form submitted:', formData);
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
                        <a 
                            href="/" 
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLoginView;