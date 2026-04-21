import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { userService, chatService, chatGroupService } from '../services/api';
import { connectWebSocket, disconnectWebSocket, sendGlobalMessage, sendPrivateMessage, sendGroupMessage, getSessionId } from '../services/websocket';
import { LogOut, Send, Users, MessageSquare, Hash, UserCircle, Phone, Video, Menu, Settings, Compass, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebRTC } from '../hooks/useWebRTC';
import { CallModal } from '../components/CallModal';

const ChatDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, allUsers, messages, activeChatTarget, activeGroup, groups, setAllUsers, setActiveChatTarget, setActiveGroup, setGroups, logout, setMessages } = useChatStore();
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { initiateCall, acceptCall, rejectCall, endCall } = useWebRTC();

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChatTarget, activeGroup]);

    // Fetch History when context switches
    useEffect(() => {
        if (!currentUser) return;

        const fetchHistory = async () => {
            try {
                if (activeGroup) {
                    const history = await chatService.getGroupHistory(activeGroup.id);
                    setMessages(history);
                } else if (activeChatTarget) {
                    const history = await chatService.getHistory(currentUser.username, activeChatTarget);
                    setMessages(history);
                } else {
                    const globalHistory = await chatService.getGlobalHistory();
                    setMessages(globalHistory);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            }
        };

        fetchHistory();
    }, [activeChatTarget, activeGroup, currentUser, setMessages]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        let isSubscribed = true;

        const initChat = async () => {
            // Wait for WebSocket connection
            connectWebSocket(currentUser, async () => {
                if (isSubscribed) {
                    setIsConnected(true);

                    try {
                        // Register user as connected in backend
                        await userService.connect(currentUser, getSessionId()!);

                        // Fetch all registered users and groups
                        const [users, userGroups] = await Promise.all([
                            userService.getAllUsers(),
                            chatGroupService.getUserGroups(currentUser.username)
                        ]);
                        setAllUsers(users.filter((u: any) => u.username !== currentUser.username));
                        setGroups(userGroups);
                    } catch (error) {
                        console.error('Failed to initialize user session or fetch users', error);
                    }
                }
            });
        };

        initChat();

        // Polling all users occasionally to update online status
        const interval = setInterval(async () => {
            if (isConnected) {
                try {
                    const [users, userGroups] = await Promise.all([
                        userService.getAllUsers(),
                        chatGroupService.getUserGroups(currentUser.username)
                    ]);
                    setAllUsers(users.filter((u: any) => u.username !== currentUser.username));
                    setGroups(userGroups);
                } catch (error) {
                    // Ignore errors during polling
                }
            }
        }, 10000);

        return () => {
            isSubscribed = false;
            clearInterval(interval);
            disconnectWebSocket(currentUser);
            userService.disconnect(currentUser).catch(console.error);
        };
    }, [currentUser, navigate, setAllUsers]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !currentUser) return;

        if (activeGroup) {
            sendGroupMessage(currentUser, activeGroup.id, inputMessage);
        } else if (activeChatTarget) {
            sendPrivateMessage(currentUser, activeChatTarget, inputMessage);
        } else {
            sendGlobalMessage(currentUser, inputMessage);
        }

        setInputMessage('');
    };

    const handleLogout = async () => {
        if (currentUser) {
            disconnectWebSocket(currentUser);
            try {
                await userService.disconnect(currentUser);
            } catch (e) {
                console.error('Disconnect error', e);
            }
            logout();
            toast.success('Successfully signed out');
            navigate('/login');
        }
    };

    const filteredMessages = messages.filter(m => {
        if (m.type === 'JOIN' || m.type === 'LEAVE') return true; // Show system messages

        if (activeGroup) {
            return m.groupId === activeGroup.id;
        } else if (activeChatTarget) {
            // Private chat between currentUser and activeChatTarget
            return !m.groupId && ((m.senderId === currentUser?.username && m.recipientId === activeChatTarget) ||
                (m.senderId === activeChatTarget && m.recipientId === currentUser?.username));
        } else {
            // Global channel
            return !m.groupId && !m.recipientId;
        }
    });

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim() || selectedMembers.length === 0) return;

        try {
            const newGroup = await chatGroupService.createGroup({
                name: newGroupName,
                creatorUsername: currentUser!.username,
                memberUsernames: [currentUser!.username, ...selectedMembers]
            });
            setGroups([...groups, newGroup]);
            setIsGroupModalOpen(false);
            setNewGroupName('');
            setSelectedMembers([]);
            setActiveGroup(newGroup);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            toast.success('Group created!');
        } catch (err) {
            toast.error('Failed to create group');
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex h-screen bg-brand-light font-sans text-brand-black overflow-hidden selection:bg-brand-red selection:text-white relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
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
                            <span className="text-xs text-brand-red">@{currentUser.username} • {isConnected ? 'Online' : 'Connecting...'}</span>
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
                    <button onClick={() => navigate('/chat')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors bg-white/10 border-r-2 border-brand-red text-white">
                        <UserCircle className="w-5 h-5 text-brand-red" />
                        <span className="font-medium">Messages</span>
                    </button>
                    <button onClick={() => navigate('/settings')} className="w-full px-4 py-2 mt-1 flex items-center gap-3 transition-colors hover:bg-white/5 text-gray-300">
                        <Settings className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Settings</span>
                    </button>

                    <div className="px-4 mt-8 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channels</span>
                    </div>
                    <button
                        onClick={() => { setActiveChatTarget(null); setActiveGroup(null); setIsSidebarOpen(false); }}
                        className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${!activeChatTarget && !activeGroup ? 'bg-white/10 border-r-2 border-brand-red text-white' : 'hover:bg-white/5'}`}
                    >
                        <Hash className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Global Chat</span>
                    </button>

                    <div className="px-4 mt-8 mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Groups
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                {groups.length}
                            </div>
                            <button onClick={() => setIsGroupModalOpen(true)} className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors" title="New Group">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">No groups yet.</div>
                    ) : (
                        groups.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => { setActiveGroup(group); setIsSidebarOpen(false); }}
                                className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${activeGroup?.id === group.id ? 'bg-white/10 border-r-2 border-brand-red text-white' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <div className="w-6 h-6 rounded bg-brand-red text-white flex items-center justify-center text-xs font-bold">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="font-medium text-sm truncate">{group.name}</span>
                                </div>
                            </button>
                        ))
                    )}

                    <div className="px-4 mt-8 mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Direct Messages
                        </span>
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {allUsers.length}
                        </div>
                    </div>

                    {allUsers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">No other users found.</div>
                    ) : (
                        allUsers.map((user) => (
                            <button
                                key={user.username}
                                onClick={() => { setActiveChatTarget(user.username); setIsSidebarOpen(false); }}
                                className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${activeChatTarget === user.username && !activeGroup ? 'bg-white/10 border-r-2 border-brand-red text-white' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <UserCircle className="w-6 h-6 text-gray-400" />
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-brand-black rounded-full ${user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                </div>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="font-medium text-sm truncate">{user.fullName}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-white/5 hover:bg-brand-red text-gray-300 hover:text-white transition-all duration-300"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                <CallModal onAccept={acceptCall} onReject={rejectCall} onEnd={endCall} />

                {/* Header */}
                <div className="h-16 md:h-20 border-b border-gray-100 px-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 -ml-2 text-brand-slate hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                            {activeGroup ? <Users className="w-5 h-5 text-brand-slate" /> : activeChatTarget ? <MessageSquare className="w-5 h-5 text-brand-slate" /> : <Hash className="w-5 h-5 text-brand-slate" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-brand-slate">
                                {activeGroup ? activeGroup.name : activeChatTarget ? allUsers.find(u => u.username === activeChatTarget)?.fullName || activeChatTarget : 'Global Chat'}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {activeGroup ? 'Group Chat' : activeChatTarget ? `@${activeChatTarget}` : 'Public channel for everyone'}
                            </p>
                        </div>
                    </div>

                    {/* Call Actions */}
                    {activeChatTarget && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => initiateCall(activeChatTarget, false)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-slate hover:text-brand-red hover:border-brand-red hover:bg-brand-red/5 transition-colors shadow-sm"
                                title="Audio Call"
                            >
                                <Phone className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => initiateCall(activeChatTarget, true)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-slate hover:text-brand-red hover:border-brand-red hover:bg-brand-red/5 transition-colors shadow-sm"
                                title="Video Call"
                            >
                                <Video className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
                            <p className="text-lg font-medium">No messages yet.</p>
                            <p className="text-sm">Be the first to say hello!</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, index) => {
                            const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE';
                            const isMe = msg.senderId === currentUser.username;

                            if (isSystem) {
                                return (
                                    <div key={index} className="flex justify-center my-4">
                                        <div className="bg-brand-light px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 border border-gray-100 shadow-sm">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            }

                            if (msg.type === 'CALL') {
                                return (
                                    <div key={index} className="flex justify-center my-6">
                                        <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold border border-gray-100 shadow-sm text-brand-slate">
                                            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-red">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            {msg.content}
                                            {msg.timestamp && (
                                                <span className="text-xs text-gray-400 font-normal ml-2">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-sm font-semibold text-brand-slate">
                                                {isMe ? 'You' : msg.senderId}
                                            </span>
                                            {msg.timestamp && (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className={`px-5 py-3 rounded-2xl shadow-sm border ${isMe
                                                ? 'bg-brand-red text-white border-transparent rounded-tr-sm shadow-[0_4px_14px_0_rgba(230,57,70,0.2)]'
                                                : 'bg-white text-brand-slate border-gray-100 rounded-tl-sm shadow-gray-200/50 hover:border-gray-200 transition-colors'
                                                }`}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap word-break">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={`Message ${activeGroup ? activeGroup.name : activeChatTarget ? '@' + activeChatTarget : 'Global Chat'}...`}
                            disabled={!isConnected}
                            className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all shadow-inner text-brand-slate placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || !isConnected}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-red hover:bg-brand-red-dark text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-red shadow-[0_2px_10px_0_rgba(230,57,70,0.3)] transform hover:-translate-y-1/2 hover:scale-105"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </form>
                </div>
            </div>
            {/* Group Creation Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-brand-slate">Create New Group</h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-brand-red transition-colors p-1 rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateGroup}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 pb-1">Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                                        placeholder="e.g. Dream Team"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 pb-2">Select Members</label>
                                    <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded">
                                        {allUsers.map(user => (
                                            <label key={user.username} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(user.username)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedMembers([...selectedMembers, user.username]);
                                                        else setSelectedMembers(selectedMembers.filter(m => m !== user.username));
                                                    }}
                                                    className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-brand-slate">{user.fullName}</span>
                                                    <span className="text-xs text-gray-500">@{user.username}</span>
                                                </div>
                                            </label>
                                        ))}
                                        {allUsers.length === 0 && <span className="text-sm text-gray-400">No other users available.</span>}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsGroupModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newGroupName.trim() || selectedMembers.length === 0}
                                        className="px-4 py-2 text-sm font-medium bg-brand-red text-white hover:bg-brand-red-dark rounded transition-colors disabled:opacity-50"
                                    >
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatDashboard;
