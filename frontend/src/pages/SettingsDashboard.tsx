import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { userService } from '../services/api';
import { Settings, LogOut, Hash, UserCircle, Menu, User, Lock, Save, Compass, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const SettingsDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout, setCurrentUser } = useChatStore();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const updatedUser = await userService.updateProfile({
                username: currentUser.username,
                fullName
            });
            setCurrentUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return;

        try {
            setIsUpdating(true);
            await userService.changePassword({
                username: currentUser.username,
                oldPassword,
                newPassword
            });
            setOldPassword('');
            setNewPassword('');
            toast.success('Password changed successfully');
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to change password');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-brand-black overflow-hidden selection:bg-brand-red selection:text-white relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Responsive Sidebar */}
            <div className={`fixed md:relative z-30 w-80 h-full bg-brand-black text-gray-300 flex flex-col border-r border-white/10 shrink-0 transform transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:-ml-80'}`}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            sociozzmx.
                        </span>
                    </div>
                </div>

                <div className="p-4 border-b border-white/10 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-red/20 transition-all duration-500"></div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider relative z-10">Logged in as</span>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-[#ff7b85] flex items-center justify-center text-white font-bold shadow-md">
                            {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{currentUser.fullName}</span>
                            <span className="text-xs text-brand-red">@{currentUser.username}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="px-4 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("Navigation")}</span>
                    </div>
                    <button onClick={() => navigate('/feed')} className="w-full px-4 py-2 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{t("My Feed")}</span>
                    </button>
                    <button onClick={() => navigate('/explore')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Compass className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{t("Explore")}</span>
                    </button>
                    <button onClick={() => navigate('/chat')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{t("Messages")}</span>
                    </button>
                    <button onClick={() => navigate('/settings')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors bg-white/10 border-r-2 border-brand-red text-white">
                        <Settings className="w-5 h-5 text-brand-red" />
                        <span className="font-medium">{t("Settings")}</span>
                    </button>
                </div>

                <div className="p-4 border-t border-white/10">
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-white/5 hover:bg-brand-red text-gray-300 hover:text-white transition-all duration-300">
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">{t("Sign Out")}</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-gray-50">
                <div className="h-16 border-b border-gray-100 px-4 md:px-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
                    <button
                        className="p-2 text-brand-slate hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-brand-slate flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-400" /> Settings
                    </h2>
                </div>

                <div className="max-w-2xl mx-auto w-full p-6 space-y-8">
                    {/* Profile Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <User className="w-6 h-6 text-brand-red" />
                            <h3 className="text-lg font-bold text-brand-slate">Personal Profile</h3>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-slate mb-1">Username (Read-only)</label>
                                <input
                                    type="text"
                                    value={currentUser.username}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-slate mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-brand-slate"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdating || fullName === currentUser.fullName || !fullName.trim()}
                                    className="bg-brand-red text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-red-dark transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <Lock className="w-6 h-6 text-brand-red" />
                            <h3 className="text-lg font-bold text-brand-slate">Change Password</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-slate mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-brand-slate"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-slate mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-brand-slate"
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdating || !oldPassword || !newPassword}
                                    className="bg-brand-red text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-red-dark transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    <Lock className="w-4 h-4" /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Language Settings Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <Globe className="w-6 h-6 text-brand-red" />
                            <h3 className="text-lg font-bold text-brand-slate">Language Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-slate mb-1">Select Language</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all text-brand-slate appearance-none bg-white"
                                    value={i18n.language}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                >
                                    <option value="en">English</option>
                                    <option value="id">Indonesian (Bahasa Indonesia)</option>
                                    <option value="fr">French (Français)</option>
                                    <option value="it">Italian (Italiano)</option>
                                    <option value="ar">Arabic (العربية)</option>
                                    <option value="es">Spanish (Español)</option>
                                    <option value="ru">Russian (Русский)</option>
                                    <option value="ja">Japanese (日本語)</option>
                                    <option value="tr">Turkish (Türkçe)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsDashboard;
