/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../types';
import { X, ChevronLeft, ChevronRight, Send, Check, Trash2 } from 'lucide-react';
import HashtagText from './HashtagText';

interface StoryViewerProps {
  stories: Story[];
  initialActiveIndex: number;
  onClose: () => void;
  onSendMessage: (friendId: string, text: string) => void;
  isAdminMode?: boolean;
  onDeleteStory?: (storyId: string) => void;
  currentProfileId?: string;
}

export default function StoryViewer({ 
  stories, 
  initialActiveIndex, 
  onClose,
  onSendMessage,
  isAdminMode = false,
  onDeleteStory,
  currentProfileId = 'user'
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialActiveIndex);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentStory = stories && stories[currentIndex];

  // Auto-close if story is invalid or went out-of-bounds
  useEffect(() => {
    if (!currentStory) {
      onClose();
    }
  }, [currentStory, onClose]);

  // Auto-advance logic
  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setIsSent(false);
    setReplyText('');
    
    if (isPaused) return;

    // Reset progress timers
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = 5000; // 5 seconds per story
    const step = 50; // Update every 50ms
    const totalSteps = duration / step;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / totalSteps) * 100;
      setProgress(Math.min(currentProgress, 100));
    }, step);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, duration);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // If at first story, reset progress or stay
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Send the reply message to the specific chat list of that user
    const recipientId = currentStory.userId === 'user' ? 'marketing' : currentStory.userId;
    onSendMessage(recipientId, `Respondí a tu historia: "${replyText}"`);

    setReplyText('');
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
    }, 2000);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  if (!currentStory) return null;

  return (
    <div 
      id="story-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 transition-opacity duration-300 md:p-4"
    >
      {/* Background click to close */}
      <div className="absolute inset-0 z-0 bg-transparent" onClick={onClose} />

      {/* Main Content Area */}
      <div 
        className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-zinc-950 md:rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Story details & progress bars */}
        <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
          
          {/* Progress Indicators */}
          <div className="mb-4 flex gap-1.5">
            {(stories || []).map((story, idx) => {
              let width = '0%';
              if (idx < currentIndex) width = '100%';
              else if (idx === currentIndex) width = `${progress}%`;
              
              return (
                <div key={story.id} className="h-1 flex-1 rounded-full bg-white/20">
                  <div 
                    className="h-full rounded-full bg-[#00bfb2] transition-all duration-75"
                    style={{ width }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={currentStory.userAvatar} 
                alt={currentStory.displayName} 
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#00bfb2]"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-sans text-sm font-semibold text-white">
                  {currentStory.displayName}
                </div>
                <div className="font-sans text-xs text-zinc-300">
                  @{currentStory.username}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {isAdminMode && (
                <button
                  id={`delete-story-${currentStory.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteStory) {
                      onDeleteStory(currentStory.id);
                    }
                  }}
                  className="rounded-full bg-red-600/35 hover:bg-red-600/60 text-red-200 border border-red-500/30 px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Eliminar esta Historia (Solo Admin)"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-300" />
                  <span className="font-sans text-[10px] font-bold tracking-wide uppercase">Eliminar</span>
                </button>
              )}
              {/* Close Button */}
              <button 
                id="close-story-viewer"
                onClick={onClose} 
                className="rounded-full bg-black/20 p-1.5 text-white/80 hover:bg-black/40 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Image Panel */}
        <div className="relative flex h-full items-center justify-center bg-zinc-950">
          
          {/* Tap-Left Detection */}
          <button 
            id="story-nav-prev"
            onClick={handlePrev}
            className="absolute left-0 bottom-0 top-0 z-15 w-1/4 cursor-pointer focus:outline-none"
            aria-label="Story anterior"
          />

          {/* Tap-Right Detection */}
          <button 
            id="story-nav-next"
            onClick={handleNext}
            className="absolute right-0 bottom-0 top-0 z-15 w-1/4 cursor-pointer focus:outline-none"
            aria-label="Story siguiente"
          />

          {/* Story Visual Frame */}
          <img 
            src={currentStory.mediaUrl} 
            alt="Story content" 
            className="max-h-full w-full object-contain"
            referrerPolicy="no-referrer"
          />

          {/* Navigation Overlay Arrows for Desktop */}
          <div className="absolute inset-x-4 z-20 flex hidden justify-between pointer-events-none md:flex">
            <button 
              id="story-arrow-prev"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
              className={`pointer-events-auto rounded-full bg-black/40 p-2 text-white hover:bg-black/60 active:scale-95 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              id="story-arrow-next"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="pointer-events-auto rounded-full bg-black/40 p-2 text-white hover:bg-black/60 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Story Caption Overlay at Bottom */}
          {currentStory.caption && (
            <div className="absolute inset-x-0 bottom-24 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 py-4 text-center">
              <p className="font-sans text-sm text-white drop-shadow-md">
                <HashtagText text={currentStory.caption} />
              </p>
            </div>
          )}
        </div>

        {/* Footer Reply Form */}
        <div className="relative z-20 border-t border-zinc-900 bg-[#0f1115] p-3 md:rounded-b-2xl">
          {currentStory.userId !== currentProfileId ? (
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input 
                id="story-reply-input"
                type="text" 
                placeholder={`Responder a ${currentStory.displayName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 rounded-full bg-zinc-900 px-4 py-2 font-sans text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-[#00bfb2] focus:outline-none focus:ring-1 focus:ring-[#00bfb2]"
              />
              <button 
                id="story-reply-submit"
                type="submit" 
                disabled={!replyText.trim() || isSent}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-all ${
                  isSent 
                    ? 'bg-emerald-500' 
                    : replyText.trim() 
                      ? 'bg-[#00bfb2] active:scale-95' 
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isSent ? <Check className="h-5 w-5" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <div className="py-2 text-center text-xs font-sans text-zinc-500">
              Esta es tu propia historia
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
