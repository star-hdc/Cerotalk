/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Post } from '../types';
import { 
  Shield, 
  UserCheck, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send, 
  Check, 
  RefreshCw, 
  Users, 
  Sparkles, 
  PlusCircle, 
  FileText,
  Camera,
  Film,
  Video
} from 'lucide-react';

interface AdminTabProps {
  profiles: UserProfile[];
  currentProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfile: (profileId: string, updatedFields: Partial<UserProfile>) => void;
  onAddPost: (postDetails: Omit<Post, 'id' | 'likes' | 'likedByUser' | 'comments' | 'shares' | 'saved' | 'createdAt'>) => void;
  onResetFactory: () => void;
}

const AVATAR_PRESETS = [
  { name: 'Mateo (Foto Original)', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Sofi_a (Retrato Cálido)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Gatito en Flores', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Silueta Concierto', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Atardecer Neón', url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: 'Nómada Playa', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80' }
];

const POST_THEMES = [
  { name: 'Cero Abstracto', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Atardecer Marino', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Cyberpunk Noche', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Bosque de Niebla', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85' }
];

const POST_GIFS = [
  { name: 'Celebración', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { name: 'Aplausos', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { name: 'Energía', url: 'https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif' }
];

const POST_VIDEOS = [
  { name: 'Luces urbanas', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { name: 'Clip corto', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' }
];

export default function AdminTab({
  profiles,
  currentProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddPost,
  onResetFactory
}: AdminTabProps) {
  // Local state for editing individual profiles
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editFollowers, setEditFollowers] = useState<number>(0);
  const [editFollowing, setEditFollowing] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // Quick Post Creator state
  const [selectedPosterId, setSelectedPosterId] = useState<string>(currentProfileId);
  const [postContent, setPostContent] = useState('');
  const [postMediaType, setPostMediaType] = useState<Post['mediaType']>('image');
  const [postMediaUrl, setPostMediaUrl] = useState(POST_THEMES[0].url);

  const activeProfile = (profiles && profiles.find(p => p && p.id === currentProfileId)) || (profiles && profiles[0]) || { id: 'user', name: 'Mateo Momoa', username: 'mat.moa', avatar: '', bio: '', role: '', followers: 0, following: 0 };

  const handleStartEdit = (p: UserProfile) => {
    setEditingProfileId(p.id);
    setCustomAvatarUrl(p.avatar);
    setEditName(p.name);
    setEditUsername(p.username);
    setEditRole(p.role);
    setEditBio(p.bio);
    setEditFollowers(p.followers);
    setEditFollowing(p.following);
  };

  const handleSaveProfile = (profileId: string) => {
    onUpdateProfile(profileId, {
      name: editName.trim(),
      username: editUsername.trim().replace(/\s+/g, ''),
      role: editRole.trim(),
      bio: editBio.trim(),
      followers: Number(editFollowers) || 0,
      following: Number(editFollowing) || 0,
      avatar: customAvatarUrl.trim()
    });
    setEditingProfileId(null);
    triggerSuccess('¡Perfil de personaje actualizado con éxito!');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const setQuickPostMediaType = (nextType: Post['mediaType']) => {
    setPostMediaType(nextType);

    if (nextType === 'image') setPostMediaUrl(POST_THEMES[0].url);
    if (nextType === 'gif') setPostMediaUrl(POST_GIFS[0].url);
    if (nextType === 'video') setPostMediaUrl(POST_VIDEOS[0].url);
    if (nextType === 'text') setPostMediaUrl('');
  };

  const handlePublishAsSelected = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const poster = (selectedPosterId ? profiles.find(p => p && p.id === selectedPosterId) : undefined) || activeProfile;

    onAddPost({
      authorName: poster.name,
      authorUsername: poster.username,
      authorAvatar: poster.avatar,
      content: postContent.trim(),
      mediaType: postMediaType,
      mediaUrl: postMediaType !== 'text' ? postMediaUrl : undefined
    });

    setPostContent('');
    triggerSuccess(`¡Post publicado exitosamente en nombre de ${poster.name}!`);
  };

  return (
    <div id="admin-panel-box" className="space-y-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Panel Welcome Header Banner */}
      <div className="bg-[#111318] rounded-2xl md:rounded-3xl border border-[#ff9f1c]/20 p-5 shadow-xl relative overflow-hidden">
        <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#ff9f1c]/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff9f1c]/10 text-[#ff9f1c] border border-[#ff9f1c]/30">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#ff9f1c] bg-[#ff9f1c]/10 px-2 py-0.5 rounded">
                Consola Cero
              </span>
            </div>
            <h2 className="font-sans text-base font-bold text-white mt-1">Superadministrador de Perfiles</h2>
            <p className="font-sans text-[11px] text-zinc-550 text-zinc-500">
              Intercambia identidades, actualiza fotos de perfil dinámicamente y simula historias o publicaciones.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-sans animate-in slide-in-from-top-1">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* 2. SWITCH PROTOCOLS - CHOOSE WHO YOU ARE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Users className="h-4 w-4 text-[#00bfb2]" />
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400">
            Ingresar y Gestionar Cuenta (Personajes Originales)
          </h3>
        </div>

        <div className="grid gap-3.5">
          {(profiles || []).filter(p => p && p.id !== 'simulated_user' && p.role !== 'Visitante Temp').map((p) => {
            const isActive = p.id === currentProfileId;
            const isEditing = editingProfileId === p.id;

            return (
              <div 
                key={p.id}
                id={`admin-card-${p.id}`}
                className={`bg-[#111318] border rounded-2xl p-4 transition-all duration-300 relative ${
                  isActive 
                    ? 'border-[#00bfb2] shadow-[0_0_15px_rgba(0,191,178,0.06)]' 
                    : 'border-zinc-950/80 hover:border-zinc-900'
                }`}
              >
                {/* Active Session Label Indicator */}
                {isActive && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 bg-[#00bfb2]/10 border border-[#00bfb2]/20 px-2.5 py-0.5 rounded-full font-sans text-[9px] font-black text-[#00bfb2] uppercase tracking-wide">
                    <UserCheck className="h-3 w-3" />
                    Sesión Activa
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={p.avatar} 
                      alt={p.name} 
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-zinc-950"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#111318]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans text-sm font-bold text-white truncate">{p.name}</h4>
                      <span className="font-sans text-[9px] font-semibold bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
                        {p.role}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-500 mt-0.5">@{p.username}</p>
                    <p className="font-sans text-[11px] text-zinc-400 mt-1.5 leading-relaxed italic">{p.bio}</p>

                    {/* STATS ROW */}
                    <div className="flex gap-4 mt-2 text-[10px] font-sans text-zinc-500">
                      <span><strong>{p.followers}</strong> seguidores</span>
                      <span>•</span>
                      <span><strong>{p.following}</strong> seguidos</span>
                    </div>

                    {/* MANAGERS BUTTONS */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4.5 border-t border-zinc-950">
                      {/* Switch login profile button */}
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProfile(p.id);
                            setSelectedPosterId(p.id);
                            triggerSuccess(`¡Ahora has ingresado como @${p.username}!`);
                          }}
                          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5 text-[#00bfb2]" />
                          Acceder como {p.name}
                        </button>
                      ) : (
                        <div className="bg-[#00bfb2]/10 border border-[#00bfb2]/20 text-[#00bfb2] px-3 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Identidad Seleccionada
                        </div>
                      )}

                      {/* Edit Profile Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditingProfileId(null);
                          } else {
                            handleStartEdit(p);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isEditing 
                            ? 'bg-[#ff9f1c] text-neutral-900' 
                            : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Editar Perfil
                      </button>
                    </div>

                    {/* PROFILE EDITING COMPREHENSIVE WORKBENCH */}
                    {isEditing && (
                      <div className="mt-4 p-4.5 bg-zinc-950 rounded-xl border border-zinc-900 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <span className="font-sans text-[10px] font-extrabold text-[#ff9f1c] uppercase tracking-wider block">
                          Editar Perfil Completo de {p.name}
                        </span>

                        {/* Two columns layout: Display Name & Username */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-sans text-[10px] text-zinc-500 block text-left">Nombre:</label>
                            <input 
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-sans text-[10px] text-zinc-500 block text-left">Usuario (@):</label>
                            <input 
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Role / Occupation and Followers stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 col-span-1">
                            <label className="font-sans text-[10px] text-zinc-500 block text-left">Rol/Ocupación:</label>
                            <input 
                              type="text"
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-1">
                            <label className="font-sans text-[10px] text-zinc-500 block text-left">Seguidores:</label>
                            <input 
                              type="number"
                              value={editFollowers}
                              onChange={(e) => setEditFollowers(Number(e.target.value))}
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1 col-span-1">
                            <label className="font-sans text-[10px] text-zinc-500 block text-left">Seguidos:</label>
                            <input 
                              type="number"
                              value={editFollowing}
                              onChange={(e) => setEditFollowing(Number(e.target.value))}
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bio description */}
                        <div className="space-y-1">
                          <label className="font-sans text-[10px] text-zinc-500 block text-left">Biografía:</label>
                          <textarea 
                            rows={2}
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none resize-none text-left"
                          />
                        </div>

                        {/* Avatar Image Selection & Custom input */}
                        <div className="space-y-2.5 pt-1.5 border-t border-zinc-900">
                          <div className="space-y-1.5">
                            <span className="font-sans text-[10.5px] text-zinc-500 block font-bold text-left">Foto de Perfil (Avatar):</span>
                            <div className="grid grid-cols-2 gap-2">
                              {AVATAR_PRESETS.map((preset, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setCustomAvatarUrl(preset.url)}
                                  className={`text-left p-1.5 px-2 rounded-lg border text-[10px] truncate font-sans text-ellipsis block transition-all cursor-pointer ${
                                    customAvatarUrl === preset.url 
                                      ? 'bg-[#ff9f1c]/10 border-[#ff9f1c] text-[#ff9f1c]' 
                                      : 'bg-[#111318] border-zinc-900 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom URL */}
                          <div className="space-y-1 text-left">
                            <label className="font-sans text-[10px] text-zinc-500 flex items-center gap-1 select-none">
                              <LinkIcon className="h-3 w-3" />
                              O ingresa cualquier link de foto personalizado:
                            </label>
                            <input 
                              type="url"
                              value={customAvatarUrl}
                              onChange={(e) => setCustomAvatarUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full rounded-lg bg-[#111318] border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#ff9f1c] focus:outline-none placeholder-zinc-800"
                            />
                          </div>

                          {/* Upload image from computer for Avatar */}
                          <div className="space-y-1 text-left">
                            <label className="font-sans text-[10px] text-zinc-500 flex items-center gap-1 select-none">
                              <Camera className="h-3 w-3 text-[#ff9f1c]" />
                              O sube la foto del personaje desde tu ordenador:
                            </label>
                            <label className="flex items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-[#111318] p-3.5 hover:border-[#ff9f1c] hover:bg-zinc-950/40 cursor-pointer transition-all mt-1">
                              <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-[#ff9f1c]" />
                                <span className="font-sans text-[10.5px] text-zinc-300">Presiona para buscar archivo local...</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPostMediaUrl(URL.createObjectURL(file));
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Preview & Actions bar */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[9px] text-zinc-500 select-none">Vista Previa:</span>
                            <img 
                              src={customAvatarUrl || p.avatar} 
                              alt="Avatar Preview" 
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-[#ff9f1c]/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = p.avatar;
                              }}
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => setEditingProfileId(null)}
                              className="px-3 py-1.5 rounded-xl font-sans text-[10.5px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveProfile(p.id)}
                              className="bg-[#ff9f1c] text-neutral-900 px-4 py-1.5 rounded-xl font-sans text-[10.5px] font-extrabold hover:bg-amber-500 active:scale-95 transition-all cursor-pointer"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. QUICK PUBLISHER AS ANYONE ON BEHALF */}
      <div className="bg-[#111318] rounded-2xl border border-zinc-950 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-950 pb-3">
          <PlusCircle className="h-4.5 w-4.5 text-[#00bfb2]" />
          <h3 className="font-sans text-sm font-bold text-white">Publicador Rápido de Posts</h3>
        </div>

        <form onSubmit={handlePublishAsSelected} className="space-y-4">
          
          {/* dropdown selection author */}
          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase">
              Autor del Post:
            </label>
            <select
              value={selectedPosterId}
              onChange={(e) => setSelectedPosterId(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-4 py-2.5 font-sans text-xs text-white focus:border-[#00bfb2] focus:outline-none cursor-pointer"
            >
              {(profiles || []).filter(p => p && p.id !== 'simulated_user' && p.role !== 'Visitante Temp').map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (@{p.username}) — ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* textarea */}
          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase">
              Texto / Mensaje de Publicación:
            </label>
            <textarea
              rows={3}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="¿Qué diría este perfil hoy en Cerotalk? Escribe el contenido..."
              required
              className="w-full rounded-xl bg-zinc-950 border border-zinc-900 px-4 py-3 font-sans text-xs text-white placeholder-zinc-700 focus:border-[#00bfb2] focus:outline-none"
            />
          </div>

          {/* media layout select */}
          <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setQuickPostMediaType('image')}
              className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                postMediaType === 'image' 
                  ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Imagen
            </button>
            <button
              type="button"
              onClick={() => setQuickPostMediaType('gif')}
              className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                postMediaType === 'gif' 
                  ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              GIF
            </button>
            <button
              type="button"
              onClick={() => setQuickPostMediaType('video')}
              className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                postMediaType === 'video' 
                  ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              Video
            </button>
            <button
              type="button"
              onClick={() => setQuickPostMediaType('text')}
              className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                postMediaType === 'text' 
                  ? 'bg-[#1a1d24] text-[#00bfb2] border border-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Texto
            </button>
          </div>

          {postMediaType !== 'text' && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <span className="font-sans text-[10px] text-zinc-500 block">
                Sugerencias de {postMediaType === 'image' ? 'imágenes' : postMediaType === 'gif' ? 'GIFs' : 'videos'}:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(postMediaType === 'image' ? POST_THEMES : postMediaType === 'gif' ? POST_GIFS : POST_VIDEOS).map((theme) => (
                  <button
                    key={theme.url}
                    type="button"
                    onClick={() => setPostMediaUrl(theme.url)}
                    className={`flex-shrink-0 cursor-pointer rounded-lg border text-[10px] px-2.5 py-1.5 font-sans transition-all ${
                      postMediaUrl === theme.url 
                        ? 'bg-[#00bfb2]/10 border-[#00bfb2] text-[#00bfb2]' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <span className="font-sans text-[9px] text-zinc-500 block">O pega una URL externa:</span>
                <input 
                  type="url"
                  value={postMediaUrl}
                  onChange={(e) => setPostMediaUrl(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-900 px-3 py-1.5 font-sans text-xs text-white focus:border-[#00bfb2] focus:outline-none"
                  placeholder={postMediaType === 'video' ? 'https://.../video.mp4' : postMediaType === 'gif' ? 'https://.../animacion.gif' : 'https://images.unsplash.com/...'}
                />
              </div>

              {/* Upload image from computer for Quick Post Creator */}
              <div className="space-y-1 text-left">
                <span className="font-sans text-[9px] text-zinc-500 block text-left">O sube el archivo de la publicación desde tu ordenador:</span>
                <label className="flex items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950 p-2.5 hover:border-[#00bfb2] hover:bg-[#111318] cursor-pointer transition-all mt-1">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-[#00bfb2]" />
                    <span className="font-sans text-[10.5px] text-zinc-400">Buscar archivo en el ordenador...</span>
                  </div>
                  <input
                    type="file"
                    accept={postMediaType === 'video' ? 'video/mp4,video/webm,video/ogg' : postMediaType === 'gif' ? 'image/gif,image/*' : 'image/*'}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setPostMediaUrl(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!postContent.trim()}
            className={`w-full py-3 px-4 font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              postContent.trim() 
                ? 'bg-[#00bfb2] text-neutral-900 hover:bg-teal-400 cursor-pointer active:scale-95' 
                : 'bg-zinc-950 border border-zinc-900 text-zinc-650 cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Publicar en CeroTalk como {profiles.find(p => p && p.id === selectedPosterId)?.name || 'Anónimo'}
          </button>
        </form>
      </div>

      {/* 4. TECHNICAL SYSTEM RECOVERY */}
      <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-sans text-xs font-bold text-red-400 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Reiniciar Valores de Fábrica
          </h4>
          <p className="font-sans text-[10px] text-zinc-500 mt-1 max-w-sm">
            Si deseas limpiar la simulación, esto restablecerá imágenes, historias y posts a los valores por defecto iniciales de Cerotalk.
          </p>
        </div>
        {confirmReset ? (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 rounded-xl p-1.5 animate-pulse shrink-0">
            <span className="font-sans text-[10px] text-red-300 font-bold px-1 select-none">¿Confirmas?</span>
            <button
              type="button"
              onClick={() => {
                onResetFactory();
                triggerSuccess('¡Los datos han sido restaurados con éxito!');
                setConfirmReset(false);
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-sans text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
            >
              Sí, reiniciar
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-sans text-[10px] px-2 py-1 rounded-lg cursor-pointer transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-sans text-[10px] font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Restaurar Todo
          </button>
        )}
      </div>

    </div>
  );
}
