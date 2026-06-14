/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post, Story, UserProfile } from '../types';
import { Heart, MessageSquare, Repeat2, Bookmark, Send, Sparkles, AlertCircle, Share2, Copy, Camera, X, Trash2 } from 'lucide-react';
import HashtagText from './HashtagText';

interface FeedSectionProps {
  posts: Post[];
  stories: Story[];
  currentUser: UserProfile;
  profiles: UserProfile[];
  onPlayStory: (index: number) => void;
  onAddStory: (userId: string, mediaUrl: string, caption: string) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onToggleSave: (postId: string) => void;
  onSharePost: (postId: string) => void;
  isAdminMode?: boolean;
  onDeletePost?: (postId: string) => void;
}

export default function FeedSection({
  posts,
  stories,
  currentUser,
  profiles,
  onPlayStory,
  onAddStory,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onToggleSave,
  onSharePost,
  isAdminMode = false,
  onDeletePost
}: FeedSectionProps) {
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [recommendedPostId, setRecommendedPostId] = useState<string | null>(null);
  const [shareActivePostId, setShareActivePostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Story Creator States
  const [isOpenAddStoryModal, setIsOpenAddStoryModal] = useState(false);
  const [addStoryUserId, setAddStoryUserId] = useState(currentUser?.id || 'user');
  const [addStoryCaption, setAddStoryCaption] = useState('');
  const [addStoryMediaUrl, setAddStoryMediaUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');

  const handleSendComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    onAddComment(postId, content);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCopyLink = (postId: string) => {
    // Simulate copy link
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  return (
    <div id="feed-section-container" className="space-y-6 pb-24">
      {/* 1. STORIES SECTION ("Historias") */}
      <div id="historias-component" className="bg-[#111318]/40 md:rounded-2xl p-4 border-b md:border border-zinc-950">
        <div className="flex items-center justify-between mb-3.5">
          <h3 id="historias-header-label" className="font-sans text-sm font-bold text-white tracking-wide">
            Historias
          </h3>
          <button 
            type="button"
            onClick={() => {
              setAddStoryUserId(currentUser?.id || 'user');
              setAddStoryCaption('');
              setAddStoryMediaUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
              setIsOpenAddStoryModal(true);
            }}
            className="font-sans text-xs font-bold text-[#00bfb2] hover:text-teal-400 cursor-pointer flex items-center gap-1 transition-all"
          >
            <span>+ Crear Historia</span>
          </button>
        </div>

        {/* Stories Horizontal Scrolling list */}
        <div 
          id="stories-scroll-box"
          className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none snap-x"
        >
          {/* ALWAYS render Tu historia at the very start as a shortcut if no story exists for Current User */}
          {!(stories || []).some(s => s && s.userId === currentUser?.id) && (
            <div 
              id="add-your-first-story-circle"
              onClick={() => {
                setAddStoryUserId(currentUser?.id || 'user');
                setAddStoryCaption('');
                setAddStoryMediaUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
                setIsOpenAddStoryModal(true);
              }}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer snap-start transition-transform active:scale-95 group"
            >
              <div className="relative h-16 w-16 rounded-full p-[2px] bg-zinc-950 border border-zinc-900 shadow-inner flex items-center justify-center">
                <img 
                  src={currentUser?.avatar} 
                  alt="Añadir historia" 
                  className="h-full w-full rounded-full object-cover group-hover:brightness-90 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#00bfb2] border-2 border-[#111318] text-white font-sans text-xs font-bold">
                  +
                </span>
              </div>
              <span className="font-sans text-[11px] text-zinc-400 mt-1.5 max-w-[70px] truncate block text-center">
                Tu historia
              </span>
            </div>
          )}

          {/* Render active stories */}
          {stories && stories.length > 0 ? (
            stories.map((story, index) => {
              const isUser = story.userId === currentUser?.id;
              
              return (
                <div 
                  key={story.id}
                  id={`story-icon-${story.id}`}
                  onClick={() => onPlayStory(index)}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer snap-start transition-transform active:scale-95 group"
                >
                  {/* Image Border Rings */}
                  <div className="relative">
                    {isUser ? (
                      // Current user's avatar circle with the check indicator showing they already have active story page
                      <div className="relative h-16 w-16 rounded-full p-[2px] bg-zinc-950 border border-zinc-900">
                        <img 
                          src={story.userAvatar} 
                          alt="Tu historia" 
                          className="h-full w-full rounded-full object-cover group-hover:brightness-90 transition-all ring-2 ring-[#00bfb2]/60"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#00bfb2] border-2 border-[#111318] text-white font-sans text-[10px] font-bold">
                          ✓
                        </span>
                      </div>
                    ) : (
                      // Gradient borders for characters
                      <div className="h-16 w-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#ff9f1c] via-[#ff5a5a] to-[#00bfb2] transition-transform duration-300 group-hover:rotate-12">
                        <div className="h-full w-full rounded-full bg-[#0f1115] p-[2px]">
                          <img 
                            src={story.userAvatar} 
                            alt={story.displayName} 
                            className="h-full w-full rounded-full object-cover transition-all duration-250 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Display Name text truncate */}
                  <span 
                    id={`story-name-${story.id}`}
                    className="font-sans text-[11px] text-zinc-300 mt-1.5 max-w-[70px] truncate block text-center"
                  >
                    {isUser ? 'Tu historia' : story.displayName}
                  </span>
                </div>
              );
            })
          ) : (
            // Small message if they cleared everything
            <div className="flex-1 py-1 text-left select-none">
              <span className="font-sans text-[11px] text-zinc-500 italic block">No hay historias activas. ¡Crea una para representarlos! 📷</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. POSTS FEED LIST */}
      <div id="posts-feed-list" className="space-y-6">
        {(posts || []).map((post) => {
          const isCommentsOpen = activeCommentPostId === post.id;
          const isShareOpen = shareActivePostId === post.id;
          const savedCount = post.savedBy?.length || 0;

          return (
            <div 
              key={post.id}
              id={`post-card-${post.id}`}
              className="bg-[#111318] rounded-2xl md:rounded-3xl border border-zinc-950 shadow-lg overflow-hidden transition-all hover:bg-[#111318]/90"
            >
              {/* Card Header Profile Details */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-b from-zinc-950/25 to-transparent">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-sans text-sm font-bold text-white transition-colors hover:text-[#00bfb2] cursor-pointer">
                      {post.authorName}
                    </h4>
                    <p className="font-sans text-[11px] text-zinc-500">
                      @{post.authorUsername}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-sans text-[10px] text-zinc-600">{post.createdAt}</span>
                  {post.authorName !== "Mateo Momoa" && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" title="Activo ahora" />
                  )}
                  {isAdminMode && onDeletePost && (
                    <div className="flex items-center gap-1 ml-1">
                      {deletingPostId === post.id ? (
                        <div className="flex items-center gap-1 bg-red-950/60 border border-red-500/30 rounded-lg p-0.5 animate-fade-in">
                          <span className="font-sans text-[9px] text-red-300 font-bold px-1.5 select-none">¿Borrar?</span>
                          <button
                            id={`confirm-delete-${post.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePost(post.id);
                              setDeletingPostId(null);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                            title="Descartar publicación"
                          >
                            Sí
                          </button>
                          <button
                            id={`cancel-delete-${post.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPostId(null);
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-sans text-[10px] sm:text-xs px-2 py-0.5 rounded cursor-pointer transition-colors"
                            title="Conservar"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`delete-post-${post.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPostId(post.id);
                          }}
                          className="rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-100 p-1.5 border border-red-500/20 transition-all cursor-pointer flex items-center justify-center"
                          title="Eliminar publicación (Solo Admin)"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Main Text Content */}
              <div className="px-4 py-1.5">
                <p className="font-sans text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  <HashtagText text={post.content} />
                </p>
              </div>

              {/* Card Image Banner */}
              {post.mediaType === 'image' && post.mediaUrl && (
                <div 
                  id={`post-image-box-${post.id}`}
                  className="relative mt-3 max-h-[380px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center border-y border-zinc-900 group"
                >
                  <img 
                    src={post.mediaUrl} 
                    alt="Post attachments" 
                    className="w-full max-h-[380px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Actions Footer Bar */}
              <div className="grid grid-cols-4 border-t border-zinc-950 bg-gradient-to-t from-zinc-950/15 to-transparent py-1 select-none">
                
                {/* 1. Me Gusta / Like */}
                <button 
                  id={`btn-like-${post.id}`}
                  onClick={() => onToggleLike(post.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all font-sans text-[10px] hover:bg-zinc-900/40 active:scale-95 ${
                    post.likedByUser 
                      ? 'text-rose-500 font-bold' 
                      : 'text-zinc-405 text-zinc-400'
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 transition-transform ${post.likedByUser ? 'fill-rose-500 scale-110' : ''}`} />
                  <span className="font-sans">
                    {post.likes} {post.likes === 1 ? 'Me gusta' : 'Me gusta'}
                  </span>
                </button>

                {/* 2. Comentarios */}
                <button 
                  id={`btn-comment-${post.id}`}
                  onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all font-sans text-[10px] hover:bg-zinc-900/40 ${
                    isCommentsOpen ? 'text-[#00bfb2] font-semibold' : 'text-zinc-405 text-zinc-400'
                  }`}
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span className="font-sans">
                    {post.comments?.length || 0} Comentarios
                  </span>
                </button>

                {/* 3. Compartir / Share */}
                <button 
                  id={`btn-share-${post.id}`}
                  onClick={() => setShareActivePostId(isShareOpen ? null : post.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all font-sans text-[10px] hover:bg-zinc-900/40 ${
                    isShareOpen ? 'text-[#ff9f1c] font-semibold' : 'text-zinc-405 text-zinc-400'
                  }`}
                >
                  <Repeat2 className="h-4.5 w-4.5" />
                  <span className="font-sans">
                    {post.shares || 0} Compartidos
                  </span>
                </button>

                {/* 4. Guardar / Bookmark */}
                <button 
                  id={`btn-save-${post.id}`}
                  onClick={() => onToggleSave(post.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all font-sans text-[10px] hover:bg-zinc-900/40 active:scale-95 ${
                    post.saved 
                      ? 'text-[#ff9f1c] font-semibold' 
                      : 'text-zinc-405 text-zinc-400'
                  }`}
                >
                  <Bookmark className={`h-4.5 w-4.5 ${post.saved ? 'fill-[#ff9f1c]' : ''}`} />
                  <span className="font-sans">
                    {savedCount} {savedCount === 1 ? 'Guardado' : 'Guardados'}
                  </span>
                </button>

              </div>

              {/* COLLAPSIBLE SHARING FLOATING BOX */}
              {isShareOpen && (
                <div 
                  id={`share-drawer-${post.id}`} 
                  className="bg-zinc-950/70 border-t border-zinc-900 px-4 py-3 animate-in slide-in-from-bottom duration-200"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-sans text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5 text-[#ff9f1c]" />
                      Compartir Publicación
                    </span>
                    <button onClick={() => setShareActivePostId(null)} className="text-zinc-650 text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        onSharePost(post.id);
                        handleCopyLink(post.id);
                      }}
                      className="flex-1 bg-[#1a1d24] text-white hover:bg-zinc-800 text-[11px] font-sans py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-zinc-900 cursor-pointer"
                    >
                      {copiedPostId === post.id ? (
                        <>¡Copiado!</>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-[#00bfb2]" />
                          Copiar Enlace
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        onSharePost(post.id);
                        setRecommendedPostId(post.id);
                        setTimeout(() => {
                          setRecommendedPostId(null);
                          setShareActivePostId(null);
                        }, 2000);
                      }}
                      className="flex-1 bg-[#00bfb2] hover:bg-teal-600 text-white text-[11px] font-sans py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {recommendedPostId === post.id ? (
                        <>¡Enviado! ✓</>
                      ) : (
                        <>
                          <Repeat2 className="h-3.5 w-3.5" />
                          Recomendar en mi perfil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* COLLAPSIBLE COMMENTS DRAWER */}
              {isCommentsOpen && (
                <div 
                  id={`comments-drawer-${post.id}`}
                  className="bg-zinc-950/60 border-t border-zinc-950 p-4 space-y-4"
                >
                  {/* Comments Threads */}
                  <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-none">
                    {(!post.comments || post.comments.length === 0) ? (
                      <div className="text-center py-4 text-xs font-sans text-zinc-600 flex flex-col items-center">
                        <Sparkles className="h-4 w-4 text-[#ff9f1c] mb-1" />
                        Aún no hay comentarios. ¡Sé el primero en iniciar la conversación!
                      </div>
                    ) : (
                      (post.comments || []).map((comm) => {
                        const canDeleteComment = isAdminMode || comm.authorUsername === currentUser.username;

                        return (
                          <div key={comm.id} className="flex gap-2.5 text-xs">
                            <img 
                              src={comm.authorAvatar} 
                              alt={comm.authorName} 
                              className="h-8 w-8 rounded-full object-cover mt-0.5"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 bg-zinc-900/60 rounded-2xl px-3.5 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-sans font-bold text-white text-[11px]">{comm.authorName}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-sans text-[9px] text-zinc-650">{comm.createdAt}</span>
                                  {canDeleteComment && (
                                    <button
                                      type="button"
                                      id={`delete-comment-${comm.id}`}
                                      onClick={() => onDeleteComment(post.id, comm.id)}
                                      className="rounded-md p-1 text-zinc-600 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                                      title={isAdminMode ? 'Eliminar comentario como Admin' : 'Eliminar mi comentario'}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="font-sans text-zinc-300 mt-1">
                                <HashtagText text={comm.content} />
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <form onSubmit={(e) => handleSendComment(post.id, e)} className="flex gap-2">
                    <input 
                      id={`input-add-comment-${post.id}`}
                      type="text" 
                      placeholder="Escribe un comentario..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 rounded-xl bg-zinc-950 border border-zinc-900 px-3.5 py-1.5 font-sans text-xs text-white placeholder-zinc-700 focus:border-[#00bfb2] focus:outline-none"
                    />
                    <button 
                      id={`btn-send-comment-${post.id}`}
                      type="submit" 
                      disabled={!(commentInputs[post.id]?.trim())}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                        commentInputs[post.id]?.trim() 
                          ? 'bg-[#00bfb2] text-white active:scale-95' 
                          : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 1.5 MANUAL STORY CREATION MODAL OVERLAY */}
      {isOpenAddStoryModal && (
        <div id="add-story-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div id="add-story-modal-card" className="relative w-full max-w-sm bg-[#111318] border border-zinc-900 rounded-3xl p-5 md:p-6 shadow-2xl overflow-hidden flex flex-col space-y-4 animate-in zoom-in-95 duration-200">
            <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#00bfb2]/10 blur-2xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00bfb2]" />
                <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider">Publicar Historia</h3>
              </div>
              <button 
                onClick={() => setIsOpenAddStoryModal(false)}
                className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Select Character */}
            {isAdminMode ? (
              <div className="space-y-1">
                <label htmlFor="story-char-select" className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                  ¿Qué personaje publica?
                </label>
                <select
                  id="story-char-select"
                  value={addStoryUserId}
                  onChange={(e) => setAddStoryUserId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-3 py-2 font-sans text-xs text-white focus:border-[#00bfb2] focus:outline-none cursor-pointer"
                >
                  {(profiles || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (@{p.username})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                  Autor de la Historia
                </label>
                <div className="w-full rounded-xl bg-zinc-950/60 border border-zinc-900/50 px-3.5 py-2.5 font-sans text-xs text-zinc-400 border-dashed">
                  Publicando como <span className="text-[#00bfb2] font-bold">{currentUser?.name}</span> (@{currentUser?.username})
                </div>
              </div>
            )}

            {/* Optional Photo Templates */}
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                Sugerencias de imágenes estéticas:
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1">
                {[
                  { id: 'cat', name: 'Gatito 🐱🌺', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&h=1200&q=80' },
                  { id: 'cyberpunk', name: 'Ciudad Neón 🎸⚡', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&h=1200&q=80' },
                  { id: 'aesthetic', name: 'Luces Violetas 🌌🔮', url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&h=1200&q=80' },
                  { id: 'beach', name: 'Costa Playa 🌊🌅', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=1200&q=80' },
                  { id: 'abstract', name: 'Seda Fluida 👾💙', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=1200&q=80' },
                  { id: 'cozy', name: 'Lectura café ☕📚', url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&h=1200&q=80' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAddStoryMediaUrl(preset.url)}
                    className={`text-[9.5px] py-1 px-1.5 font-sans font-medium rounded-lg border text-center transition-all truncate cursor-pointer ${
                      addStoryMediaUrl === preset.url
                        ? 'bg-[#00bfb2]/15 border-[#00bfb2] text-[#00bfb2]'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL or File Upload */}
            <div className="space-y-1">
              <label htmlFor="story-media-url" className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                O pega un link (URL) de imagen externa:
              </label>
              <input
                id="story-media-url"
                type="url"
                value={addStoryMediaUrl}
                onChange={(e) => setAddStoryMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white placeholder-zinc-800 focus:border-[#00bfb2] focus:outline-none"
              />
            </div>

            {/* Upload image from computer */}
            <div className="space-y-1">
              <span className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block select-none">
                O carga una foto desde tu dispositivo:
              </span>
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-850 rounded-xl bg-zinc-950/40 py-2 hover:border-[#00bfb2] hover:bg-zinc-950/60 cursor-pointer transition-all">
                <Camera className="h-4 w-4 text-[#00bfb2] mb-0.5" />
                <span className="font-sans text-[9px] text-zinc-400 font-medium">Click para buscar...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setAddStoryMediaUrl(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <label htmlFor="story-caption" className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                Frase o pie de foto:
              </label>
              <input
                id="story-caption"
                type="text"
                maxLength={70}
                value={addStoryCaption}
                onChange={(e) => setAddStoryCaption(e.target.value)}
                placeholder="Escribe algo que represente a este personaje..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white placeholder-zinc-800 focus:border-[#00bfb2] focus:outline-none"
              />
            </div>

            {/* Preview */}
            <div className="relative h-16 w-full overflow-hidden bg-black flex items-center justify-center rounded-xl border border-zinc-900 select-none">
              <img 
                src={addStoryMediaUrl} 
                alt="Story preview" 
                className="h-full w-full object-cover brightness-95" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=200&q=80';
                }}
                referrerPolicy="no-referrer"
              />
              {addStoryCaption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-center">
                  <span className="text-[9px] text-zinc-100 font-sans font-medium line-clamp-1">{addStoryCaption}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpenAddStoryModal(false)}
                className="py-2.5 px-3 font-sans text-xs font-bold rounded-xl text-zinc-400 bg-zinc-900 hover:bg-zinc-850 hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddStory(addStoryUserId, addStoryMediaUrl, addStoryCaption);
                  setIsOpenAddStoryModal(false);
                }}
                className="py-2.5 px-3 font-sans text-xs font-bold rounded-xl text-black bg-[#00bfb2] hover:bg-teal-400 active:scale-95 transition-all cursor-pointer"
              >
                Publicar Historia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
