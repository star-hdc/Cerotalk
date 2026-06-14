/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  authorActorId?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorActorId?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  mediaType: 'image' | 'text';
  mediaUrl?: string;
  likes: number;
  likedByUser: boolean;
  comments: Comment[];
  shares: number;
  saved: boolean;
  createdAt: string;
  likedBy?: string[]; // List of userProfile IDs who liked this post
  savedBy?: string[]; // List of local/profile actor IDs who saved this post
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  userAvatar: string;
  mediaUrl: string;
  viewed: boolean;
  caption?: string;
}

export interface Message {
  id: string;
  senderId: 'user' | string; // 'user' represents the current user, or else the friend's ID
  text: string;
  timestamp: string;
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendUsername: string;
  lastMessage: string;
  unread: boolean;
  messages: Message[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'story';
  senderName: string;
  senderAvatar: string;
  detailText: string;
  isRead: boolean;
  timestamp: string;
  postId?: string;
}

export interface UserProfile {
  id: string; // 'user' (Mateo), 'valeee', 'diego', 'sofia', 'lulu'
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: string;
  followers: number;
  following: number;
}
