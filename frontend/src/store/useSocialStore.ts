import { create } from 'zustand';

export interface Post {
    id: number;
    author: {
        id: number;
        username: string;
        fullName: string;
    };
    content: string;
    imageUrl?: string;
    createdAt: string;
}

export interface Story {
    id: number;
    author: {
        id: number;
        username: string;
        fullName: string;
    };
    content: string;
    mediaUrl?: string;
    createdAt: string;
    expiresAt: string;
}

export interface SocialState {
    posts: Post[];
    stories: Story[];
    followingUsernames: string[];
    bookmarkedPostIds: number[];

    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;

    setStories: (stories: Story[]) => void;
    addStory: (story: Story) => void;

    setFollowing: (usernames: string[]) => void;
    follow: (username: string) => void;
    unfollow: (username: string) => void;

    setBookmarks: (postIds: number[]) => void;
    toggleBookmarkState: (postId: number) => void;
}

export const useSocialStore = create<SocialState>((set) => ({

    posts: [],
    stories: [],
    followingUsernames: [],
    bookmarkedPostIds: [],

    setPosts: (posts) => set({ posts }),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

    setStories: (stories) => set({ stories }),
    addStory: (story) => set((state) => ({ stories: [story, ...state.stories] })),

    setFollowing: (usernames) => set({ followingUsernames: usernames }),
    follow: (username) => set((state) => ({ followingUsernames: [...state.followingUsernames, username] })),
    unfollow: (username) => set((state) => ({ followingUsernames: state.followingUsernames.filter(u => u !== username) })),

    setBookmarks: (postIds) => set({ bookmarkedPostIds: postIds }),
    toggleBookmarkState: (postId) => set((state) => ({
        bookmarkedPostIds: state.bookmarkedPostIds.includes(postId)
            ? state.bookmarkedPostIds.filter(id => id !== postId)
            : [...state.bookmarkedPostIds, postId]
    }))
}));
