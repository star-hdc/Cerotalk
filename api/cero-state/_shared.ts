import {
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_PROFILES,
  INITIAL_STORIES,
} from '../../src/data/mockData';

const TABLE_NAME = 'cerotalk_state';
const STATE_ID = 'main';

type SharedCeroState = {
  profiles: unknown[];
  posts: unknown[];
  stories: unknown[];
  chats: unknown[];
  notifications: unknown[];
  updatedAt?: string;
};

export function defaultState(): SharedCeroState {
  return {
    profiles: INITIAL_PROFILES,
    posts: INITIAL_POSTS,
    stories: INITIAL_STORIES,
    chats: INITIAL_CHATS,
    notifications: INITIAL_NOTIFICATIONS,
    updatedAt: new Date().toISOString(),
  };
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
  };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();

  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function normalizeState(state: Partial<SharedCeroState>): SharedCeroState {
  return {
    profiles: Array.isArray(state.profiles) ? state.profiles : INITIAL_PROFILES,
    posts: Array.isArray(state.posts) ? state.posts : INITIAL_POSTS,
    stories: Array.isArray(state.stories) ? state.stories : INITIAL_STORIES,
    chats: Array.isArray(state.chats) ? state.chats : INITIAL_CHATS,
    notifications: Array.isArray(state.notifications) ? state.notifications : INITIAL_NOTIFICATIONS,
    updatedAt: state.updatedAt || new Date().toISOString(),
  };
}

export async function readState() {
  const response = await supabaseFetch(
    `/rest/v1/${TABLE_NAME}?id=eq.${STATE_ID}&select=state,updated_at`
  );

  if (!response.ok) {
    throw new Error(`Supabase read failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : undefined;

  if (!row?.state) {
    return saveState(defaultState());
  }

  return normalizeState({
    ...row.state,
    updatedAt: row.updated_at,
  });
}

export async function saveState(state: Partial<SharedCeroState>) {
  const next = normalizeState({
    ...state,
    updatedAt: new Date().toISOString(),
  });

  const response = await supabaseFetch(
    `/rest/v1/${TABLE_NAME}?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: STATE_ID,
        state: next,
        updated_at: next.updatedAt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase save failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : undefined;

  return normalizeState({
    ...(row?.state || next),
    updatedAt: row?.updated_at || next.updatedAt,
  });
}
