/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post, UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { Camera, FileText, Image as ImageIcon, Send, Sparkles, Check, Film, Video } from 'lucide-react';
import { fileToOptimizedDataUrl } from '../utils/media';

interface CreatePostTabProps {
  currentUser: UserProfile;
  onAddPost: (post: Omit<Post, 'id' | 'likes' | 'likedByUser' | 'comments' | 'shares' | 'saved' | 'createdAt'>) => void;
  onNavigateToHome: () => void;
}

const PRESET_IAMGES = [
  { id: 'p1', name: 'Fluidos 3D', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { id: 'p2', name: 'Atardecer Playa', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: 'p3', name: 'Montañas Albas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'p4', name: 'Luces Neón', url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80' },
  { id: 'p5', name: 'Espacio Cósmico', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' }
];

const PRESET_GIFS = [
  { id: 'g1', name: 'Celebración', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: 'g2', name: 'Aplausos', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { id: 'g3', name: 'Energía', url: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif' }
];

const PRESET_VIDEOS = [
  { id: 'v1', name: 'Luces urbanas', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'v2', name: 'Clip corto', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' }
];

type CreateMediaType = Post['mediaType'];

export default function CreatePostTab({ currentUser, onAddPost, onNavigateToHome }: CreatePostTabProps) {
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<CreateMediaType>('image');
  const [mediaUrl, setMediaUrl] = useState(PRESET_IAMGES[0].url);
  const [isSuccess, setIsSuccess] = useState(false);

  const setMediaMode = (nextType: CreateMediaType) => {
    setMediaType(nextType);

    if (nextType === 'image') setMediaUrl(PRESET_IAMGES[0].url);
    if (nextType === 'gif') setMediaUrl(PRESET_GIFS[0].url);
    if (nextType === 'video') setMediaUrl(PRESET_VIDEOS[0].url);
    if (nextType === 'text') setMediaUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddPost({
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      mediaType,
      mediaUrl: mediaType !== 'text' ? mediaUrl : undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setContent('');
      onNavigateToHome(); // Switch to feed screen
    }, 1200);
  };

  return (
    <div id="create-post-container" className="mx-auto w-full max-w-lg bg-[#111318] border border-zinc-950 p-5 rounded-2xl md:rounded-3xl shadow-xl animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-zinc-950 pb-4 mb-5">
        <Sparkles className="h-5 w-5 text-[#00bfb2]" />
        <h2 className="font-sans text-base font-bold text-white">Nueva Publicación</h2>
      </div>

      {isSuccess ? (
        <div id="create-success-panel" className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <Check className="h-7 w-7 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-sans text-sm font-semibold text-white">¡Publicado con éxito!</p>
            <p className="font-sans text-xs text-zinc-500 mt-1">Tu post ya está disponible en el feed.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* User Info Line */}
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-900"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-sans text-xs font-bold text-white">{currentUser.name}</h4>
              <p className="font-sans text-[10px] text-zinc-500">Publicando como @{currentUser.username}</p>
            </div>
          </div>


          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label id="lbl-content" htmlFor="txt-content" className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
              ¿Qué estás pensando?
            </label>
            <textarea 
              id="txt-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe una fantástica actualización sobre tu día, ideas o proyectos..."
              required
              className="w-full rounded-xl bg-zinc-950 border border-zinc-900 border-zinc-904 px-4 py-3 font-sans text-xs text-white placeholder-zinc-700 focus:border-[#00bfb2] focus:outline-none"
            />
          </div>

          {/* Media Select Tabs */}
          <div className="space-y-2">
            <span className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
              Tipo de Publicación
            </span>
            <div className="grid grid-cols-4 gap-1.5 bg-[#0a0c10] p-1 rounded-xl">
              <button 
                id="select-media-image"
                type="button"
                onClick={() => setMediaMode('image')}
                className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'image' 
                    ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Imagen
              </button>
              <button 
                id="select-media-gif"
                type="button"
                onClick={() => setMediaMode('gif')}
                className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'gif' 
                    ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Film className="h-4 w-4" />
                GIF
              </button>
              <button 
                id="select-media-video"
                type="button"
                onClick={() => setMediaMode('video')}
                className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'video' 
                    ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
              <button 
                id="select-media-text"
                type="button"
                onClick={() => setMediaMode('text')}
                className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mediaType === 'text' 
                    ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Texto
              </button>
            </div>
          </div>

          {/* Media Settings */}
          {mediaType !== 'text' && (
            <div className="space-y-3.5 animate-in slide-in-from-top-3 duration-250">
              
              {/* Preset Carousel */}
              <div className="space-y-1.5">
                <span className="font-sans text-[10px] text-zinc-500">
                  Elige {mediaType === 'image' ? 'una imagen estética' : mediaType === 'gif' ? 'un GIF' : 'un video'} de muestra:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {(mediaType === 'image' ? PRESET_IAMGES : mediaType === 'gif' ? PRESET_GIFS : PRESET_VIDEOS).map((img) => (
                    <button 
                      key={img.id}
                      id={`preset-img-${img.id}`}
                      type="button"
                      onClick={() => setMediaUrl(img.url)}
                      className={`flex-shrink-0 cursor-pointer rounded-lg border text-[10px] px-2.5 py-1.5 font-sans transition-all ${
                        mediaUrl === img.url 
                          ? 'bg-[#00bfb2]/10 border-[#00bfb2] text-[#00bfb2]' 
                          : 'bg-[#0a0c10] border-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste URL */}
              <div className="space-y-1">
                <span id="lbl-custom-url" className="font-sans text-[10px] text-zinc-500 block">
                  O pega una URL externa:
                </span>
                <input 
                  id="input-custom-image-url"
                  type="url" 
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={mediaType === 'video' ? 'https://.../video.mp4' : mediaType === 'gif' ? 'https://.../animacion.gif' : 'https://images.unsplash.com/...'}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-4 py-2 font-sans text-xs text-white placeholder-zinc-800 focus:border-[#00bfb2] focus:outline-none"
                />
              </div>

              {/* Upload media from computer */}
              <div className="space-y-1 text-left">
                <span className="font-sans text-[10px] text-zinc-500 block select-none">
                  O sube un archivo desde tu ordenador:
                </span>
                <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20 p-4 hover:border-[#00bfb2] hover:bg-zinc-950/50 cursor-pointer transition-all">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Camera className="h-5 w-5 text-[#00bfb2]" />
                    <span className="font-sans text-[11px] text-zinc-300 font-medium">Seleccionar archivo...</span>
                    <span className="font-sans text-[9px] text-zinc-500">Haz clic para buscar fotos locales</span>
                  </div>
                  <input 
                    type="file" 
                    accept={mediaType === 'video' ? 'video/*' : mediaType === 'gif' ? 'image/gif,image/*' : 'image/*'} 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMediaUrl(await fileToOptimizedDataUrl(file, mediaType === 'image' ? 900 : 1200, 0.76));
                      }
                    }}
                  />
                </label>
              </div>

              {/* Live Preview */}
              {mediaUrl && (
                <div className="space-y-1">
                  <span className="font-sans text-[10px] font-bold text-zinc-650 uppercase block">Vista previa:</span>
                  <div className="relative h-32 w-full rouned-xl overflow-hidden bg-black flex items-center justify-center rounded-xl border border-zinc-900">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} className="h-full w-full object-contain" controls playsInline />
                    ) : (
                      <img 
                        src={mediaUrl} 
                        alt="Preview" 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';
                        }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Submit Action */}
          <button 
            id="btn-publish-submit"
            type="submit"
            disabled={!content.trim()}
            className={`w-full py-3.5 px-4 font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              content.trim() 
                ? 'bg-[#00bfb2] text-white hover:bg-teal-600 cursor-pointer active:scale-95' 
                : 'bg-zinc-900 border border-zinc-950 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Publicar en Cerotalk
          </button>
        </form>
      )}

    </div>
  );
}
