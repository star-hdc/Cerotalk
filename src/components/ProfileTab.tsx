/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post, UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { Bookmark, FileText, Settings, Heart, MessageSquare, Sparkles, LogOut } from 'lucide-react';
import HashtagText from './HashtagText';

interface ProfileTabProps {
  currentUser: UserProfile;
  posts: Post[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onToggleSave: (postId: string) => void;
  onSelectPost: (postId: string) => void;
  onLogout?: () => void;
}

export default function ProfileTab({
  currentUser,
  posts,
  onToggleLike,
  onAddComment,
  onToggleSave,
  onSelectPost,
  onLogout
}: ProfileTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my_posts' | 'saved'>('my_posts');

  // Filter posts authored by current active admin profile
  const myPosts = (posts || []).filter(p => p && (p.authorName === currentUser.name || p.authorUsername === currentUser.username));
  
  // Filter saved bookmarks
  const savedPosts = (posts || []).filter(p => p && p.saved);

  const displayedPosts = activeSubTab === 'my_posts' ? myPosts : savedPosts;

  return (
    <div id="profile-tab-box" className="space-y-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header Profile Panel */}
      <div className="bg-[#111318] rounded-2xl md:rounded-3xl border border-zinc-950 p-6 shadow-xl relative overflow-hidden">
        
        {/* Glow ambient accent vector */}
        <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#00bfb2]/10 blur-2xl pointer-events-none" />
        <span className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#ff9f1c]/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4 md:flex-row md:text-left md:space-y-0 md:space-x-6 md:items-start">
          
          {/* Large Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full p-[3px] bg-gradient-to-tr from-[#00bfb2] via-teal-500 to-[#ff9f1c]">
              <div className="h-full w-full rounded-full bg-[#0f1115] p-[3px]">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="h-full w-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#111318]" title="En línea" />
          </div>

          {/* Details & Stats */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-lg font-bold text-white">{currentUser.name}</h2>
                <span className="rounded bg-[#00bfb2]/10 border border-[#00bfb2]/20 px-1.5 py-0.5 font-sans text-[10px] font-bold text-[#00bfb2] uppercase tracking-wide">
                  {currentUser.role}
                </span>
              </div>
              <p className="font-sans text-xs text-zinc-500 mt-0.5">@{currentUser.username}</p>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-3 gap-6 bg-[#0a0c10] px-4 py-3 rounded-xl border border-zinc-950 max-w-sm mx-auto md:mx-0">
              <div className="text-center">
                <span className="block font-sans text-sm font-extrabold text-white">{myPosts.length}</span>
                <span className="font-sans text-[9px] text-zinc-500 uppercase tracking-wide">Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-sans text-sm font-extrabold text-white">{currentUser.followers.toLocaleString()}</span>
                <span className="font-sans text-[9px] text-zinc-500 uppercase tracking-wide">Seguidores</span>
              </div>
              <div className="text-center">
                <span className="block font-sans text-sm font-extrabold text-white">{currentUser.following.toLocaleString()}</span>
                <span className="font-sans text-[9px] text-zinc-500 uppercase tracking-wide">Seguidos</span>
              </div>
            </div>

            {/* Bio description */}
            <p className="font-sans text-xs text-zinc-400 max-w-md leading-relaxed">
              {currentUser.bio}
            </p>

            {onLogout && (
              <div className="pt-1 flex justify-center md:justify-start">
                <button
                  id="profile-logout-btn"
                  onClick={onLogout}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/20 px-3.5 py-1.5 rounded-xl font-sans text-[11px] font-bold text-red-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 2. SubTabs Bar */}
      <div className="flex items-center justify-between border-b border-zinc-950 pb-2">
        <div className="flex gap-4">
          <button 
            id="profile-tab-posts"
            onClick={() => setActiveSubTab('my_posts')}
            className={`font-sans text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
              activeSubTab === 'my_posts' 
                ? 'border-[#00bfb2] text-white' 
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Mis Publicaciones ({myPosts.length})
          </button>
          <button 
            id="profile-tab-saved"
            onClick={() => setActiveSubTab('saved')}
            className={`font-sans text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
              activeSubTab === 'saved' 
                ? 'border-[#00bfb2] text-white' 
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Guardados ({savedPosts.length})
          </button>
        </div>
      </div>

      {/* 3. Render contents */}
      {displayedPosts.length === 0 ? (
        <div id="profile-empty-panel" className="bg-[#111318] rounded-2xl border border-zinc-950 py-16 text-center flex flex-col items-center">
          <FileText className="h-10 w-10 text-zinc-700 stroke-1 mb-2" />
          <p className="font-sans text-sm font-semibold text-zinc-400">No hay publicaciones para mostrar</p>
          <p className="font-sans text-xs text-zinc-650 mt-1">
            {activeSubTab === 'my_posts' 
              ? 'Empieza creando una nueva publicación en la barra.'
              : 'Los posts que marques con la cinta se guardarán aquí.'}
          </p>
        </div>
      ) : (
        // Chronological List Layout Design
        <div id="profile-post-list" className="space-y-4">
          {displayedPosts.map((post) => {
            const savedCount = post.savedBy?.length || 0;

            return (
              <div 
                key={post.id}
                id={`list-post-item-${post.id}`}
                className="bg-[#111318] rounded-xl border border-zinc-950 p-4 relative"
              >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-sans text-xs font-bold text-white">{post.authorName}</h4>
                    <p className="font-sans text-[9px] text-zinc-500">@{post.authorUsername}</p>
                  </div>
                </div>
                <span className="font-sans text-[9px] text-zinc-650">{post.createdAt}</span>
              </div>

              <p className="font-sans text-xs text-zinc-300 ml-1.5 leading-relaxed truncate max-w-lg mb-2">
                <HashtagText text={post.content} />
              </p>

              {post.mediaType === 'image' && post.mediaUrl && (
                <div className="h-28 w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900 mt-2">
                  <img 
                    src={post.mediaUrl} 
                    alt="attachment" 
                    className="h-full w-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 pt-3.5 border-t border-zinc-950 text-[10px] font-sans text-zinc-505 text-zinc-500">
                <button 
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1 hover:text-[#00bfb2] ${post.likedByUser ? 'text-rose-500 font-semibold' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${post.likedByUser ? 'fill-rose-500' : ''}`} />
                  {post.likes} likes
                </button>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <MessageSquare className="h-4.5 w-4.5" />
                  {post.comments?.length || 0} comentarios
                </span>
                <button 
                  onClick={() => onToggleSave(post.id)}
                  className={`flex items-center gap-1 hover:text-[#ff9f1c] ${post.saved ? 'text-[#ff9f1c]' : ''}`}
                >
                  <Bookmark className="h-4 w-4" />
                  {savedCount} {savedCount === 1 ? 'guardado' : 'guardados'}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}

    </div>
  );
}
