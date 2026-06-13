/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Notification } from '../types';
import { Heart, MessageSquare, AtSign, UserPlus, Check, Trash2, X } from 'lucide-react';

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function NotificationsModal({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: NotificationsModalProps) {
  
  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter(n => n && !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <div className="rounded-full bg-rose-500/10 p-1.5 text-rose-500"><Heart className="h-4 w-4 fill-rose-500" /></div>;
      case 'comment':
        return <div className="rounded-full bg-[#00bfb2]/10 p-1.5 text-[#00bfb2]"><MessageSquare className="h-4 w-4" /></div>;
      case 'mention':
        return <div className="rounded-full bg-[#ff9f1c]/10 p-1.5 text-[#ff9f1c]"><AtSign className="h-4 w-4" /></div>;
      case 'follow':
        return <div className="rounded-full bg-indigo-500/10 p-1.5 text-indigo-500"><UserPlus className="h-4 w-4" /></div>;
      default:
        return <div className="rounded-full bg-zinc-500/10 p-1.5 text-zinc-400"><Heart className="h-4 w-4" /></div>;
    }
  };

  return (
    <div 
      id="notifications-container" 
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        id="notifications-overlay" 
        onClick={(e) => e.stopPropagation()} 
        className="absolute right-0 top-0 bottom-0 z-50 flex w-full max-w-sm flex-col bg-[#0f1115] border-l border-zinc-900 shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 p-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-white flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 font-sans text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="font-sans text-xs text-zinc-500">Últimas actividades de tu red</p>
          </div>
          <button 
            id="close-notifications"
            onClick={onClose} 
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls */}
        {safeNotifications.length > 0 && (
          <div className="flex justify-between border-b border-zinc-900 bg-zinc-900/10 px-4 py-2 text-xs">
            <button 
              id="mark-all-read"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 font-sans text-[#00bfb2] hover:underline"
            >
              <Check className="h-3 w-3" />
              Marcar todo leído
            </button>
            <button 
              id="clear-all-notifications"
              onClick={onClearAll}
              className="flex items-center gap-1 font-sans text-zinc-500 hover:text-zinc-300 hover:underline"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar todo
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
          {safeNotifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Heart className="h-12 w-12 text-zinc-700 stroke-1 mb-2" />
              <p className="font-sans text-sm font-semibold text-zinc-400">No hay notificaciones</p>
              <p className="font-sans text-xs text-zinc-600">Te avisaremos cuando suceda algo genial.</p>
            </div>
          ) : (
            safeNotifications.map((notif) => (
              <div 
                key={notif.id}
                id={`notif-item-${notif.id}`} 
                onClick={() => onMarkAsRead(notif.id)}
                className={`group relative flex gap-3 rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                  notif.isRead 
                    ? 'bg-zinc-950/20 border-zinc-950/20 hover:bg-zinc-900/30' 
                    : 'bg-[#1a1d24]/40 border-zinc-800/40 hover:bg-[#1a1d24]/60'
                }`}
              >
                {/* Unread indicator dot */}
                {!notif.isRead && (
                  <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />
                )}

                {/* Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0">
                  <img 
                    src={notif.senderAvatar} 
                    alt={notif.senderName} 
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <p className="font-sans text-xs text-zinc-350 leading-relaxed">
                    <span className="font-semibold text-white mr-1">{notif.senderName}</span>
                    {notif.detailText}
                  </p>
                  <p className="font-sans text-[10px] text-zinc-600">{notif.timestamp}</p>
                </div>

                {/* Mark as read tick button */}
                {!notif.isRead && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notif.id);
                    }}
                    className="self-center rounded-full p-1 text-zinc-600 hover:bg-zinc-800 hover:text-[#00bfb2]"
                    title="Marcar como leído"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
