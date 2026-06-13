/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Chat, Message } from '../types';
import { X, Send, Search, CheckCheck, Smile } from 'lucide-react';
import { CONVERSATION_AUTO_REPLIES } from '../data/mockData';

interface ChatModalProps {
  chats: Chat[];
  onClose: () => void;
  onSendMessage: (friendId: string, text: string) => void;
  onMarkChatAsRead: (chatId: string) => void;
  onReceiveAutoReply: (friendId: string, text: string) => void;
  isVisitor?: boolean;
}

const VISITOR_AUTO_REPLIES: Record<string, string[]> = {
  sofia: [
    "¡Hola! Qué lindo que me escribas por aquí 🌸 ¿Cómo vas?",
    "Me encanta platicar con gente nueva. He estado ensayando con la guitarra todo el día, mis dedos ya piden descanso 😪🎸",
    "¡Jajaja ay no! De verdad espero que Mateo le cambie el nombre a la banda, 'Culto al Shuco' suena muy chistoso, ¿no crees? 😭🌸",
    "¡Gracias por escribirme! Te mando un abrazo grande y te veo al rato en Le Rock ✨"
  ],
  diego: [
    "¡Qué dice el o la nueva fan número uno! 😎🔥 Acá ando produciendo unas pistas de rock brutales.",
    "Si te gusta el rock de verdad, tienes que verme hoy tocar la guitarra principal en Le Rock. ¡Preparo unos solos memorables! 😉",
    "Jajaja ya sabes, soy irresistible tanto en la cabina de sonido como en el escenario 😏 ¿Listo/a para el show de hoy?",
    "¡Un saludo grande crack! Gracias por escribir, nos vemos en unas horas ⚡"
  ],
  valeee: [
    "Hola, soy Valeria. Como mánager de Culto al Shuco y administradora de Le Rock, ando con mil tareas hoy 📋☕ Pero siempre hay tiempo para saludar.",
    "Hola. Más tarde abrimos Le Rock, espero que puedas ir temprano para evitar la fila. ¡Nos beneficia el orden! 💼",
    "Por favor, si ves a Lucía dile que me entregue el balance contable rápido... lo usó de posavasos para su malteada 😪",
    "¡Qué gusto saludarte! Gracias por el mensaje de apoyo a nuestra banda."
  ],
  lulu: [
    "¡Hoolaaa! 💅 Ay qué emoción tener visitas nuevas en Cerotalk. ¿A que soy la bajista más cool de la ciudad? 💋🎸",
    "Jajaja Valeria se estresa demasiado por todo, ¡hay que fluir con el ritmo libre! Yo soy súper real y directa ✨",
    "Ay por fi, no le digas a Valeria que manché las hojas del balance con chocolate 🤭💅 Ella se pone muy mandona.",
    "¡Oye de verdad me caes genial! Nos vemos al rato en el club, te guardo un espacio cerca de mi bajo 😎⚡ Besotes."
  ],
  marketing: [
    "¡Hola! Te damos la bienvenida oficial al soporte de Cerotalk para visitantes temporales 🎬",
    "Tu sesión de visitante temporal es 100% privada y personal. ¡Siéntete libre de compartir posts, historias o chatear con los personajes!",
    "La banda local 'Culto al Shuco' está muy activa hoy en el chat. ¡Escríbeles para conocerlos mejor! 🎸⚡",
    "¿Tienes alguna sugerencia para mejorar la red social del club Le Rock? ¡Nos encanta leerte!"
  ]
};

