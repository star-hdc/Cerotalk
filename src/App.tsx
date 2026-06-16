/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Post, Story, Chat, Message, Notification, UserProfile } from './types';
import { 
  INITIAL_STORIES, 
  INITIAL_POSTS, 
  INITIAL_CHATS, 
  INITIAL_NOTIFICATIONS, 
  CURRENT_USER,
  INITIAL_PROFILES
} from './data/mockData';

// Component imports
import CerotalkLogo from './components/CerotalkLogo';
import StoryViewer from './components/StoryViewer';
import FeedSection from './components/FeedSection';
import CreatePostTab from './components/CreatePostTab';
import ProfileTab from './components/ProfileTab';
import ExploreTab from './components/ExploreTab';
import NotificationsModal from './components/NotificationsModal';
import ChatModal from './components/ChatModal';
import AdminTab from './components/AdminTab';

// Lucide icons
import { Home, Compass, Bell, MessageSquare, Search, Plus, Sparkles, Shield, LogOut } from 'lucide-react';

// Pool of random aesthetic avatars for simulated guest sessions
const VISITOR_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80"
];

// Failsafe sandbox storage fallback
const safeStorage = {
  memory: {} as Record<string, string>,
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage is blocked or restricted in this iframe/sandbox environment.", e);
      return safeStorage.memory[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage is blocked or restricted in this iframe/sandbox environment.", e);
      safeStorage.memory[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage is blocked or restricted in this iframe/sandbox environment.", e);
      delete safeStorage.memory[key];
    }
  },
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("localStorage is blocked or restricted in this iframe/sandbox environment.", e);
      safeStorage.memory = {};
    }
  }
};

type SharedCeroState = {
  profiles: UserProfile[];
  posts: Post[];
  stories: Story[];
  chats: Chat[];
  notifications: Notification[];
  updatedAt?: string;
};

const SHARED_STATE_API = '/api/cero-state';
const LEGACY_VISITOR_PROFILE_ID = 'simulated_user';
const ADMIN_LOGIN_USERNAME = 'admin10';
const ADMIN_LOGIN_PASSWORD = 'NF2026';
const MAIN_PROFILE_IDS = ['user', 'valeee', 'diego', 'sofia', 'lulu'];

const isVisitorProfile = (profile: UserProfile) => (
  profile.id === LEGACY_VISITOR_PROFILE_ID || profile.id.startsWith('temp_') || profile.role === 'Visitante Temp'
);

const isVisitorProfileId = (profileId: string) => (
  profileId === LEGACY_VISITOR_PROFILE_ID || profileId.startsWith('temp_')
);

const withoutVisitorProfiles = (profiles: UserProfile[]) => (
  profiles.filter(profile => profile && !isVisitorProfile(profile))
);

const normalizeVisitorCredential = (value: string) => (
  value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
);

