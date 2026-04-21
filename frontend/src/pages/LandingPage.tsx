import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Zap, Shield, Smartphone } from 'lucide-react';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-brand-light font-sans text-brand-black selection:bg-brand-red selection:text-white flex flex-col">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-brand-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
                            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-red transition-colors">
                                sociozzmx.
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Features</a>
                            <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                            <Link to="/register">
                                <button className="bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(230,57,70,0.3)] hover:shadow-[0_0_25px_rgba(230,57,70,0.5)]">
                                    Get Started
                                </button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-300 hover:text-white focus:outline-none"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden absolute w-full bg-brand-black border-b border-white/10 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-4 pt-2 pb-6 space-y-2 shadow-2xl">
                        <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Features</a>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Login</Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                            <button className="w-full mt-4 bg-brand-red hover:bg-brand-red-dark text-white px-6 py-3 rounded-xl text-base font-semibold transition-colors">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-brand-black flex-grow flex items-center">
                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/20 blur-[120px] rounded-full opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-300 tracking-wide uppercase">Fast, Secure, Reliable</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8">
                        Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-[#ff7b85]">sociozzmx.</span>
                    </h1>

                    <p className="mt-4 text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
                        A premium chat platform designed for seamless, real-time communication. Connect instantly with uncompromising aesthetics.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-brand-red text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:bg-brand-red-dark shadow-[0_0_20px_rgba(230,57,70,0.4)] group">
                            Start Chatting Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-brand-light relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-4">Core Capabilities</h2>
                        <div className="w-20 h-1.5 bg-brand-red mx-auto rounded-full mb-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-1/2 bg-white/30 animate-[slide_2s_ease-in-out_infinite]"></div>
                        </div>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            Everything you need for seamless real-time interactions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-brand-red/30 transition-all duration-300 group hover:-translate-y-2">
                            <div className="w-14 h-14 bg-brand-red/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-red transition-colors duration-300">
                                <Zap className="w-7 h-7 text-brand-red group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-slate mb-3">Real-time Messaging</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Experience instant message delivery for seamless and continuous conversations without delay.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-brand-red/30 transition-all duration-300 group hover:-translate-y-2">
                            <div className="w-14 h-14 bg-brand-black/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-black transition-colors duration-300">
                                <Shield className="w-7 h-7 text-brand-black group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-slate mb-3">Secure Auth</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Robust user authentication ensuring your private messages remain strictly private.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-brand-red/30 transition-all duration-300 group hover:-translate-y-2">
                            <div className="w-14 h-14 bg-brand-red/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-red transition-colors duration-300">
                                <Smartphone className="w-7 h-7 text-brand-red group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-slate mb-3">Beautiful Experience</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Enjoy a premium design language and layout that looks amazing on any device size.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-brand-black py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            sociozzmx.
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm text-center">
                        © {new Date().getFullYear()} sociozzmx. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
