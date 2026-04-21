import axios from 'axios';
import type { User } from '../store/useChatStore';
import toast from 'react-hot-toast';

const API_V1 = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_V1,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Detect network errors unconditionally rather than failing silently or generically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Either Server is offline, or CORS completely blocked the request
            toast.error('Network connection issue. Make sure backend is running.', { id: 'network-err' });
        } else if (error.response.status >= 500) {
            toast.error('Internal Server Error from API Endpoint.', { id: 'server-err' });
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials: { username: string; password: string }) => {
        const response = await api.post<User>('/auth/login', credentials);
        return response.data;
    },
    register: async (credentials: { username: string; fullName: string; password: string }) => {
        const response = await api.post<User>('/auth/register', credentials);
        return response.data;
    },
    resetPassword: async (data: { username: string, newPassword: string }) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    }
};

export const userService = {
    connect: async (user: User, sessionId: string) => {
        const response = await api.post('/users/connect', user, {
            headers: { 'Session-Id': sessionId }
        });
        return response.data;
    },
    disconnect: async (user: User) => {
        const response = await api.post('/users/disconnect', user);
        return response.data;
    },
    getConnectedUsers: async () => {
        const response = await api.get('/users/connected');
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/users/all');
        return response.data;
    },
    changePassword: async (data: { username: string, oldPassword: string, newPassword: string }) => {
        const response = await api.post('/users/change-password', data);
        return response.data;
    },
    updateProfile: async (data: { username: string, fullName: string }) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },
    getUserProfile: async (username: string) => {
        const response = await api.get(`/users/profile/${username}`);
        return response.data;
    }
};

export const chatService = {
    getHistory: async (senderId: string, recipientId: string) => {
        const response = await api.get(`/chat/history/${senderId}/${recipientId}`);
        return response.data;
    },
    getGroupHistory: async (groupId: number) => {
        const response = await api.get(`/chat/history/group/${groupId}`);
        return response.data;
    },
    getGlobalHistory: async () => {
        const response = await api.get('/chat/history/global');
        return response.data;
    }
};

export const chatGroupService = {
    createGroup: async (data: { name: string, creatorUsername: string, memberUsernames: string[] }) => {
        const response = await api.post('/groups', data);
        return response.data;
    },
    getUserGroups: async (username: string) => {
        const response = await api.get(`/groups/user/${username}`);
        return response.data;
    },
    getGroupMembers: async (groupId: number) => {
        const response = await api.get(`/groups/${groupId}/members`);
        return response.data;
    }
};

export const postService = {
    createPost: async (payload: { username: string; content: string; imageUrl?: string }) => {
        const response = await api.post('/posts', payload);
        return response.data;
    },
    getAllPosts: async () => {
        const response = await api.get('/posts');
        return response.data;
    },
    getFeed: async (username: string) => {
        const response = await api.get(`/posts/feed/${username}`);
        return response.data;
    },
    toggleBookmark: async (postId: number, username: string) => {
        const response = await api.post(`/posts/${postId}/bookmark`, { username });
        return response.data;
    },
    getBookmarks: async (username: string) => {
        const response = await api.get(`/posts/bookmarks?username=${username}`);
        return response.data;
    }
};

export const storyService = {
    createStory: async (payload: { username: string; content: string; mediaUrl?: string }) => {
        const response = await api.post('/stories', payload);
        return response.data;
    },
    getActiveStories: async () => {
        const response = await api.get('/stories');
        return response.data;
    }
};

export const followService = {
    followUser: async (followerUsername: string, followingUsername: string) => {
        const response = await api.post('/follows/follow', { followerUsername, followingUsername });
        return response.data;
    },
    unfollowUser: async (followerUsername: string, followingUsername: string) => {
        const response = await api.post('/follows/unfollow', { followerUsername, followingUsername });
        return response.data;
    },
    getFollowers: async (username: string) => {
        const response = await api.get(`/follows/${username}/followers`);
        return response.data;
    },
    getFollowing: async (username: string) => {
        const response = await api.get(`/follows/${username}/following`);
        return response.data;
    },
    isFollowing: async (followerUsername: string, followingUsername: string) => {
        const response = await api.get(`/follows/check?follower=${followerUsername}&following=${followingUsername}`);
        return response.data;
    }
};

export const mediaService = {
    uploadMedia: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        // Do not set Content-Type to multipart/form-data manually, otherwise the boundary is lost
        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': undefined
            }
        });
        return response.data;
    }
};

export default api;
