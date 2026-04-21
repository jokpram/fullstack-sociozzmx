import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, User as UserIcon, BadgeInfo } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.register({ username, fullName, password });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light font-sans text-brand-black flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-shrink-0 items-center gap-2 cursor-pointer group mb-8">
                    <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-brand-black group-hover:text-brand-red transition-colors">
                        sociozzmx.
                    </span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-slate">
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-brand-red hover:text-brand-red-dark transition-colors">
                        sign in to existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BadgeInfo className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="focus:ring-brand-red focus:border-brand-red block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50 text-brand-black border outline-none transition-colors"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="focus:ring-brand-red focus:border-brand-red block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50 text-brand-black border outline-none transition-colors"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="focus:ring-brand-red focus:border-brand-red block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 bg-gray-50 text-brand-black border outline-none transition-colors"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-black transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5 shadow-lg'}`}
                            >
                                {isLoading ? 'Creating account...' : (
                                    <>
                                        Register
                                        <ArrowRight className="ml-2 h-5 w-5 text-brand-red" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
