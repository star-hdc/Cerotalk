/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post } from '../types';
import { Search, Compass, Eye, Heart, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';

interface ExploreTabProps {
  posts: Post[];
  onSelectPost: (postId: string) => void;
}

const TRENDING_HASHTAGS = [
  '#CeroTalk', '#DesarrolloWeb', '#GatitosEnFlores', '#SunsetPortraits', '#CyberpunkLuces', '#AestheticVibes'
];

interface ExploreGridItem {
  id: string;
  category: string;
  imageUrl: string;
  title: string;
  likes: string;
  author: string;
}

const EXPLORE_ITEMS_PRESET: ExploreGridItem[] = [
  { id: 'ex_1', category: '#AestheticVibes', imageUrl: 'https://images.unsplash.com/photo-161805182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80', title: 'Fluidos en 3D Neon', likes: '1.2k', author: 'Cero Oficial' },
  { id: 'ex_2', category: '#GatitosEnFlores', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80', title: 'Minino entre Marigolds', likes: '942', author: 'val_eee' },
  { id: 'ex_3', category: '#SunsetPortraits', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80', title: 'Atardecer en Copacabana', likes: '3.1k', author: 'lu_lu.sun' },
  { id: 'ex_4', category: '#CyberpunkLuces', imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=500&q=80', title: 'Vaporwave Neon Night', likes: '840', author: 'di3g0_p' },
  { id: 'ex_5', category: '#DesarrolloWeb', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80', title: 'Workspace minimalista', likes: '2.5k', author: 'mat.moa' },
  { id: 'ex_6', category: '#AestheticVibes', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80', title: 'Retrato con Filtros de Luz', likes: '1.8k', author: 'sofi_a' }
];

export default function ExploreTab({ posts, onSelectPost }: ExploreTabProps) {
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [exploreQuery, setExploreQuery] = useState('');
  const [zoomItem, setZoomItem] = useState<ExploreGridItem | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const handleHashtagClick = (tag: string) => {
    setActiveHashtag(prev => prev === tag ? null : tag);
  };

  const filteredExploreItems = EXPLORE_ITEMS_PRESET.filter((item) => {
    const matchesHashtag = activeHashtag ? item.category === activeHashtag : true;
    const matchesSearch = exploreQuery 
      ? (item.title || "").toLowerCase().includes((exploreQuery || "").toLowerCase()) || 
        (item.category || "").toLowerCase().includes((exploreQuery || "").toLowerCase()) ||
        (item.author || "").toLowerCase().includes((exploreQuery || "").toLowerCase())
      : true;
    
    return matchesHashtag && matchesSearch;
  });

  return (
    <div id="explore-tab-container" className="space-y-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Search Input element */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-600" />
        <input 
          id="explore-search-input"
          type="text" 
          placeholder="Explorar tendencias, hashtags o creadores..."
          value={exploreQuery}
          onChange={(e) => setExploreQuery(e.target.value)}
          className="w-full rounded-full bg-[#111318] py-3.5 pl-11 pr-4 font-sans text-xs text-white placeholder-zinc-700 border border-zinc-950 focus:border-[#00bfb2] focus:outline-none focus:ring-1 focus:ring-[#00bfb2]"
        />
      </div>

      {/* Trending Hashtags Scrolling pills */}
      <div className="space-y-2">
        <div id="explore-trending-label" className="flex items-center gap-1.5 text-xs font-sans font-bold text-zinc-400">
          <TrendingUp className="h-4 w-4 text-[#ff9f1c]" />
          <span>Tendencias de hoy</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {TRENDING_HASHTAGS.map((tag) => {
            const isActive = activeHashtag === tag;
            return (
              <button 
                key={tag}
                id={`hashtag-pill-${tag}`}
                onClick={() => handleHashtagClick(tag)}
                className={`flex-shrink-0 font-sans text-[11px] px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#00bfb2]/10 border-[#00bfb2] text-[#00bfb2]' 
                    : 'bg-[#111318] border-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lookbook bento-grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-sans text-zinc-500">
          <Compass className="h-4 w-4 text-[#00bfb2]" />
          <span>Descubrir contenido destacado</span>
        </div>

        {filteredExploreItems.length === 0 ? (
          <div className="text-center py-12 bg-[#111318] rounded-xl border border-zinc-950">
            <p className="font-sans text-xs text-zinc-500">No encontramos resultados que coincidan</p>
          </div>
        ) : (
          <div id="explore-lookbook-grid" className="grid grid-cols-2 gap-3">
            {filteredExploreItems.map((item, index) => {
              // Custom bento spans for variation
              const isLarge = index === 0 || index === 5;
              return (
                <div 
                  key={item.id}
                  id={`explore-item-${item.id}`}
                  onClick={() => setZoomItem(item)}
                  className={`relative overflow-hidden bg-zinc-950 rounded-xl cursor-pointer group shadow border border-zinc-900 ${
                    isLarge ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
                  }`}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient bottom shadow */}
                  <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-4 transition-all" />

                  {/* Top Category Badge */}
                  <span className="absolute top-3 left-3 bg-[#0f1115]/80 hover:bg-[#00bfb2] hover:text-white text-[#00bfb2] border border-[#00bfb2]/20 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors">
                    {item.category}
                  </span>

                  {/* Bottom title & author details */}
                  <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white z-10">
                    <div>
                      <h4 className="font-sans text-xs font-bold leading-tight group-hover:text-[#00bfb2] transition-colors truncate max-w-[150px] sm:max-w-xs">{item.title}</h4>
                      <p className="font-sans text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                        by @{item.author}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 font-sans text-[10px] text-zinc-300 font-semibold bg-black/40 px-2 py-1 rounded-lg">
                      <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                      {item.likes}
                    </span>
                  </div>

                  {/* Hover Eye indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="rounded-full bg-[#00bfb2] p-2.5 text-white transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EXPLORE IMAGE ZOOM MODAL */}
      {zoomItem && (
        <div 
          id="explore-zoom-overlay" 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setZoomItem(null)}
        >
          <div 
            id="explore-zoom-box"
            className="bg-[#0f1115] max-w-lg w-full rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image display */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {promoMessage ? (
                <div className="absolute inset-0 bg-[#0c0e12]/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00bfb2]/10 text-[#00bfb2] border border-[#00bfb2]/20 font-bold text-xl animate-bounce">
                    ✓
                  </span>
                  <p className="font-sans text-sm font-bold text-white">{promoMessage}</p>
                  <p className="font-sans text-[11px] text-zinc-500">Chatea en tiempo real con este creador desde tu bandeja de mensajes.</p>
                </div>
              ) : null}
              <img 
                src={zoomItem.imageUrl} 
                alt={zoomItem.title} 
                className="max-h-[350px] w-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setZoomItem(null)} 
                className="absolute top-3 right-3 rounded-full bg-black/55 p-1.5 text-white hover:bg-black z-10"
              >
                ✕
              </button>
            </div>

            {/* Meta text content */}
            <div className="p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="bg-[#00bfb2]/10 text-[#00bfb2] border border-[#00bfb2]/10 font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {zoomItem.category}
                </span>
                <span className="font-sans text-[11px] text-zinc-500 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff9f1c]" /> Popular en CeroTalk
                </span>
              </div>

              <div>
                <h3 className="font-sans text-sm font-bold text-white leading-snug">{zoomItem.title}</h3>
                <p className="font-sans text-xs text-zinc-400 mt-1">Autor original: <span className="font-semibold text-white">@{zoomItem.author}</span></p>
              </div>

              <div className="flex justify-between border-t border-zinc-950 pt-3.5 text-xs">
                <div className="flex items-center gap-1 font-sans text-zinc-400 fill-rose-500/10">
                  <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
                  <span>Reaccionado por {zoomItem.likes} personas</span>
                </div>
                <button 
                  onClick={() => {
                    setPromoMessage(`¡Iniciando conversación sobre "${zoomItem.title}" con @${zoomItem.author}!`);
                    setTimeout(() => {
                      setPromoMessage(null);
                      setZoomItem(null);
                    }, 2500);
                  }}
                  className="font-sans text-[#00bfb2] hover:underline focus:outline-none"
                >
                  Hablar con @{zoomItem.author}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