const makeVisitorCredentialHash = (username: string, password: string) => {
  const credential = `${normalizeVisitorCredential(username)}:${password}`;
  let hash = 2166136261;

  for (let index = 0; index < credential.length; index += 1) {
    hash ^= credential.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
};

const makeVisitorProfileId = (username: string, password: string) => (
  `temp_${makeVisitorCredentialHash(username, password)}`
);

const makeVisitorUsername = (username: string, profileId: string) => {
  const cleanUsername = normalizeVisitorCredential(username).replace(/[^a-z0-9]/g, '') || 'visitante';
  return `${cleanUsername}_${profileId.replace('temp_', '').slice(0, 5)}`;
};

const getVisitorProfileStorageKey = (profileId: string) => `cero_visitor_profile_${profileId}`;

const loadVisitorProfile = (profileId: string): UserProfile | null => {
  try {
    const cached = safeStorage.getItem(getVisitorProfileStorageKey(profileId));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (parsed && typeof parsed.id === 'string' && typeof parsed.name === 'string') {
      return parsed;
    }
  } catch (error) {
    console.warn('No se pudo cargar el perfil temporal guardado.', error);
  }

  return null;
};

const saveVisitorProfile = (profile: UserProfile) => {
  safeStorage.setItem(getVisitorProfileStorageKey(profile.id), JSON.stringify(profile));
};

const getScopedVisitorStorageKey = (baseKey: string, profileId: string) => (
  isVisitorProfileId(profileId) ? `${baseKey}_${profileId}` : baseKey
);

const createVisitorProfile = (name: string, password: string): UserProfile => {
  const profileId = makeVisitorProfileId(name, password);
  const savedProfile = loadVisitorProfile(profileId);
  if (savedProfile) return savedProfile;

  const randomAvatar = VISITOR_AVATARS[Math.floor(Math.random() * VISITOR_AVATARS.length)];
  const newVisitor: UserProfile = {
    id: profileId,
    name,
    username: makeVisitorUsername(name, profileId),
    avatar: randomAvatar,
    role: 'Visitante Temp',
    bio: 'Visitante activo. Explorando las primicias e intrigas de los personajes de la serie.',
    followers: 12,
    following: 48
  };

  saveVisitorProfile(newVisitor);
  return newVisitor;
};

const getPersonalPostInteractionsKey = (actorId: string) => `cero_post_interactions_${actorId}`;

const loadPersonalPostInteractions = (actorId: string) => {
  try {
    const cached = safeStorage.getItem(getPersonalPostInteractionsKey(actorId));
    if (!cached) return { savedPostIds: [] as string[] };

    const parsed = JSON.parse(cached);
    return {
      savedPostIds: Array.isArray(parsed.savedPostIds)
        ? parsed.savedPostIds.filter((id: unknown) => typeof id === 'string')
        : []
    };
  } catch (error) {
    console.warn('No se pudieron cargar las interacciones personales.', error);
    return { savedPostIds: [] as string[] };
  }
};

const savePersonalPostInteractions = (actorId: string, interactions: { savedPostIds: string[] }) => {
  safeStorage.setItem(getPersonalPostInteractionsKey(actorId), JSON.stringify(interactions));
};

const isPostByPublicProfile = (post: Post, profiles: UserProfile[]) => {
  if (post.authorActorId && isVisitorProfileId(post.authorActorId)) return false;

  const publicProfiles = withoutVisitorProfiles(profiles || []);
  return publicProfiles.some(profile => (
    post.authorActorId === profile.id || post.authorUsername === profile.username || post.authorName === profile.name
  ));
};

const sanitizeSharedPosts = (posts: Post[], profiles: UserProfile[]) => (
  (posts || [])
    .filter(post => post && isPostByPublicProfile(post, profiles))
    .map(post => ({
      ...post,
      likedByUser: false,
      saved: false,
      likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
      savedBy: Array.isArray(post.savedBy) ? post.savedBy : []
    }))
);

const sanitizeSharedState = (state: SharedCeroState): SharedCeroState => ({
  profiles: withoutVisitorProfiles(state.profiles || []),
  posts: sanitizeSharedPosts(state.posts || [], state.profiles || []),
  stories: (state.stories || []).filter(story => story && !isVisitorProfileId(story.userId)),
  chats: state.chats || [],
  notifications: state.notifications || []
});

const hasAllMainProfiles = (profiles: UserProfile[]) => (
  MAIN_PROFILE_IDS.every(profileId => profiles.some(profile => profile && profile.id === profileId))
);

const applySharedProfiles = (incomingProfiles: UserProfile[], currentProfiles: UserProfile[], preserveVisitor = true) => {
  const visitor = preserveVisitor
    ? currentProfiles.find(profile => profile && isVisitorProfile(profile))
    : null;
  const publicProfiles = withoutVisitorProfiles(incomingProfiles);
  const existingPublicProfiles = withoutVisitorProfiles(currentProfiles);
  const missingExistingProfiles = existingPublicProfiles.filter(existingProfile => (
    existingProfile && !publicProfiles.some(profile => profile.id === existingProfile.id)
  ));
  const mergedProfiles = [...publicProfiles, ...missingExistingProfiles];

  return visitor ? [visitor, ...mergedProfiles] : mergedProfiles;
};

const mergeSharedAndPrivatePosts = (
  incomingPosts: Post[],
  currentPosts: Post[],
  publicProfiles: UserProfile[]
) => {
  const sharedIds = new Set((incomingPosts || []).map(post => post.id));
  const privatePosts = (currentPosts || []).filter(post => (
    !sharedIds.has(post.id) && !isPostByPublicProfile(post, publicProfiles)
  ));

  return [...(incomingPosts || []), ...privatePosts];
};

export function AppBody() {
  // One-time auto reset to import the brand new premium character biographies, stories, posts, chats and comments
  if (!safeStorage.getItem('cero_v4_personality_reset_final')) {
    safeStorage.setItem('cero_profiles', JSON.stringify(INITIAL_PROFILES));
    safeStorage.setItem('cero_posts', JSON.stringify(INITIAL_POSTS));
    safeStorage.setItem('cero_stories', JSON.stringify(INITIAL_STORIES));
    safeStorage.setItem('cero_chats', JSON.stringify(INITIAL_CHATS));
    safeStorage.setItem('cero_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    safeStorage.setItem('cero_v4_personality_reset_final', 'true');
  }

  const saveSharedStateTimer = useRef<number | null>(null);
  const isApplyingSharedState = useRef(false);
  const lastSharedStateUpdate = useRef<string | null>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'create' | 'profile' | 'admin'>('home');

  // Simulated Login States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const cached = safeStorage.getItem('cero_is_logged_in');
    return cached === 'true';
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const cached = safeStorage.getItem('cero_is_admin_mode');
    return cached === 'true';
  });
  
  // Data State with persistent LocalStorage retrieval (fortified against corrupt, null, or empty stores)
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const cached = safeStorage.getItem('cero_profiles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string');
          if (validated.length > 0) return validated;
        }
      }
      return INITIAL_PROFILES;
    } catch (e) {
      console.error("Error loading profiles from safeStorage:", e);
      return INITIAL_PROFILES;
    }
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    try {
      const cached = safeStorage.getItem('cero_current_profile_id');
      return (cached && cached !== 'null' && cached !== 'undefined') ? cached : 'user';
    } catch (e) {
      console.error("Error loading current profile ID:", e);
      return 'user';
    }
  });

  const currentUser = (Array.isArray(profiles) && profiles.find(p => p && p.id === currentProfileId)) || (Array.isArray(profiles) && profiles[0]) || {
    id: 'user',
    name: 'Mateo Momoa',
    username: 'mat.moa',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80',
    bio: "¡Siempre alegre y con la energía al 100%! ⚡ Vocalista de nuestra banda 'Culto al Shuco' 🎤 (sé que odian el nombre chicos, ¡pero tiene sazón!). Sobreviviente de microfonazos letales ⚡💀",
    role: "Líder & Cantante",
    followers: 1420,
    following: 382
  };
  const postInteractionActorId = currentUser.id;

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const cached = safeStorage.getItem('cero_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.authorName === 'string');
          if (validated.length > 0) return validated;
        }
      }
      return INITIAL_POSTS;
    } catch (e) {
      console.error("Error loading posts from safeStorage:", e);
      return INITIAL_POSTS;
    }
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const cached = safeStorage.getItem('cero_stories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item => 
            item && 
            typeof item === 'object' && 
            typeof item.id === 'string' && 
            !item.id.startsWith('story_') && 
            typeof item.userId === 'string'
          );
          if (validated.length > 0) return validated;
        }
      }
      return INITIAL_STORIES;
    } catch (e) {
      console.error("Error loading stories from safeStorage:", e);
      return INITIAL_STORIES;
    }
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const cachedProfileId = safeStorage.getItem('cero_current_profile_id') || 'user';
      const isVisitor = isVisitorProfileId(cachedProfileId);
      const key = isVisitor ? getScopedVisitorStorageKey('cero_visitor_chats', cachedProfileId) : 'cero_chats';
      const cached = safeStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.friendId === 'string');
          if (validated.length > 0) return validated;
        }
      }
      if (isVisitor) {
        return INITIAL_CHATS.map(c => ({
          ...c,
          unread: false,
          messages: [],
          lastMessage: 'Sin mensajes aún'
        }));
      }
      return INITIAL_CHATS;
    } catch (e) {
      console.error("Error loading chats from safeStorage:", e);
      return INITIAL_CHATS;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const cachedProfileId = safeStorage.getItem('cero_current_profile_id') || 'user';
      const isVisitor = isVisitorProfileId(cachedProfileId);
      const key = isVisitor ? getScopedVisitorStorageKey('cero_visitor_notifications', cachedProfileId) : 'cero_notifications';
      const cached = safeStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(item => item && typeof item === 'object' && typeof item.id === 'string');
          if (validated.length > 0) return validated;
        }
      }
      return isVisitor ? [] : INITIAL_NOTIFICATIONS;
    } catch (e) {
      console.error("Error loading notifications from safeStorage:", e);
      return INITIAL_NOTIFICATIONS;
    }
  });


  // Modal display togglers
  const [storyPlayingIndex, setStoryPlayingIndex] = useState<number | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Quick Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sharedStateReady, setSharedStateReady] = useState(false);
  const [personalPostInteractions, setPersonalPostInteractions] = useState(() => (
    loadPersonalPostInteractions(postInteractionActorId)
  ));

  const applySharedStateFromServer = (shared: Partial<SharedCeroState>) => {
    isApplyingSharedState.current = true;
    lastSharedStateUpdate.current = shared.updatedAt || lastSharedStateUpdate.current;
    const publicProfiles = withoutVisitorProfiles(shared.profiles || INITIAL_PROFILES);
    setProfiles(prev => applySharedProfiles(shared.profiles || INITIAL_PROFILES, prev, !isAdminMode));
    setPosts(prev => mergeSharedAndPrivatePosts(shared.posts || INITIAL_POSTS, prev, publicProfiles));
    setStories(shared.stories || INITIAL_STORIES);
    if (!isVisitorProfile(currentUser)) {
      setChats(shared.chats || INITIAL_CHATS);
      setNotifications(shared.notifications || INITIAL_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadSharedState = async () => {
      try {
        const response = await fetch(SHARED_STATE_API);
        if (!response.ok) {
          throw new Error(`Shared state failed with ${response.status}`);
        }

        const shared = await response.json() as Partial<SharedCeroState>;
        if (cancelled) return;

        // If the server returns the fallback date, it means there is no persistent backend data.
        // We should NOT overwrite our local storage with the server's empty default state.
        if (shared.updatedAt === '2000-01-01T00:00:00.000Z') {
          return;
        }

        applySharedStateFromServer(shared);
      } catch (error) {
        console.warn('No se pudo cargar el estado compartido; usando almacenamiento local.', error);
      } finally {
        if (!cancelled) {
          setSharedStateReady(true);
        }
      }
    };

    loadSharedState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sharedStateReady) return;

    if (isApplyingSharedState.current) {
      isApplyingSharedState.current = false;
      return;
    }

    if (saveSharedStateTimer.current !== null) {
      window.clearTimeout(saveSharedStateTimer.current);
    }

    saveSharedStateTimer.current = window.setTimeout(() => {
      const sharedState = sanitizeSharedState({
        profiles,
        posts,
        stories,
        chats,
        notifications
      });

      if (!hasAllMainProfiles(sharedState.profiles)) return;

      fetch(SHARED_STATE_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sharedState),
      })
        .then(response => response.ok ? response.json() : null)
        .then((saved: Partial<SharedCeroState> | null) => {
          if (saved?.updatedAt) {
            lastSharedStateUpdate.current = saved.updatedAt;
          }
        })
        .catch(error => {
          console.warn('No se pudo guardar el estado compartido.', error);
        });
    }, 300);

    return () => {
      if (saveSharedStateTimer.current !== null) {
        window.clearTimeout(saveSharedStateTimer.current);
      }
    };
  }, [sharedStateReady, profiles, posts, stories, chats, notifications]);

  useEffect(() => {
    if (!sharedStateReady) return;

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(SHARED_STATE_API);
        if (!response.ok) return;

        const shared = await response.json() as Partial<SharedCeroState>;
        if (!shared.updatedAt || shared.updatedAt === lastSharedStateUpdate.current) return;

        applySharedStateFromServer(shared);
      } catch (error) {
        console.warn('No se pudo refrescar el estado compartido.', error);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [sharedStateReady]);

  // Persist State to safeStorage (every time state updates)
  useEffect(() => {
    safeStorage.setItem('cero_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    safeStorage.setItem('cero_is_admin_mode', isAdminMode ? 'true' : 'false');
  }, [isAdminMode]);

  useEffect(() => {
    safeStorage.setItem('cero_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    safeStorage.setItem('cero_current_profile_id', currentProfileId);
  }, [currentProfileId]);

  useEffect(() => {
    safeStorage.setItem('cero_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    setPersonalPostInteractions(loadPersonalPostInteractions(postInteractionActorId));
  }, [postInteractionActorId]);

  useEffect(() => {
    savePersonalPostInteractions(postInteractionActorId, personalPostInteractions);
  }, [postInteractionActorId, personalPostInteractions]);

  useEffect(() => {
    safeStorage.setItem('cero_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    const isVisitor = isVisitorProfileId(currentProfileId);
    const key = isVisitor ? getScopedVisitorStorageKey('cero_visitor_chats', currentProfileId) : 'cero_chats';
    safeStorage.setItem(key, JSON.stringify(chats));
  }, [chats, currentProfileId]);

  useEffect(() => {
    const isVisitor = isVisitorProfileId(currentProfileId);
    const key = isVisitor ? getScopedVisitorStorageKey('cero_visitor_notifications', currentProfileId) : 'cero_notifications';
    safeStorage.setItem(key, JSON.stringify(notifications));
  }, [notifications, currentProfileId]);

  // Sync databases when current profile switches (e.g. Visitor login vs Mateo/Admin logout)
  useEffect(() => {
    const isVisitor = isVisitorProfileId(currentProfileId);
    
    // Load chats
    const chatsKey = isVisitor ? getScopedVisitorStorageKey('cero_visitor_chats', currentProfileId) : 'cero_chats';
    const cachedChats = safeStorage.getItem(chatsKey);
    if (cachedChats) {
      try {
        setChats(JSON.parse(cachedChats));
      } catch (e) {
        setChats(isVisitor ? [] : INITIAL_CHATS);
      }
    } else {
      if (isVisitor) {
        const visitorInitialChats = INITIAL_CHATS.map(c => ({
          ...c,
          unread: false,
          messages: [],
          lastMessage: 'Sin mensajes aún'
        }));
        setChats(visitorInitialChats);
        safeStorage.setItem(chatsKey, JSON.stringify(visitorInitialChats));
      } else {
        setChats(INITIAL_CHATS);
      }
    }

    // Load notifications
    const notifsKey = isVisitor ? getScopedVisitorStorageKey('cero_visitor_notifications', currentProfileId) : 'cero_notifications';
    const cachedNotifs = safeStorage.getItem(notifsKey);
    if (cachedNotifs) {
      try {
        setNotifications(JSON.parse(cachedNotifs));
      } catch (e) {
        setNotifications(isVisitor ? [] : INITIAL_NOTIFICATIONS);
      }
    } else {
      setNotifications(isVisitor ? [] : INITIAL_NOTIFICATIONS);
    }
  }, [currentProfileId]);

  // Migrate old cached user avatars if they contain the old placeholder image
  useEffect(() => {
    const oldUrl1 = "photo-1534528741775-53994a69daeb";
    const oldUrl2 = "photo-1506794778202-cad84cf45f1d";
    const newUrlPart = "photo-1501196354995-cbb51c65aaea";
    
    setPosts(prev => {
      let changed = false;
      const updated = (prev || []).map(p => {
        if (p && p.authorAvatar && typeof p.authorAvatar === 'string' && (p.authorAvatar.includes(oldUrl1) || p.authorAvatar.includes(oldUrl2))) {
          changed = true;
          const currentUrl = p.authorAvatar.includes(oldUrl1) ? oldUrl1 : oldUrl2;
          return { ...p, authorAvatar: p.authorAvatar.replace(currentUrl, newUrlPart).replace("w=150&h=150", "w=400&h=400") };
        }
        return p;
      });
      return changed ? updated : prev;
    });

    setStories(prev => {
      let changed = false;
      const updated = (prev || []).map(s => {
        if (!s) return s;
        let storyCopy = { ...s };
        let itemChanged = false;
        if (s.userAvatar && typeof s.userAvatar === 'string' && (s.userAvatar.includes(oldUrl1) || s.userAvatar.includes(oldUrl2))) {
          const currentUrl = s.userAvatar.includes(oldUrl1) ? oldUrl1 : oldUrl2;
          storyCopy.userAvatar = s.userAvatar.replace(currentUrl, newUrlPart).replace("w=150&h=150", "w=400&h=400");
          itemChanged = true;
        }
        if (s.userId === "user" && s.mediaUrl && typeof s.mediaUrl === 'string' && (s.mediaUrl.includes("photo-1498050108023-c5249f4df085") || s.mediaUrl.includes(oldUrl1) || s.mediaUrl.includes(oldUrl2))) {
          storyCopy.mediaUrl = "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&h=1200&q=85";
          storyCopy.caption = "¡Nueva foto de perfil actualizada! vibe ✨";
          itemChanged = true;
        }
        if (itemChanged) {
          changed = true;
          return storyCopy;
        }
        return s;
      });
      return changed ? updated : prev;
    });
  }, []);

  // Keep everything synchronized when profiles change (updates stories, chats, posts, comments, notifications)
  useEffect(() => {
    if (!Array.isArray(profiles) || profiles.length === 0) return;
    // Deeply synchronize and heal all states (stories, posts, comments, chats, notifications) with current profiles.
    // This repairs any historical, stale, or out-of-sync states immediately on load or when characters are edited.
    
    // 1. Stories Sync (by story.userId)
    setStories(prev => {
      let changed = false;
      const updated = (prev || []).map(story => {
        if (!story) return story;
        const p = profiles.find(profile => profile ? profile.id === story.userId : false);
        if (p && (story.userAvatar !== p.avatar || story.username !== p.username || story.displayName !== p.name)) {
          changed = true;
          return {
            ...story,
            userAvatar: p.avatar,
            username: p.username,
            displayName: p.name
          };
        }
        return story;
      });
      return changed ? updated : prev;
    });

    // 2. Chats Sync (by chat.friendId)
    setChats(prev => {
      let changed = false;
      const updated = (prev || []).map(chat => {
        if (!chat) return chat;
        const p = profiles.find(profile => profile ? profile.id === chat.friendId : false);
        if (p && (chat.friendAvatar !== p.avatar || chat.friendUsername !== p.username || chat.friendName !== p.name)) {
          changed = true;
          return {
            ...chat,
            friendAvatar: p.avatar,
            friendUsername: p.username,
            friendName: p.name
          };
        }
        return chat;
      });
      return changed ? updated : prev;
    });

    // Create profile mappings for exact text searches across names and usernames
    const profileMap = new Map<string, UserProfile>();
    profiles.forEach(p => {
      if (p) {
        if (p.username) profileMap.set(p.username.toLowerCase(), p);
        if (p.name) profileMap.set(p.name.toLowerCase(), p);
      }
    });

    // Fallbacks mapping initial user states for resilient lookup (e.g. if edited)
    const initialMappings = [
      { id: "user", names: ["mateo momoa", "mat.moa"] },
      { id: "valeee", names: ["valeee.", "val_eee"] },
      { id: "diego", names: ["di3g0", "di3g0_p"] },
      { id: "sofia", names: ["sofi_a", "sofia"] },
      { id: "lulu", names: ["lu_lu", "lu_lu.sun"] }
    ];
    
    initialMappings.forEach(mapping => {
      const p = profiles.find(profile => profile ? profile.id === mapping.id : false);
      if (p) {
        mapping.names.forEach(n => {
          if (!profileMap.has(n)) {
            profileMap.set(n, p);
          }
        });
      }
    });

    // 3. Posts & Comments Sync
    setPosts(prev => {
      let changed = false;
      const updated = (prev || []).map(post => {
        if (!post) return post;
        let postCopy = { ...post };
        let postChanged = false;

        const authorProfileByUsername = (post.authorUsername && typeof post.authorUsername === 'string') 
          ? profileMap.get(post.authorUsername.toLowerCase()) 
          : undefined;
        const authorProfileByName = (post.authorName && typeof post.authorName === 'string') 
          ? profileMap.get(post.authorName.toLowerCase()) 
          : undefined;
        const authorProfileByActor = (post.authorActorId && typeof post.authorActorId === 'string')
          ? profiles.find(profile => profile?.id === post.authorActorId)
          : undefined;
        const safeAuthorProfileByName = authorProfileByName && !isVisitorProfile(authorProfileByName)
          ? authorProfileByName
          : undefined;
        const pAuthor = authorProfileByActor || authorProfileByUsername || safeAuthorProfileByName;

        if (pAuthor) {
          if (post.authorAvatar !== pAuthor.avatar || post.authorName !== pAuthor.name || post.authorUsername !== pAuthor.username) {
            postCopy.authorAvatar = pAuthor.avatar;
            postCopy.authorName = pAuthor.name;
            postCopy.authorUsername = pAuthor.username;
            postChanged = true;
          }
        }

        const commentsUpdated = (post.comments || []).map(c => {
          if (!c) return c;
          const cProfileByUsername = (c.authorUsername && typeof c.authorUsername === 'string') 
            ? profileMap.get(c.authorUsername.toLowerCase()) 
            : undefined;
          const cProfileByName = (c.authorName && typeof c.authorName === 'string') 
            ? profileMap.get(c.authorName.toLowerCase()) 
            : undefined;
          const cProfileByActor = (c.authorActorId && typeof c.authorActorId === 'string')
            ? profiles.find(profile => profile?.id === c.authorActorId)
            : undefined;
          const safeCommentProfileByName = cProfileByName && !isVisitorProfile(cProfileByName)
            ? cProfileByName
            : undefined;
          const pComm = cProfileByActor || cProfileByUsername || safeCommentProfileByName;

          if (pComm) {
            if (c.authorAvatar !== pComm.avatar || c.authorName !== pComm.name || c.authorUsername !== pComm.username) {
              return {
                ...c,
                authorAvatar: pComm.avatar,
                authorName: pComm.name,
                authorUsername: pComm.username
              };
            }
          }
          return c;
        });

        if (JSON.stringify(post.comments || []) !== JSON.stringify(commentsUpdated)) {
          postCopy.comments = commentsUpdated;
          postChanged = true;
        }

        if (postChanged) {
          changed = true;
          return postCopy;
        }
        return post;
      });
      return changed ? updated : prev;
    });

    // 4. Notifications Sync
    setNotifications(prev => {
      let changed = false;
      const updated = (prev || []).map(notif => {
        if (!notif) return notif;
        const pSender = (notif.senderName && typeof notif.senderName === 'string') 
          ? profileMap.get(notif.senderName.toLowerCase()) 
          : undefined;
        if (pSender && (notif.senderAvatar !== pSender.avatar || notif.senderName !== pSender.name)) {
          changed = true;
          return {
            ...notif,
            senderAvatar: pSender.avatar,
            senderName: pSender.name
          };
        }
        return notif;
      });
      return changed ? updated : prev;
    });

  }, [profiles]);

  // SIMULATE REAL-TIME NETWORK ENGAGEMENTS (Background likes & notifications)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random friend dynamically from active profiles list to ensure up-to-date names and avatars
      const characterIds = ['valeee', 'sofia', 'diego', 'lulu'];
      const randomId = characterIds[Math.floor(Math.random() * characterIds.length)];
      const matchedProfile = profiles.find(p => p ? p.id === randomId : false);
      if (!matchedProfile) return;

      const randomFriend = {
        id: matchedProfile.id,
        name: matchedProfile.name,
        avatar: matchedProfile.avatar,
        username: matchedProfile.username
      };
      
      // Determine random trigger
      const randType = Math.random();
      
      if (randType < 0.35) {
        // Friend likes own post
        const userPosts = posts.filter(p => {
          const isUserAuthor = p.authorName === currentUser.name || p.authorUsername === currentUser.username;
          const alreadyLiked = p.likedBy?.includes(randomFriend.id);
          return isUserAuthor && !alreadyLiked;
        });

        if (userPosts.length > 0) {
          const targetPost = userPosts[Math.floor(Math.random() * userPosts.length)];
          
          setPosts(prev => prev.map(p => {
            if (p.id === targetPost.id) {
              const alreadyLiked = p.likedBy?.includes(randomFriend.id);
              if (alreadyLiked) return p;
              return { 
                ...p, 
                likes: p.likes + 1,
                likedBy: [...(p.likedBy || []), randomFriend.id]
              };
            }
            return p;
          }));

          // Trigger notification
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: 'like',
            senderName: randomFriend.name,
            senderAvatar: randomFriend.avatar,
            detailText: `le dio me gusta a tu publicación de Cerotalk`,
            isRead: false,
            timestamp: 'Justo ahora',
            postId: targetPost.id
          };
          setNotifications(prev => {
            if (prev.some(n => n.postId === targetPost.id && n.senderName === randomFriend.name && n.type === 'like')) {
              return prev;
            }
            return [newNotif, ...prev];
          });
        }
      } else if (randType < 0.65) {
        // Friend sends simple chat message
        const friendId = randomFriend.id;
        const targetChat = chats.find(c => c.friendId === friendId);
        
        if (targetChat) {
          const messages = [
            '¡Oye! ¿Viste mi última historia en Cerotalk? 🤩',
            '¡Mira esta locura que encontré en la pestaña de tendencias!',
            '¿Qué andas programando crack? 👾',
            'Me encanta el tema oscuro minimalista de esta app.',
            'Oye, deberíamos salir a tomar unas fotos pronto.'
          ];
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          
          const newMsg: Message = {
            id: `msg_bg_${Date.now()}`,
            senderId: friendId,
            text: randomMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setChats(prev => prev.map(c => {
            if (c.friendId === friendId) {
              return {
                ...c,
                lastMessage: randomMsg,
                unread: true,
                messages: [...c.messages, newMsg]
              };
            }
            return c;
          }));
        }
      }
    }, 45000); // Check actions every 45s

    return () => clearInterval(interval);
  }, [profiles, posts, chats, currentUser]);

  // UNREAD NOTIFICATIONS BADGES COUNT
  const unreadNotifCount = (notifications || []).filter(n => n && !n.isRead).length;
  const unreadChatsCount = (chats || []).filter(c => c && c.unread).length;

  // INTERACTION FUNCTIONS
  
  // 1. Toggle Liking Posts
  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
        const isLiked = likedBy.includes(postInteractionActorId);
        const nextLikedBy = isLiked
          ? likedBy.filter(actorId => actorId !== postInteractionActorId)
          : [...likedBy, postInteractionActorId];

        return {
          ...post,
          likedByUser: !isLiked,
          likedBy: nextLikedBy,
          likes: Math.max(0, post.likes + (isLiked ? -1 : 1))
        };
      }
      return post;
    }));
  };

  // 2. Slide Comments
  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      authorActorId: postInteractionActorId,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: 'Justo ahora'
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));

    // Optional simulated comment response from another user (random delay)
    setTimeout(() => {
      const friends = [
        { 
          name: 'Sofía', 
          username: 'sofi_a', 
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
          replies: [
            "¡Me encanta leer esto! 🌸 Buenísima vibra como siempre, Mateo.",
            "De acuerdo, aunque sigo pensando que 'Culto al Shuco' es un nombre canalla jaja 😭🎸",
            "¡Qué lindo post! Me inspiras a ponerme uno de mis vestidos rosas hoy ✨",
            "¡Brutal! Nos vemos al rato en Le Rock 📖🎸"
          ] 
        },
        { 
          name: 'Diego', 
          username: 'Di3g0', 
          avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80',
          replies: [
            "Ya sabes que yo ando de acuerdo con todo lo que sea música y rock 😏🎸",
            "Suena genial brother, aunque el solo de mi guitarra es el que realmente brilla aquí.",
            "Galán, te veo hoy en el club para ver a las chicas o qué? Jaja",
            "¡De una! Listo para producir el próximo hit de la banda 🎵🕹️"
          ] 
        },
        {
          name: 'Valeria',
          username: 'valeee.',
          avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80',
          replies: [
            "Me gusta el orden de este post 📋. Sigan practicando para el show de hoy.",
            "Recordatorio: ¡Lucía, no olvides el balance! Y Mateo, no te electrocutes hoy por favor 😂⚡",
            "¡Muy bien! Organizándonos el éxito llegará pronto. Atte: la mánager.",
            "Le Rock abre temprano hoy, así que todos activos por favor."
          ]
        },
        {
          name: 'Lucía',
          username: 'Lu_Lu',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80',
          replies: [
            "Ay, qué lindo post! 💅 Soy súper fan de nosotras las bajistas estrella.",
            "Oye, perdón por equivocarme con la dirección la otra vez, pero el meme de Mateo estuvo increíble 😂⚡",
            "Yo fluyo demasiado con este ambiente libre y único 🌟. No soy pick me, pero me encanta.",
            "A que toco el bajo mucho mejor que todos ustedes juntos jaja 😘🎸"
          ]
        }
      ];
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      const automatedReplies = randomFriend.replies;
      const friendComment = {
        id: `comment_reply_${Date.now()}`,
        authorName: randomFriend.name,
        authorUsername: randomFriend.username,
        authorAvatar: randomFriend.avatar,
        content: automatedReplies[Math.floor(Math.random() * automatedReplies.length)],
        createdAt: 'Hace un momento'
      };

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), friendComment]
          };
        }
        return p;
      }));
    }, 12000);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;

      const comments = post.comments || [];
      const targetComment = comments.find(comment => comment.id === commentId);
      const canDelete = Boolean(
        targetComment && (
          isAdminMode ||
          targetComment.authorActorId === postInteractionActorId ||
          targetComment.authorUsername === currentUser.username
        )
      );

      if (!canDelete) return post;

      return {
        ...post,
        comments: comments.filter(comment => comment.id !== commentId)
      };
    }));
  };

  // 2.5 Manual Story Publishing
  const handleAddStory = (userId: string, mediaUrl: string, caption: string) => {
    const authorProfile = profiles.find(p => p.id === userId) || currentUser;
    const newStory: Story = {
      id: `manual_story_${Date.now()}`,
      userId: authorProfile.id,
      username: authorProfile.username,
      displayName: authorProfile.id === currentUser.id ? 'Tu historia' : authorProfile.name,
      userAvatar: authorProfile.avatar,
      mediaUrl: mediaUrl,
      viewed: false,
      caption: caption || ''
    };

    setStories(prev => {
      const updated = [newStory, ...(prev || [])];
      safeStorage.setItem('cero_stories', JSON.stringify(updated));
      return updated;
    });
  };

  // 2.6 Delete Story (Only accessible in Admin mode)
  const handleDeleteStory = (storyId: string) => {
    setStories(prev => {
      const updated = (prev || []).filter(s => s.id !== storyId);
      safeStorage.setItem('cero_stories', JSON.stringify(updated));
      return updated;
    });
    setStoryPlayingIndex(null);
  };

  // 2.7 Delete Post (Only accessible in Admin mode)
  const handleDeletePost = (postId: string) => {
    setPosts(prev => {
      const updated = (prev || []).filter(p => p.id !== postId);
      safeStorage.setItem('cero_posts', JSON.stringify(updated));
      return updated;
    });
  };

  // 3. Mark saved/bookmark posts
  const handleToggleSave = (postId: string) => {
    const targetPost = posts.find(post => post.id === postId);

    if (targetPost && isPostByPublicProfile(targetPost, profiles)) {
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;

        const savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
        const isSaved = savedBy.includes(postInteractionActorId);
        const nextSavedBy = isSaved
          ? savedBy.filter(actorId => actorId !== postInteractionActorId)
          : [...savedBy, postInteractionActorId];

        return {
          ...post,
          saved: !isSaved,
          savedBy: nextSavedBy
        };
      }));
      return;
    }

    setPersonalPostInteractions(prev => {
      const isSaved = prev.savedPostIds.includes(postId);
      return {
        ...prev,
        savedPostIds: isSaved
          ? prev.savedPostIds.filter(savedPostId => savedPostId !== postId)
          : [...prev.savedPostIds, postId]
      };
    });
  };

  // 4. Create post author submissions
  const handleAddPost = (postDetails: Omit<Post, 'id' | 'likes' | 'likedByUser' | 'comments' | 'shares' | 'saved' | 'createdAt'>) => {
    const postId = `post_${Date.now()}`;
    const newPost: Post = {
      ...postDetails,
      id: postId,
      authorActorId: currentUser.id,
      likes: 0,
      likedByUser: false,
      comments: [],
      shares: 0,
      saved: false,
      savedBy: [],
      createdAt: 'Hace un momento'
    };

    setPosts(prev => [newPost, ...prev]);

    // Visitor reactive engagement simulation triggers
    if (isVisitorProfile(currentUser)) {
      // 1. Valeria likes after 5s
      setTimeout(() => {
        let likedSuccess = false;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy?.includes('valeee');
            if (alreadyLiked) return p;
            likedSuccess = true;
            return {
              ...p,
              likes: p.likes + 1,
              likedBy: [...(p.likedBy || []), 'valeee']
            };
          }
          return p;
        }));
        const valeee = profiles.find(p => p.id === 'valeee');
        if (valeee) {
          setNotifications(prev => {
            if (!likedSuccess) return prev;
            return [
              {
                id: `v_not_like_val_${Date.now()}`,
                type: 'like',
                senderName: valeee.name,
                senderAvatar: valeee.avatar,
                detailText: "le dio me gusta a tu publicación de Cerotalk 📋✨",
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              ...prev
            ];
          });
        }
      }, 5000);

      // 2. Sofía likes & comments after 12s
      setTimeout(() => {
        const commentContent = "¡Qué bonita publicación! Me encanta tu vibra, bienvenida/o a la comunidad de Cerotalk 🌸✨ Ensayemos un rato hoy.";
        let likedSuccess = false;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy?.includes('sofia');
            if (alreadyLiked) return p;
            likedSuccess = true;
            return {
              ...p,
              likes: p.likes + 1,
              likedBy: [...(p.likedBy || []), 'sofia'],
              comments: [
                ...(p.comments || []),
                {
                  id: `v_comm_sofia_${Date.now()}`,
                  authorName: "Sofía",
                  authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
                  content: commentContent,
                  createdAt: "Hace un momento"
                }
              ]
            };
          }
          return p;
        }));
        const sofia = profiles.find(p => p.id === 'sofia');
        if (sofia) {
          setNotifications(prev => {
            if (!likedSuccess) return prev;
            return [
              {
                id: `v_not_comm_sofia_${Date.now()}`,
                type: 'comment',
                senderName: sofia.name,
                senderAvatar: sofia.avatar,
                detailText: `comentó: "${commentContent.substring(0, 30)}..."`,
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              {
                id: `v_not_like_sofia_${Date.now()}`,
                type: 'like',
                senderName: sofia.name,
                senderAvatar: sofia.avatar,
                detailText: "le dio me gusta a tu publicación de Cerotalk 🌸",
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              ...prev
            ];
          });
        }
      }, 12000);

      // 3. Diego likes & comments after 20s
      setTimeout(() => {
        const commentContent = "¡Ey galán! Qué buen estilo tienes para publicar, de seguro te gustarán mis solos de guitarra en Le Rock hoy 😉🎸";
        let likedSuccess = false;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy?.includes('diego');
            if (alreadyLiked) return p;
            likedSuccess = true;
            return {
              ...p,
              likes: p.likes + 1,
              likedBy: [...(p.likedBy || []), 'diego'],
              comments: [
                ...(p.comments || []),
                {
                  id: `v_comm_diego_${Date.now()}`,
                  authorName: "Diego",
                  authorAvatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
                  content: commentContent,
                  createdAt: "Hace un momento"
                }
              ]
            };
          }
          return p;
        }));
        const diego = profiles.find(p => p.id === 'diego');
        if (diego) {
          setNotifications(prev => {
            if (!likedSuccess) return prev;
            return [
              {
                id: `v_not_comm_dieg_${Date.now()}`,
                type: 'comment',
                senderName: diego.name,
                senderAvatar: diego.avatar,
                detailText: `comentó: "${commentContent.substring(0, 30)}..."`,
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              {
                id: `v_not_like_dieg_${Date.now()}`,
                type: 'like',
                senderName: diego.name,
                senderAvatar: diego.avatar,
                detailText: "le dio me gusta a tu publicación de Cerotalk 😏🔥",
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              ...prev
            ];
          });
        }
      }, 20000);

      // 4. Lucía likes & comments after 28s
      setTimeout(() => {
        const commentContent = "¡Ay me encantó tu post! Super auténtico y cool como yo 💅. Nos vemos al rato en el club jajaja 🌟";
        let likedSuccess = false;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy?.includes('lulu');
            if (alreadyLiked) return p;
            likedSuccess = true;
            return {
              ...p,
              likes: p.likes + 1,
              likedBy: [...(p.likedBy || []), 'lulu'],
              comments: [
                ...(p.comments || []),
                {
                  id: `v_comm_lulu_${Date.now()}`,
                  authorName: "Lucía",
                  authorAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
                  content: commentContent,
                  createdAt: "Hace un momento"
                }
              ]
            };
          }
          return p;
        }));
        const lulu = profiles.find(p => p.id === 'lulu');
        if (lulu) {
          setNotifications(prev => {
            if (!likedSuccess) return prev;
            return [
              {
                id: `v_not_comm_lulu_${Date.now()}`,
                type: 'comment',
                senderName: lulu.name,
                senderAvatar: lulu.avatar,
                detailText: `comentó: "${commentContent.substring(0, 30)}..."`,
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              {
                id: `v_not_like_lulu_${Date.now()}`,
                type: 'like',
                senderName: lulu.name,
                senderAvatar: lulu.avatar,
                detailText: "le dio me gusta a tu publicación de Cerotalk 💋🎸",
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              ...prev
            ];
          });
        }
      }, 28000);

      // 5. Mateo Momoa likes & comments after 35s
      setTimeout(() => {
        const commentContent = "¡Increíble aporte! ⚡ Tienes toda la vibra que buscamos en Le Rock. ¡Ojalá te des una vuelta hoy para escucharnos cantar! 🎤🔥";
        let likedSuccess = false;
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const alreadyLiked = p.likedBy?.includes('user');
            if (alreadyLiked) return p;
            likedSuccess = true;
            return {
              ...p,
              likes: p.likes + 1,
              likedBy: [...(p.likedBy || []), 'user'],
              comments: [
                ...(p.comments || []),
                {
                  id: `v_comm_mateo_${Date.now()}`,
                  authorName: "Mateo Momoa",
                  authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&h=150&q=80",
                  content: commentContent,
                  createdAt: "Hace un momento"
                }
              ]
            };
          }
          return p;
        }));
        const mateo = profiles.find(p => p.id === 'user');
        if (mateo) {
          setNotifications(prev => {
            if (!likedSuccess) return prev;
            return [
              {
                id: `v_not_comm_mateo_${Date.now()}`,
                type: 'comment',
                senderName: mateo.name,
                senderAvatar: mateo.avatar,
                detailText: `comentó: "${commentContent.substring(0, 30)}..."`,
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              {
                id: `v_not_like_mateo_${Date.now()}`,
                type: 'like',
                senderName: mateo.name,
                senderAvatar: mateo.avatar,
                detailText: "le dio me gusta a tu publicación de Cerotalk ⚡🎤",
                isRead: false,
                timestamp: "Hace un momento",
                postId: postId
              },
              ...prev
            ];
          });
        }
      }, 35000);
    }
  };

  // 4.1 CASCADE UPDATE ANY PROFILE STATISTICS & FIELDS OF managed character
  const handleUpdateProfile = (profileId: string, updatedFields: Partial<UserProfile>) => {
    const targetProfile = profiles.find(p => p ? p.id === profileId : false);
    if (!targetProfile) return;

    const oldUsername = targetProfile.username;
    const oldName = targetProfile.name;
    const oldAvatar = targetProfile.avatar;

    const newUsername = updatedFields.username !== undefined ? updatedFields.username : oldUsername;
    const newName = updatedFields.name !== undefined ? updatedFields.name : oldName;
    const newAvatar = updatedFields.avatar !== undefined ? updatedFields.avatar : oldAvatar;

    // A. Update profiles list state
    setProfiles(prev => {
      const updated = prev.map(p => p.id === profileId ? { ...p, ...updatedFields } : p);
      safeStorage.setItem('cero_profiles', JSON.stringify(updated));
      return updated;
    });

    // Cascade edit posts, stories, chats, notifications if names, usernames, or avatars changed
    const hasAvatarChange = updatedFields.avatar !== undefined && updatedFields.avatar !== oldAvatar;
    const hasNameChange = updatedFields.name !== undefined && updatedFields.name !== oldName;
    const hasUsernameChange = updatedFields.username !== undefined && updatedFields.username !== oldUsername;

    if (hasAvatarChange || hasNameChange || hasUsernameChange) {
      // B. Cascade edit posts author picture & comments authored by edited user
      setPosts(prev => {
        const updated = prev.map(post => {
          let updatedPost = { ...post };
          let postChanged = false;

          if (post.authorUsername === oldUsername || post.authorName === oldName) {
            if (hasAvatarChange) updatedPost.authorAvatar = newAvatar;
            if (hasNameChange) updatedPost.authorName = newName;
            if (hasUsernameChange) updatedPost.authorUsername = newUsername;
            postChanged = true;
          }

          const commentsUpdated = (post.comments || []).map(c => {
            if (!c) return c;
            if (c.authorUsername === oldUsername || c.authorName === oldName) {
              return {
                ...c,
                ...(hasAvatarChange ? { authorAvatar: newAvatar } : {}),
                ...(hasNameChange ? { authorName: newName } : {}),
                ...(hasUsernameChange ? { authorUsername: newUsername } : {})
              };
            }
            return c;
          });

          if (JSON.stringify(post.comments || []) !== JSON.stringify(commentsUpdated)) {
            updatedPost.comments = commentsUpdated;
            postChanged = true;
          }

          return postChanged ? updatedPost : post;
        });
        safeStorage.setItem('cero_posts', JSON.stringify(updated));
        return updated;
      });

      // C. Cascade edit stories userAvatar & active story mediaUrl
      setStories(prev => {
        const updated = prev.map(story => {
          let storyCopy = { ...story };
          let itemChanged = false;
          
          if (story.username === oldUsername || story.userId === profileId) {
            if (hasAvatarChange) storyCopy.userAvatar = newAvatar;
            if (hasUsernameChange) storyCopy.username = newUsername;
            if (hasNameChange) storyCopy.displayName = newName;
            itemChanged = true;
          }
          
          if (story.userId === profileId && (story.mediaUrl === oldAvatar || story.mediaUrl === oldAvatar)) {
            if (hasAvatarChange && profileId === 'user') {
              storyCopy.mediaUrl = newAvatar;
              itemChanged = true;
            }
          }

          return itemChanged ? storyCopy : story;
        });
        safeStorage.setItem('cero_stories', JSON.stringify(updated));
        return updated;
      });

      // D. Cascade edit chats last friend avatar representation
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.friendUsername === oldUsername || chat.friendId === profileId) {
            return {
              ...chat,
              ...(hasAvatarChange ? { friendAvatar: newAvatar } : {}),
              ...(hasNameChange ? { friendName: newName } : {}),
              ...(hasUsernameChange ? { friendUsername: newUsername } : {})
            };
          }
          return chat;
        });
        safeStorage.setItem('cero_chats', JSON.stringify(updated));
        return updated;
      });

      // E. Cascade edit notifications sender icon representation
      setNotifications(prev => {
        const updated = prev.map(notif => {
          const matches = notif.senderName === oldName || (notif.senderName && notif.senderName.toLowerCase().replace('.', '') === profileId);
          if (matches) {
            return {
              ...notif,
              ...(hasAvatarChange ? { senderAvatar: newAvatar } : {}),
              ...(hasNameChange ? { senderName: newName } : {})
            };
          }
          return notif;
        });
        safeStorage.setItem('cero_notifications', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // 4.2 CLEAN RESET ALL STORAGE STATE TO SYSTEM DEFAULT
  const handleResetFactory = () => {
    safeStorage.clear();
    setProfiles(INITIAL_PROFILES);
    setCurrentProfileId('user');
    setPosts(INITIAL_POSTS);
    setStories(INITIAL_STORIES);
    setChats(INITIAL_CHATS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTab('home');
    fetch(`${SHARED_STATE_API}/reset`, { method: 'POST' }).catch(error => {
      console.warn('No se pudo reiniciar el estado compartido.', error);
    });
  };


  // 5. Chat dialogues - Appends messages
  const handleSendMessage = (friendId: string, text: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(chat => {
      if (chat.friendId === friendId) {
        return {
          ...chat,
          lastMessage: text,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));
  };

  // 6. Direct Message auto replies receiver
  const handleReceiveAutoReply = (friendId: string, text: string) => {
    const newMsg: Message = {
      id: `msg_reply_${Date.now()}`,
      senderId: friendId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(chat => {
      if (chat.friendId === friendId) {
        return {
          ...chat,
          lastMessage: text,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));
  };

  // 7. Marks unread state inside DM
  const handleMarkChatAsRead = (chatId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, unread: false };
      }
      return c;
    }));
  };

  // 8. Notifications overlays reads
  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleShareDetails = (postId: string) => {
    // Increment sharing list count
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, shares: p.shares + 1 };
      }
      return p;
    }));
  };

  // Direct layout zooming helper (switches active selected tab & triggers focus)
  const handleSelectPostFromGrid = (postId: string) => {
    setActiveTab('home');
    // Scroll directly to matched element
    setTimeout(() => {
      const el = document.getElementById(`post-card-${postId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flashes high color focus
      el?.classList.add('ring-2', 'ring-[#00bfb2]');
      setTimeout(() => el?.classList.remove('ring-2', 'ring-[#00bfb2]'), 2500);
    }, 150);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminMode(false);
    safeStorage.removeItem('cero_is_logged_in');
    safeStorage.removeItem('cero_is_admin_mode');
    setCurrentProfileId('user');
    setActiveTab('home');
  };

  if (isLoggedIn && !sharedStateReady) {
    return (
      <div id="cero-shared-state-loading" className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative w-full">
        <span className="fixed top-20 left-[20%] h-80 w-80 rounded-full bg-[#00bfb2]/5 blur-[120px] pointer-events-none" />
        <span className="fixed bottom-20 right-[25%] h-80 w-80 rounded-full bg-[#ff9f1c]/5 blur-[120px] pointer-events-none" />

        <div className="flex flex-col items-center gap-4">
          <CerotalkLogo className="h-9" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-900">
            <span className="block h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-[#00bfb2]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div id="cero-login-stage" className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative w-full">
        <span className="fixed top-20 left-[20%] h-80 w-80 rounded-full bg-[#00bfb2]/5 blur-[120px] pointer-events-none" />
        <span className="fixed bottom-20 right-[25%] h-80 w-80 rounded-full bg-[#ff9f1c]/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-sm bg-[#08090b] border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
          <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#ff9f1c]/5 blur-2xl pointer-events-none" />
          <span className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#00bfb2]/5 blur-2xl pointer-events-none" />

          <div className="text-center space-y-2 pt-4">
            <div className="flex justify-center">
              <CerotalkLogo className="h-9" />
            </div>
            <p className="font-sans text-[10px] text-[#ff9f1c] font-black uppercase tracking-widest mt-1">
              Acceso de Usuario
            </p>
            <p className="font-sans text-xs text-zinc-400 max-w-xs mx-auto leading-normal">
              Entra para explorar la red social de los personajes de nuestra serie ficticia.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const nameInput = (e.target as HTMLFormElement).elements.namedItem('username') as HTMLInputElement;
              const passwordInput = (e.target as HTMLFormElement).elements.namedItem('password') as HTMLInputElement;
              const name = nameInput.value.trim();
              const password = passwordInput.value;

              if (!name) return;

              const normalizedName = normalizeVisitorCredential(name);

              if (normalizedName === ADMIN_LOGIN_USERNAME) {
                if (password !== ADMIN_LOGIN_PASSWORD) {
                  window.alert('Contraseña de Admin incorrecta.');
                  return;
                }

                const adminProfile = profiles.find(profile => profile.id === 'user') || INITIAL_PROFILES.find(profile => profile.id === 'user') || INITIAL_PROFILES[0];

                setIsAdminMode(true);
                setCurrentProfileId(adminProfile.id);
                safeStorage.setItem('cero_current_profile_id', adminProfile.id);
                safeStorage.setItem('cero_is_admin_mode', 'true');
                setActiveTab('admin');
                setIsLoggedIn(true);
              } else {
                setIsAdminMode(false);
                const visitorProfile = createVisitorProfile(name, password);

                setProfiles(prev => {
                  const cleaned = prev.filter(p => !isVisitorProfile(p));
                  const updated = [visitorProfile, ...cleaned];
                  safeStorage.setItem('cero_profiles', JSON.stringify(updated));
                  return updated;
                });
                setCurrentProfileId(visitorProfile.id);
                setIsLoggedIn(true);
              }
            }} 
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">
                Nombre o Usuario:
              </label>
              <div className="relative">
                <input 
                  name="username"
                  type="text"
                  required
                  placeholder="Cualquier nombre..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-900 p-3 pl-9 font-sans text-xs text-white placeholder-zinc-800 focus:border-[#00bfb2] focus:outline-none transition-all"
                />
                <span className="absolute left-3 top-3.5 text-zinc-500 font-mono text-xs">@</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">
                Contraseña:
              </label>
              <div className="relative">
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="Cualquier contraseña..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-900 p-3 font-sans text-xs text-white placeholder-zinc-800 focus:border-[#00bfb2] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 font-sans text-xs font-bold rounded-xl text-neutral-900 bg-[#00bfb2] hover:bg-teal-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>

          <footer className="text-center font-sans text-[9px] text-zinc-700 pt-1">
            Cerotalk Beta v1.0.1 • Diseñado con alta fidelidad
          </footer>
        </div>
      </div>
    );
  }

  const isTempVisitorUsername = (username: string): boolean => {
    const profile = profiles.find(p => p.username === username);
    if (profile) {
      return isVisitorProfile(profile);
    }
    const knownMainUsernames = ['mat.moa', 'valeee.', 'Di3g0', 'sofi_a', 'Lu_Lu'];
    return !knownMainUsernames.includes(username);
  };

  const isTempVisitorStory = (story: Story): boolean => {
    const profile = profiles.find(p => p.id === story.userId || p.username === story.username);
    if (profile) {
      return isVisitorProfile(profile);
    }
    const knownMainUsernames = ['mat.moa', 'valeee.', 'Di3g0', 'sofi_a', 'Lu_Lu'];
    return !knownMainUsernames.includes(story.username);
  };

  const visiblePosts = (posts || []).filter(post => {
    if (post.authorActorId && isVisitorProfileId(post.authorActorId)) {
      return post.authorActorId === currentUser.id;
    }

    if (isTempVisitorUsername(post.authorUsername)) {
      return currentUser.username === post.authorUsername;
    }
    return true;
  }).map(post => ({
    ...post,
    likedByUser: Array.isArray(post.likedBy) && post.likedBy.includes(postInteractionActorId),
    saved: (Array.isArray(post.savedBy) && post.savedBy.includes(postInteractionActorId))
      || personalPostInteractions.savedPostIds.includes(post.id)
  }));

  const visibleStories = (stories || []).filter(story => {
    if (isTempVisitorStory(story)) {
      return currentUser.id === story.userId || currentUser.username === story.username;
    }
    return true;
  });

  return (
    <div id="cero-app-root" className="min-h-screen bg-black flex flex-col items-center">
      
      {/* GLOW DECORATIVE BLABS (Vaporwave aesthetics) */}
      <span className="fixed top-20 left-[20%] h-80 w-80 rounded-full bg-[#00bfb2]/5 blur-[120px] pointer-events-none glow-glow" />
      <span className="fixed bottom-20 right-[25%] h-80 w-80 rounded-full bg-[#ff9f1c]/5 blur-[120px] pointer-events-none glow-glow" style={{ animationDelay: '3s' }} />

      {/* Main Responsive Wrapper */}
      <div className="w-full max-w-md min-h-screen bg-[#08090b] flex flex-col relative border-x border-zinc-950 shadow-2xl">
        
        {/* HEADER BRAND LINE (Matching Mateo Momoa screens) */}
        <header id="cero-header" className="sticky top-0 z-30 bg-[#08090b]/90 backdrop-blur-md border-b border-zinc-950 p-4 pb-3 flex items-center justify-between">
          <CerotalkLogo className="h-6.5" />

          {/* Right Action Icons panel */}
          <div className="flex items-center gap-4 text-zinc-300">
            {/* Quick Admin console */}
            {isAdminMode && (
              <button 
                id="header-nav-admin"
                onClick={() => {
                  setActiveTab('admin');
                  setShowNotifModal(false);
                  setShowChatModal(false);
                }}
                className={`hover:text-[#ff9f1c] relative transition-all duration-300 p-1.5 rounded-full cursor-pointer flex items-center justify-center ${
                  activeTab === 'admin' 
                    ? 'text-[#ff9f1c] bg-[#ff9f1c]/10 scale-105' 
                    : 'hover:bg-zinc-900/40 text-zinc-400'
                }`}
                title="Consola de Administrador"
              >
                <Shield className="h-[18px] w-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9f1c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff9f1c]"></span>
                </span>
              </button>
            )}

            {/* Quick search icon switches active explore dashboard */}
            <button 
              id="header-nav-search"
              onClick={() => {
                setActiveTab('explore');
                setShowNotifModal(false);
                setShowChatModal(false);
              }}
              className={`hover:text-[#00bfb2] transition-colors p-1 rounded-full cursor-pointer ${activeTab === 'explore' ? 'text-[#00bfb2]' : ''}`}
            >
              <Search className="h-[21px] w-[21px]" />
            </button>

            {/* Notifications Alert with real-time numeric indicator badge */}
            <button 
              id="header-nav-notifications"
              onClick={() => {
                setShowNotifModal(true);
                setShowChatModal(false);
              }}
              className="relative hover:text-rose-500 transition-colors p-1 rounded-full cursor-pointer"
            >
              <Bell className="h-[21px] w-[21px]" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-sans font-bold text-white ring-2 ring-[#08090b]">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Messages inbox with unread indicator badge */}
            <button 
              id="header-nav-chats"
              onClick={() => {
                setShowChatModal(true);
                setShowNotifModal(false);
              }}
              className="relative hover:text-[#00bfb2] transition-colors p-1 rounded-full cursor-pointer"
            >
              <MessageSquare className="h-[21px] w-[21px]" />
              {unreadChatsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-sans font-bold text-white ring-2 ring-[#08090b]">
                  {unreadChatsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* SECONDARY NAVIGATION TABS (Perfect match of icons in screenshot) */}
        <nav id="cero-tabs-bar" className="sticky top-[55px] z-20 bg-[#08090b]/90 backdrop-blur-md border-b border-zinc-950 flex justify-around select-none">
          {/* 1. Feed / Home Button */}
          <button 
            id="tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center flex-1 py-3 border-b-2 relative transition-all ${
              activeTab === 'home' 
                ? 'text-[#00bfb2] border-[#00bfb2]' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <Home className="h-5 w-5" />
          </button>

          {/* 2. Compass / Explore Button */}
          <button 
            id="tab-explore"
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center flex-1 py-3 border-b-2 transition-all ${
              activeTab === 'explore' 
                ? 'text-[#00bfb2] border-[#00bfb2]' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <Compass className="h-5 w-5" />
          </button>

          {/* 3. Plus Creation Button (in screenshot, an orange circle enclosing white +) */}
          <button 
            id="tab-create"
            onClick={() => setActiveTab('create')}
            className="flex-1 flex justify-center items-center py-2 relative"
          >
            <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-90 shadow-md ${
              activeTab === 'create' 
                ? 'bg-[#ff9f1c] text-white scale-105 rotate-45' 
                : 'bg-[#ff9f1c]/90 text-white hover:bg-[#ff9f1c]'
            }`}>
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </span>
          </button>

          {/* 4. Profile / Avatar Button (Dynamic portrait) */}
          <button 
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 py-3 border-b-2 transition-all ${
              activeTab === 'profile' 
                ? 'border-[#00bfb2]' 
                : 'border-transparent'
            }`}
          >
            <img 
              src={currentUser.avatar} 
              alt="Tu perfil" 
              className={`h-6.5 w-6.5 rounded-full object-cover border-2 transition-all ${
                activeTab === 'profile' 
                  ? 'border-[#00bfb2] scale-105' 
                  : 'border-transparent hover:border-zinc-700'
              }`}
              referrerPolicy="no-referrer"
            />
          </button>
        </nav>

        {/* ACTIVE MODULE CONTAINER VIEW */}
        <main id="cero-content-stage" className="flex-1 px-4 py-3 bg-[#08090b]">
          {activeTab === 'home' && (
            <FeedSection 
              posts={visiblePosts}
              stories={visibleStories}
              currentUser={currentUser}
              profiles={profiles}
              onPlayStory={(idx) => setStoryPlayingIndex(idx)}
              onAddStory={handleAddStory}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onToggleSave={handleToggleSave}
              onSharePost={handleShareDetails}
              isAdminMode={isAdminMode}
              onDeletePost={handleDeletePost}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab 
              posts={visiblePosts}
              onSelectPost={handleSelectPostFromGrid}
            />
          )}

          {activeTab === 'create' && (
            <CreatePostTab 
              currentUser={currentUser}
              onAddPost={handleAddPost}
              onNavigateToHome={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab 
              currentUser={currentUser}
              posts={visiblePosts}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onToggleSave={handleToggleSave}
              onSelectPost={handleSelectPostFromGrid}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'admin' && isAdminMode && (
            <AdminTab 
              profiles={profiles}
              currentProfileId={currentProfileId}
              onSelectProfile={setCurrentProfileId}
              onUpdateProfile={handleUpdateProfile}
              onAddPost={handleAddPost}
              onResetFactory={handleResetFactory}
            />
          )}
        </main>

        {/* 1. STORIES PLAYER MODAL OVERLAY */}
        {storyPlayingIndex !== null && (
          <StoryViewer 
            stories={visibleStories}
            initialActiveIndex={storyPlayingIndex}
            onClose={() => setStoryPlayingIndex(null)}
            onSendMessage={handleSendMessage}
            isAdminMode={isAdminMode}
            onDeleteStory={handleDeleteStory}
            currentProfileId={currentProfileId}
          />
        )}

        {/* 2. NOTIFICATIONS COMPONENT DRAWER */}
        {showNotifModal && (
          <NotificationsModal 
            notifications={notifications}
            onClose={() => setShowNotifModal(false)}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
          />
        )}

        {/* 3. DIRECT MESSAGES POPUP DIALOGUE */}
        {showChatModal && (
          <ChatModal 
            chats={chats}
            onClose={() => setShowChatModal(false)}
            onSendMessage={handleSendMessage}
            onMarkChatAsRead={handleMarkChatAsRead}
            onReceiveAutoReply={handleReceiveAutoReply}
            isVisitor={isVisitorProfile(currentUser)}
          />
        )}

        {/* FOOTER METRIC NOTE (Discreet, simple visual alignment note) */}
        <footer className="py-6 text-center border-t border-zinc-950/20 bg-zinc-950/5">
          <p className="font-sans text-[10px] text-zinc-600">
            Cerotalk Beta v1.0.1 • Diseñado con alta fidelidad
          </p>
        </footer>

      </div>
    </div>
  );
}

// Robust error boundary class component to prevent browser blank/black screens in sandboxed runtimes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null };
  props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    try {
      safeStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white font-sans selection:bg-[#00bfb2]/30 selection:text-[#00bfb2]">
          <div className="w-full max-w-sm bg-[#08090b] border border-zinc-904 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
            <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#ff9f1c]/10 blur-2xl pointer-events-none" />
            <span className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#00bfb2]/10 blur-2xl pointer-events-none" />
            
            <div className="flex justify-center text-4xl">⚠️</div>
            <div className="space-y-1.5">
              <h1 className="text-base font-bold text-white">¡Ups! Algo salió mal</h1>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Detectamos un error inesperado al iniciar Cerotalk. Esto ocurre ocasionalmente bajo restricciones estrictas de cookies/sandbox en navegadores integrados.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-left font-mono text-[9px] text-[#ff9f1c]/80 overflow-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 font-sans text-xs font-bold rounded-xl text-black bg-[#00bfb2] hover:bg-teal-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Restaurar Datos de Fábrica y Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppBody />
    </ErrorBoundary>
  );
}