export default function ChatModal({
  chats,
  onClose,
  onSendMessage,
  onMarkChatAsRead,
  onReceiveAutoReply,
  isVisitor = false
}: ChatModalProps) {
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingFriends, setTypingFriends] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark as read when entering chat
    if (activeChatId && activeChat?.unread) {
      onMarkChatAsRead(activeChatId);
    }
  }, [activeChatId, activeChat?.messages?.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const userText = messageInput.trim();
    const friendId = activeChat.friendId;

    // Send original user message
    onSendMessage(friendId, userText);
    setMessageInput('');

    // Trigger personality automatic replies
    setTypingFriends(prev => ({ ...prev, [friendId]: true }));

    const sourceReplies = isVisitor ? VISITOR_AUTO_REPLIES : CONVERSATION_AUTO_REPLIES;
    const repliesList = sourceReplies[friendId] || [
      "¡Qué chévere! Sigamos hablando de esto.",
      "Excelente, me encanta charlar contigo por Cerotalk 🤩",
      "¡Dale, te aviso en un rato!"
    ];

    // Pick a reply
    const randomReply = repliesList[Math.floor(Math.random() * repliesList.length)];

    setTimeout(() => {
      // Add auto-reply to internal state
      onReceiveAutoReply(friendId, randomReply);
      // Turn off static typing indicator
      setTypingFriends(prev => ({ ...prev, [friendId]: false }));
    }, 2000);
  };

  const filteredChats = chats.filter(chat => 
    (chat.friendName || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (chat.friendUsername || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div 
      id="chat-modal-overlay" 
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6"
    >
      {/* Background close */}
      <div className="absolute inset-0 z-0 bg-transparent" onClick={onClose} />

      {/* Main Container */}
      <div 
        id="chat-app-box"
        className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden bg-[#0a0c10] border-0 md:border md:border-zinc-900 md:rounded-2xl md:h-[620px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 bg-[#0f1115] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00bfb2] animate-pulse" />
            <h2 className="font-sans text-base font-bold text-white">Cerotalk Mensajes</h2>
          </div>
          <button 
            id="close-chat-box"
            onClick={onClose} 
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dual Pane Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Chat Sidebar / List (Hidden on mobile when chat is active, or responsive) */}
          <div className={`w-full md:w-80 flex-col border-r border-zinc-900 bg-[#0c0e12] ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Search Input */}
            <div className="p-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-zinc-600" />
                <input 
                  id="chat-search-friends"
                  type="text" 
                  placeholder="Buscar amigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-zinc-950 py-1.5 pl-9 pr-4 font-sans text-xs text-white placeholder-zinc-600 border border-zinc-900 focus:border-[#00bfb2] focus:outline-none"
                />
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2 scrollbar-none">
              {filteredChats.length === 0 ? (
                <p className="font-sans text-center text-xs text-zinc-600 py-6">No se encontraron chats</p>
              ) : (
                filteredChats.map((chat) => (
                  <div 
                    key={chat.id}
                    id={`chat-sidebar-item-${chat.id}`}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      if (chat.unread) onMarkChatAsRead(chat.id);
                    }}
                    className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                      chat.id === activeChatId 
                        ? 'bg-[#1a1d24] border border-zinc-800/60' 
                        : 'hover:bg-zinc-950/40 border border-transparent'
                    }`}
                  >
                    {/* Circle Avatar */}
                    <div className="relative h-11 w-11 flex-shrink-0">
                      <img 
                        src={chat.friendAvatar} 
                        alt={chat.friendName} 
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      {chat.unread && (
                        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-rose-500 border-2 border-[#0a0c10]" />
                      )}
                    </div>

                    {/* Metadata & Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs font-bold text-white truncate">{chat.friendName}</span>
                        <span className="font-sans text-[10px] text-zinc-600">
                          {chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1]?.timestamp : ''}
                        </span>
                      </div>
                      <p className={`font-sans text-[11px] truncate mt-0.5 ${chat.unread ? 'text-[#00bfb2] font-semibold' : 'text-zinc-500'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window Pane */}
          <div className={`flex-1 flex flex-col bg-[#08090d] ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                {/* Chat Partner Header */}
                <div className="flex items-center gap-3 border-b border-zinc-900 bg-[#0c0e12]/80 px-4 py-3">
                  {/* Mobile Back Button */}
                  <button 
                    id="chat-back-to-list"
                    onClick={() => setActiveChatId('')} 
                    className="mr-1 rounded-full p-1 text-zinc-400 hover:bg-zinc-900 md:hidden"
                  >
                    ←
                  </button>
                  <img 
                    src={activeChat.friendAvatar} 
                    alt={activeChat.friendName} 
                    className="h-9 w-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-sans text-xs font-bold text-white leading-none">{activeChat.friendName}</h3>
                    <p className="font-sans text-[10px] text-zinc-500 mt-1">@{activeChat.friendUsername}</p>
                  </div>
                </div>

                {/* Messages Streams */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">
                  {(activeChat.messages || []).map((msg) => {
                    const isUser = msg.senderId === 'user';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs font-sans shadow-md ${
                          isUser 
                            ? 'bg-[#00bfb2] text-white rounded-tr-sm' 
                            : 'bg-[#1a1d24] text-zinc-100 rounded-tl-sm'
                        }`}>
                          <p className="leading-relaxed break-words">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isUser ? 'text-teal-100' : 'text-zinc-500'}`}>
                            <span>{msg.timestamp}</span>
                            {isUser && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typingFriends[activeChat.friendId] && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-[#1a1d24] px-4 py-3 text-zinc-100 shadow-md">
                        <div className="flex items-center gap-1.5" aria-label="Escribiendo">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00bfb2] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00bfb2] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00bfb2] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Footer */}
                <form onSubmit={handleSend} className="border-t border-zinc-900 bg-[#0c0e12]/50 p-3 flex gap-2">
                  <button 
                    id="chat-emoji-pick"
                    type="button" 
                    className="text-zinc-500 hover:text-[#ff9f1c] p-1.5 flex items-center justify-center"
                    onClick={() => setMessageInput(prev => prev + " 😊")}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <input 
                    id="chat-msg-text-input"
                    type="text" 
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 rounded-full bg-zinc-950 border border-zinc-900 px-4 py-2 font-sans text-xs text-white placeholder-zinc-650 focus:border-[#00bfb2] focus:outline-none"
                  />
                  <button 
                    id="chat-send-submit"
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                      messageInput.trim() 
                        ? 'bg-[#00bfb2] text-white active:scale-95 cursor-pointer' 
                        : 'bg-zinc-900 text-zinc-650 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <p className="font-sans text-xs text-zinc-600">Selecciona un amigo para empezar a chatear</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
