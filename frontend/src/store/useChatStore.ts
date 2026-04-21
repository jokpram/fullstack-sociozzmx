import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    username: string;
    fullName: string;
    status: 'ONLINE' | 'OFFLINE' | 'TYPING';
}

export interface ChatMessage {
    id?: number;
    senderId: string;
    recipientId?: string;
    groupId?: number;
    content: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE' | 'STATUS_UPDATE' | 'CALL';
    timestamp?: string;
}

export interface ChatGroup {
    id: number;
    name: string;
    creator: User;
    createdAt: string;
}

interface ChatState {
    currentUser: User | null;
    activeGroup: ChatGroup | null;
    allUsers: User[];
    groups: ChatGroup[];
    messages: ChatMessage[];
    activeChatTarget: string | null;

    setCurrentUser: (user: User | null) => void;
    setActiveGroup: (group: ChatGroup | null) => void;
    setAllUsers: (users: User[]) => void;
    setGroups: (groups: ChatGroup[]) => void;
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setActiveChatTarget: (targetUsername: string | null) => void;
    logout: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            currentUser: null,
            activeGroup: null,
            allUsers: [],
            groups: [], // Added groups
            messages: [],
            activeChatTarget: null,

            setCurrentUser: (user) => set({ currentUser: user }),
            setActiveGroup: (group) => set({ activeGroup: group, activeChatTarget: null }),
            setAllUsers: (users) => set({ allUsers: users }),
            setGroups: (groups) => set({ groups }), // Added setGroups
            addMessage: (message) => set((state) => ({
                // Only add if not duplicate by content and approximate time (for simplistic deduplication if needed) or better yet, rely on id.
                messages: [...state.messages, message]
            })),
            setMessages: (messages) => set({ messages }),
            setActiveChatTarget: (target) => set({ activeChatTarget: target, activeGroup: null }),
            logout: () => set({ currentUser: null, activeGroup: null, allUsers: [], groups: [], messages: [], activeChatTarget: null })
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({ currentUser: state.currentUser }),
        }
    )
);
