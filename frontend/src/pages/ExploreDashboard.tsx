import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useSocialStore } from '../store/useSocialStore';
import { postService, followService, userService } from '../services/api';
import { LogOut, Hash, UserCircle, Menu, Compass, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ExploreDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout, allUsers, setAllUsers } = useChatStore();
    const { posts, followingUsernames, setPosts, setFollowing, follow, unfollow } = useSocialStore();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isLoading, setIsLoading] = useState(true);

    const isVideoFile = (filename?: string) => {
        if (!filename) return false;
        return filename.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchExploreData = async () => {
            try {
                setIsLoading(true);
                // For explore, we fetch ALL POSTS regardless of following
                const [allPostsData, followingData, usersData] = await Promise.all([
                    postService.getAllPosts(),
                    followService.getFollowing(currentUser.username),
                    userService.getAllUsers()
                ]);

                // Filter out current user's own posts if they don't want to see them in Explore,
                // but let's show everything for now as global explore usually does.
                setPosts(allPostsData);
                setFollowing(followingData.map((u: any) => u.username));
                setAllUsers(usersData.filter((u: any) => u.username !== currentUser.username));
            } catch (err) {
                console.error('Failed to load explore feed', err);
                toast.error('Failed to load posts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExploreData();
    }, [currentUser, navigate]);

    const toggleFollow = async (targetUsername: string) => {
        try {
            if (followingUsernames.includes(targetUsername)) {
                await followService.unfollowUser(currentUser!.username, targetUsername);
                unfollow(targetUsername);
                toast.success(`Unfollowed @${targetUsername}`);
            } else {
                await followService.followUser(currentUser!.username, targetUsername);
                follow(targetUsername);
                toast.success(`Following @${targetUsername}`);
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (!currentUser) return null;

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
                    <button
                        onClick={() => navigate(`/profile/${currentUser.username}`)}
                        className="flex items-center gap-3 relative z-10 hover:bg-white/5 p-2 rounded -mx-2 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-[#ff7b85] flex items-center justify-center text-white font-bold shadow-md">
                            {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{currentUser.fullName}</span>
                            <span className="text-xs text-brand-red">@{currentUser.username}</span>
                        </div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="px-4 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</span>
                    </div>
                    <button onClick={() => navigate('/feed')} className="w-full px-4 py-2 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Hash className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">My Feed</span>
                    </button>
                    <button onClick={() => navigate(`/profile/${currentUser.username}`)} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">My Profile</span>
                    </button>
                    <button onClick={() => navigate('/explore')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors bg-white/10 border-r-2 border-brand-red text-white">
                        <Compass className="w-5 h-5 text-brand-red" />
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

                    <div className="px-4 mt-8 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Discover Users</span>
                    </div>
                    {allUsers.map((user) => {
                        const isFollowing = followingUsernames.includes(user.username);
                        return (
                            <div key={user.username} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex shrink-0 items-center justify-center uppercase text-xs font-bold text-white">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-sm truncate text-white">{user.fullName}</span>
                                        <span className="text-xs text-brand-red truncate">@{user.username}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleFollow(user.username)}
                                    className={`shrink-0 ml-2 text-xs px-2 py-1 rounded font-medium transition-colors ${isFollowing ? 'bg-white/10 text-white hover:bg-brand-red hover:text-white' : 'bg-brand-red text-white hover:bg-brand-red/90'
                                        }`}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10">
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-white/5 hover:bg-brand-red text-gray-300 hover:text-white transition-all duration-300">
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Explore Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white">
                <div className="h-16 border-b border-gray-100 px-4 md:px-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
                    <button
                        className="p-2 text-brand-slate hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-brand-slate flex items-center gap-2">
                        <Compass className="w-6 h-6 text-brand-red" />
                        Explore Global Posts
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto w-full p-4 space-y-6 pb-20">
                    <div className="max-w-2xl mx-auto w-full space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Compass className="w-12 h-12 text-brand-red animate-spin mb-4" />
                                <p>Discovering new content...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No public posts available yet.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4 flex items-start gap-4">
                                        <button
                                            onClick={() => navigate(`/profile/${post.author.username}`)}
                                            className="w-12 h-12 rounded-full bg-gray-800 flex shrink-0 items-center justify-center text-white font-bold uppercase text-lg shadow-sm hover:ring-2 hover:ring-brand-red/50 transition-all"
                                        >
                                            {post.author.fullName.charAt(0)}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/profile/${post.author.username}`)}
                                                        className="font-bold text-brand-slate text-base hover:underline text-left"
                                                    >
                                                        {post.author.fullName}
                                                    </button>
                                                    {post.author.username === currentUser.username && (
                                                        <span className="bg-brand-light text-brand-red text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>
                                                    )}
                                                    {post.author.username !== currentUser.username && (
                                                        <button
                                                            onClick={() => toggleFollow(post.author.username)}
                                                            className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${followingUsernames.includes(post.author.username) ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white'}`}
                                                        >
                                                            {followingUsernames.includes(post.author.username) ? 'Following' : 'Follow'}
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-400 font-medium">
                                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${post.author.username}`)}
                                                className="text-gray-500 text-sm mb-3 hover:text-brand-red transition-colors text-left"
                                            >
                                                @{post.author.username}
                                            </button>

                                            <p className="text-brand-slate leading-relaxed whitespace-pre-wrap mb-4">
                                                {post.content}
                                            </p>

                                            {post.imageUrl && (
                                                <div className="mt-3 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                                    {isVideoFile(post.imageUrl) ? (
                                                        <video src={post.imageUrl} controls className="w-full max-h-[500px] object-cover bg-black" />
                                                    ) : (
                                                        <img src={post.imageUrl} alt="post" className="w-full max-h-[500px] object-cover" loading="lazy" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreDashboard;
