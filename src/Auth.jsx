import axios from 'axios';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: '', password: '' });
    const [signupForm, setSignupForm] = useState({ name: '', hospital_name: '', email: '', phone_no: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const data = {
                username: form.username,
                password: form.password,
            }
            const response = await axios.post('https://trf-dashboard-bay.vercel.app/api/login-insert', data)
            if (response.data[0].status === 200) {
                Cookies.set('neovar_user', JSON.stringify(response.data[0].data), { expires: 7 });
                return window.location.reload();
            }
        }
        catch (error) {
            console.error('API error:', error.response.data[0].message);
        }
    };

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const handleSignupSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {
                name: signupForm.name,
                hospital_name: signupForm.org,
                email: signupForm.email,
                phone_no: signupForm.phone_no,
            }
            const response = axios.post('https://trf-dashboard-bay.vercel.app/api/request-insert', data)
            if (response.data[0].status === 200) {
                // alert('Request Submitted Successfully. You will receive username and password on your email.');
                toast.success('Request Submitted Successfully. You will receive username and password on your email.');
                setActiveTab('login');
            }
        }
        catch (error) {
            console.error('API error:', error);
        }
    };

    return (
        <div className="grid h-screen grid-cols-1 md:grid-cols-12">
            <div className="hidden md:block md:col-span-8">
                <img
                    src="/NEOM.png"
                    className="mt-[200px]"
                    alt="side image"
                />
            </div>
            {/* Tabs */}
            {/* Right Section */}
            <div className="col-span-1 md:col-span-4 bg-white p-5 md:p-10 flex flex-col justify-center items-center relative">
                {/* Image at Top-Left or Top-Right for Mobile View */}
                <div className="absolute top-2 left-2 md:hidden">
                    <img
                        src="/NEOM.png"
                        alt="side image"
                        width={100} // Adjust size for mobile
                        height={100}
                        className="object-contain"
                    />
                </div>
                <div className="flex mb-8">
                    <button
                        className={`px-6 py-2 rounded-t-lg font-bold focus:outline-none ${activeTab === 'login'
                            ? 'bg-orange-500 text-white'
                            : 'bg-transparent text-black'
                            }`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`px-6 py-2 rounded-t-lg font-bold focus:outline-none ml-2 ${activeTab === 'signup'
                            ? 'bg-orange-500 text-white'
                            : 'bg-transparent text-black'
                            }`}
                        onClick={() => setActiveTab('signup')}
                    >
                        SignUp
                    </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                    <form
                        className="w-full max-w-md flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <h2 className="text-2xl font-bold mb-2">LOGIN</h2>
                        <div>
                            <label className="block font-semibold mb-1">Username</label>
                            <input
                                className="w-full px-4 py-2 border rounded focus:outline-none"
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Password</label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2 border rounded focus:outline-none pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A10.05 10.05 0 0122 12c0 5.523-4.477 10-10 10a9.96 9.96 0 01-4.675-.938m1.45-1.45A9.96 9.96 0 0112 22c5.523 0 10-4.477 10-10 0-1.657-.336-3.236-.938-4.675" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded mt-2"
                        >
                            Submit
                        </button>
                        <div className="text-center text-sm mt-2">
                            Don't have Username and password?{' '}
                            <span
                                className="text-blue-600 underline cursor-pointer"
                                onClick={() => setActiveTab('signup')}
                            >
                                SignUp for Username and Password.
                            </span>
                        </div>
                    </form>
                )}

                {/* SignUp Form (optional, placeholder) */}
                {activeTab === 'signup' && (
                    <form
                        className="w-full max-w-md flex flex-col gap-4"
                        onSubmit={handleSignupSubmit}
                    >
                        <h2 className="text-2xl font-bold mb-2">SIGN UP</h2>
                        <div>
                            <label className="block font-semibold mb-1">Name</label>
                            <input
                                className="w-full px-4 py-2 border rounded focus:outline-none"
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={signupForm.name}
                                onChange={handleSignupChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Organization Name</label>
                            <input
                                className="w-full px-4 py-2 border rounded focus:outline-none"
                                type="text"
                                name="hospital_name"
                                placeholder="Organization Name"
                                value={signupForm.org}
                                onChange={handleSignupChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Email</label>
                            <input
                                className="w-full px-4 py-2 border rounded focus:outline-none"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={signupForm.email}
                                onChange={handleSignupChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Phone Number</label>
                            <input
                                className="w-full px-4 py-2 border rounded focus:outline-none"
                                type="tel"
                                name="phone_no"
                                placeholder="Phone Number"
                                value={signupForm.phone}
                                onChange={handleSignupChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded mt-2"
                        >
                            SignUp
                        </button>
                        <div className="text-center text-sm mt-2">
                            Already have an account?{' '}
                            <span
                                className="text-blue-600 underline cursor-pointer"
                                onClick={() => setActiveTab('login')}
                            >
                                Login to your account.
                            </span>
                        </div>
                    </form>
                )}
            </div>
            <ToastContainer/>
        </div>
    );

};

export default Auth;