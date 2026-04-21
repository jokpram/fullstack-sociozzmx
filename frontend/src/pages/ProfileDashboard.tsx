import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useSocialStore } from '../store/useSocialStore';
import { userService, followService, postService } from '../services/api';
import { LogOut, Hash, UserCircle, Menu, Settings, Compass, Grid, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
    user: {
        username: string;
        fullName: string;
    };
    followersCount: number;
    followingCount: number;
    postsCount: number;
    posts: any[];
    activeStories: any[];
}

const ProfileDashboard = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { currentUser, logout } = useChatStore();
    const { followingUsernames, follow, unfollow } = useSocialStore();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
    const [isSavingLoading, setIsSavingLoading] = useState(false);

    const isOwnProfile = !username || (currentUser && username === currentUser.username);
    const targetUsername = username || currentUser?.username;

    useEffect(() => {
        if (!currentUser) return;

        const loadProfile = async () => {
            if (!targetUsername) return;
            try {
                setIsLoading(true);
                const profileData = await userService.getUserProfile(targetUsername);
                setProfile(profileData);

                if (isOwnProfile) {
                    setIsSavingLoading(true);
                    const bookmarked = await postService.getBookmarks(currentUser.username);
                    setSavedPosts(bookmarked.map((b: any) => b.post));
                    setIsSavingLoading(false);
                }
            } catch (err) {
                toast.error('Failed to load profile');
                navigate('/feed');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [targetUsername, currentUser, navigate, isOwnProfile]);

    const handleToggleFollow = async () => {
        if (!targetUsername || !currentUser) return;
        const isFollowing = followingUsernames.includes(targetUsername);
        try {
            if (isFollowing) {
                await followService.unfollowUser(currentUser.username, targetUsername);
                unfollow(targetUsername);
                setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
                toast.success(`Unfollowed @${targetUsername}`);
            } else {
                await followService.followUser(currentUser.username, targetUsername);
                follow(targetUsername);
                setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
                toast.success(`Following @${targetUsername}`);
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading || !profile) {
        return (
            <div className="flex bg-gray-50 h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    const isVideoFile = (filename?: string) => {
        if (!filename) return false;
        return filename.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
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
                        <span className="text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/feed')}>
                            sociozzmx.
                        </span>
                    </div>
                </div>

                <div className="p-4 border-b border-white/10 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-[50px] rounded-full pointer-events-none transition-all duration-500"></div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider relative z-10">Logged in as</span>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-[#ff7b85] flex items-center justify-center text-white font-bold shadow-md cursor-pointer" onClick={() => navigate('/profile')}>
                            {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/profile')}>
                            <span className="text-white font-medium">{currentUser.fullName}</span>
                            <span className="text-xs text-brand-red">@{currentUser.username}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="px-4 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</span>
                    </div>
                    <button onClick={() => navigate('/feed')} className="w-full px-4 py-2 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">My Feed</span>
                    </button>
                    <button onClick={() => navigate('/explore')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Compass className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Explore</span>
                    </button>
                    <button onClick={() => navigate('/chat')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Messages</span>
                    </button>
                    <button onClick={() => navigate('/settings')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Settings className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Settings</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className={`w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors ${isOwnProfile ? 'bg-white/10 border-r-2 border-brand-red text-white' : 'hover:bg-white/5 text-gray-300'}`}>
                        <UserCircle className={`w-5 h-5 ${isOwnProfile ? 'text-brand-red' : 'text-gray-400'}`} />
                        <span className="font-medium">Profile</span>
                    </button>
                </div>

                <div className="p-4 border-t border-white/10">
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-white/5 hover:bg-brand-red text-gray-300 hover:text-white transition-all duration-300">
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-white">
                <div className="h-16 border-b border-gray-100 px-4 md:px-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
                    <button
                        className="p-2 text-brand-slate hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-brand-slate">{profile.user.username}</h2>
                </div>

                <div className="max-w-4xl mx-auto w-full pb-20">
                    {/* Profile Header */}
                    <div className="p-6 md:p-10 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16">
                            {/* Avatar & Story Ring */}
                            <div className="shrink-0 relative">
                                <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full p-1 ${profile.activeStories.length > 0 ? 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]' : 'bg-gray-200'}`}>
                                    <div className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden uppercase text-4xl md:text-6xl font-black text-gray-800 shadow-sm">
                                        {profile.user.fullName.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <h1 className="text-2xl md:text-3xl font-bold text-brand-slate leading-none">
                                        {profile.user.username}
                                    </h1>
                                    {!isOwnProfile ? (
                                        <button
                                            onClick={handleToggleFollow}
                                            className={`px-6 py-1.5 rounded-lg font-bold text-sm transition-colors ${followingUsernames.includes(targetUsername!) ? 'bg-gray-100 text-brand-slate hover:bg-gray-200' : 'bg-brand-red text-white hover:bg-brand-red-dark'}`}
                                        >
                                            {followingUsernames.includes(targetUsername!) ? 'Following' : 'Follow'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/settings')}
                                            className="px-6 py-1.5 rounded-lg font-bold text-sm bg-gray-100 text-brand-slate hover:bg-gray-200 transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-6 text-brand-slate">
                                    <span className="text-base"><strong className="font-bold">{profile.postsCount}</strong> posts</span>
                                    <span className="text-base"><strong className="font-bold">{profile.followersCount}</strong> followers</span>
                                    <span className="text-base"><strong className="font-bold">{profile.followingCount}</strong> following</span>
                                </div>

                                <div>
                                    <h2 className="font-bold text-base text-brand-slate">{profile.user.fullName}</h2>
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">Welcome to my profile! ✨</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center border-b border-gray-100">
                        <button
                            className={`flex items-center gap-2 px-6 py-4 border-t-2 uppercase text-xs font-bold tracking-widest transition-colors ${activeTab === 'posts' ? 'border-brand-slate text-brand-slate' : 'border-transparent text-gray-400 hover:text-brand-slate'}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            <Grid className="w-4 h-4" /> Posts
                        </button>
                        {isOwnProfile && (
                            <button
                                className={`flex items-center gap-2 px-6 py-4 border-t-2 uppercase text-xs font-bold tracking-widest transition-colors ${activeTab === 'saved' ? 'border-brand-slate text-brand-slate' : 'border-transparent text-gray-400 hover:text-brand-slate'}`}
                                onClick={() => setActiveTab('saved')}
                            >
                                <Bookmark className="w-4 h-4" /> Saved
                            </button>
                        )}
                    </div>

                    {/* Grid Content */}
                    <div className="p-1">
                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-3 gap-1 md:gap-2">
                                {profile.posts.length === 0 ? (
                                    <div className="col-span-3 text-center py-20 text-gray-500 font-medium">No posts yet</div>
                                ) : (
                                    profile.posts.map(post => (
                                        <div key={post.id} className="aspect-square bg-gray-100 relative group overflow-hidden">
                                            {post.imageUrl ? (
                                                isVideoFile(post.imageUrl) ? (
                                                    <video src={post.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="post" />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-4">
                                                    <p className="text-xs md:text-sm text-gray-500 text-center line-clamp-4">{post.content}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && isOwnProfile && (
                            <div className="grid grid-cols-3 gap-1 md:gap-2">
                                {isSavingLoading ? (
                                    <div className="col-span-3 text-center py-20"><div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div></div>
                                ) : savedPosts.length === 0 ? (
                                    <div className="col-span-3 text-center py-20 text-gray-500 font-medium">No saved posts</div>
                                ) : (
                                    savedPosts.map(post => (
                                        <div key={post.id} className="aspect-square bg-gray-100 relative group overflow-hidden">
                                            {post.imageUrl ? (
                                                isVideoFile(post.imageUrl) ? (
                                                    <video src={post.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="post" />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-4">
                                                    <p className="text-xs md:text-sm text-gray-500 text-center line-clamp-4">{post.content}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
