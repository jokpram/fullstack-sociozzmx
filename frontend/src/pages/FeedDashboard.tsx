import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useSocialStore } from '../store/useSocialStore';
import { postService, storyService, followService, userService, mediaService } from '../services/api';
import { LogOut, Hash, UserCircle, Menu, Image as ImageIcon, CheckCircle, Loader2, Settings, Compass, Camera as CameraIcon, Bookmark } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const FeedDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout, allUsers, setAllUsers } = useChatStore();
    const { posts, stories, followingUsernames, bookmarkedPostIds, setPosts, setStories, setFollowing, addPost, addStory, follow, unfollow, setBookmarks, toggleBookmarkState } = useSocialStore();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostFile, setNewPostFile] = useState<File | null>(null);
    const [newPostPreview, setNewPostPreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploadingStory, setIsUploadingStory] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraCaptureTarget, setCameraCaptureTarget] = useState<'post' | 'story' | null>(null);

    const postFileInputRef = useRef<HTMLInputElement>(null);
    const storyFileInputRef = useRef<HTMLInputElement>(null);

    const isVideoFile = (filename?: string) => {
        if (!filename) return false;
        return filename.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchSocialData = async () => {
            try {
                const [feedData, storiesData, followingData, usersData, bookmarksData] = await Promise.all([
                    postService.getFeed(currentUser.username),
                    storyService.getActiveStories(),
                    followService.getFollowing(currentUser.username),
                    userService.getAllUsers(),
                    postService.getBookmarks(currentUser.username)
                ]);

                setPosts(feedData);
                setStories(storiesData);
                setFollowing(followingData.map((u: any) => u.username));
                setAllUsers(usersData.filter((u: any) => u.username !== currentUser.username));
                setBookmarks(bookmarksData.map((b: any) => b.post.id));
            } catch (err) {
                console.error('Failed to load social feed', err);
            }
        };

        fetchSocialData();
    }, [currentUser, navigate]);

    const handleToggleBookmark = async (postId: number) => {
        try {
            await postService.toggleBookmark(postId, currentUser!.username);
            toggleBookmarkState(postId);
            if (bookmarkedPostIds.includes(postId)) {
                toast.success('Post removed from bookmarks');
            } else {
                toast.success('Post bookmarked');
            }
        } catch (error) {
            toast.error('Failed to toggle bookmark');
        }
    };

    const handlePostFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPostFile(file);
            setNewPostPreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() && !newPostFile) return;

        try {
            setIsPosting(true);
            let mediaUrl = undefined;

            if (newPostFile) {
                const uploadResponse = await mediaService.uploadMedia(newPostFile);
                mediaUrl = uploadResponse.fileDownloadUri;
            }

            const post = await postService.createPost({
                username: currentUser!.username,
                content: newPostContent,
                imageUrl: mediaUrl
            });
            addPost(post);
            setNewPostContent('');
            setNewPostFile(null);
            setNewPostPreview(null);
            if (postFileInputRef.current) postFileInputRef.current.value = '';
            toast.success('Post created!');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const uploadStory = async (file: File) => {
        try {
            setIsUploadingStory(true);
            toast.loading('Uploading story...', { id: 'story-upload' });

            const uploadResponse = await mediaService.uploadMedia(file);

            const story = await storyService.createStory({
                username: currentUser!.username,
                content: '',
                mediaUrl: uploadResponse.fileDownloadUri
            });
            addStory(story);
            toast.success('Story published!', { id: 'story-upload' });
        } catch (error) {
            toast.error('Failed to create story', { id: 'story-upload' });
        } finally {
            setIsUploadingStory(false);
            if (storyFileInputRef.current) storyFileInputRef.current.value = '';
        }
    };

    const handleCreateStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadStory(file);
    };

    const handleCameraCapture = async (file: File) => {
        setIsCameraOpen(false);
        if (cameraCaptureTarget === 'post') {
            setNewPostFile(file);
            setNewPostPreview(URL.createObjectURL(file));
        } else if (cameraCaptureTarget === 'story') {
            await uploadStory(file);
        }
        setCameraCaptureTarget(null);
    };

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
            // Refresh feed after follow/unfollow to show/hide their posts
            const feedData = await postService.getFeed(currentUser!.username);
            setPosts(feedData);
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

            {/* Camera Overlay */}
            {isCameraOpen && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => {
                        setIsCameraOpen(false);
                        setCameraCaptureTarget(null);
                    }}
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
                    <button onClick={() => navigate('/feed')} className="w-full px-4 py-2 flex items-center gap-3 transition-colors bg-white/10 border-r-2 border-brand-red text-white">
                        <Hash className="w-5 h-5 text-brand-red" />
                        <span className="font-medium">My Feed</span>
                    </button>
                    <button onClick={() => navigate(`/profile/${currentUser.username}`)} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">My Profile</span>
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

            {/* Main Feed Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white">
                {/* Header Navbar */}
                <div className="h-16 border-b border-gray-100 px-4 md:px-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
                    <button
                        className="p-2 text-brand-slate hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-brand-slate">Feed</h2>
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    {/* Stories Bar */}
                    <div className="w-full border-b border-gray-100 bg-gray-50/50 p-4 shrink-0 overflow-x-auto">
                        <div className="flex gap-4 max-w-3xl mx-auto px-2">
                            {/* Create Story */}
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <input
                                    type="file"
                                    ref={storyFileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleCreateStory}
                                />
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center relative bg-gray-50 overflow-hidden">
                                    <div className="w-full h-full flex flex-col">
                                        <button
                                            onClick={() => storyFileInputRef.current?.click()}
                                            className="flex-1 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200"
                                            title="Upload from device"
                                        >
                                            <ImageIcon className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCameraCaptureTarget('story');
                                                setIsCameraOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            title="Use camera"
                                        >
                                            <CameraIcon className="w-4 h-4 text-brand-red" />
                                        </button>
                                    </div>
                                    {isUploadingStory && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-brand-slate">Your Story</span>
                            </div>

                            {/* Active Stories */}
                            {stories.map(story => (
                                <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                                    <div className="w-16 h-16 rounded-full border-2 border-brand-red p-0.5">
                                        <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center uppercase text-xl font-bold text-gray-500">
                                            {story.mediaUrl ? (
                                                isVideoFile(story.mediaUrl) ? (
                                                    <video src={story.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={story.mediaUrl} alt="story" className="w-full h-full object-cover" />
                                                )
                                            ) : story.author.fullName.charAt(0)}
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-brand-slate truncate w-16 text-center">
                                        {story.author.username}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto w-full p-4 space-y-6 pb-20">
                        {/* Create Post Editor */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <form onSubmit={handleCreatePost}>
                                <input
                                    type="file"
                                    ref={postFileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    capture="environment"
                                    onChange={handlePostFileSelect}
                                />
                                <div className="p-4 border-b border-gray-100 flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red to-[#ff7b85] flex shrink-0 items-center justify-center text-white font-bold">
                                        {currentUser.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <textarea
                                        value={newPostContent}
                                        onChange={e => setNewPostContent(e.target.value)}
                                        placeholder="What's on your mind?"
                                        className="w-full min-h-[50px] resize-none outline-none pt-2 text-brand-slate placeholder:text-gray-400"
                                    />
                                </div>
                                {newPostPreview && (
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            {isVideoFile(newPostFile?.name) ? (
                                                <video src={newPostPreview} className="h-10 w-10 object-cover rounded" muted />
                                            ) : (
                                                <img src={newPostPreview} className="h-10 w-10 object-cover rounded" alt="preview" />
                                            )}
                                            <span className="text-gray-500 truncate max-w-[200px]">{newPostFile?.name}</span>
                                        </div>
                                        <button type="button" onClick={() => {
                                            setNewPostFile(null);
                                            setNewPostPreview(null);
                                            if (postFileInputRef.current) postFileInputRef.current.value = '';
                                        }} className="text-brand-red hover:underline">Remove</button>
                                    </div>
                                )}
                                <div className="p-3 bg-gray-50/50 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => postFileInputRef.current?.click()}
                                            className="text-gray-500 hover:text-brand-red flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Upload specific file"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-sm font-medium hidden sm:inline">Photo/Video</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCameraCaptureTarget('post');
                                                setIsCameraOpen(true);
                                            }}
                                            className="text-gray-500 hover:text-brand-red flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Use camera directly"
                                        >
                                            <CameraIcon className="w-5 h-5 text-brand-red" />
                                            <span className="text-sm font-medium hidden sm:inline text-brand-red">Camera</span>
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={(!newPostContent.trim() && !newPostFile) || isPosting}
                                        className="bg-brand-red flex items-center gap-2 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-brand-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Posts List */}
                        {posts.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No posts strictly available. Start following some users or write your own post!</p>
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
                                                    <CheckCircle className="w-4 h-4 text-brand-red" />
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

                                            <div className="mt-4 flex items-center gap-6 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleToggleBookmark(post.id)}
                                                    className="flex items-center gap-2 text-gray-500 hover:text-brand-red transition-colors"
                                                >
                                                    <Bookmark
                                                        className={`w-5 h-5 ${bookmarkedPostIds.includes(post.id) ? 'fill-brand-red text-brand-red' : ''}`}
                                                    />
                                                    <span className="text-sm font-medium">Save</span>
                                                </button>
                                            </div>
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

export default FeedDashboard;
