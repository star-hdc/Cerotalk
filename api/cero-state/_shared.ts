import fs from 'node:fs';
import path from 'node:path';

const TABLE_NAME = 'cerotalk_state';
const STATE_ID = 'main';
const DEFAULT_STATE_PATH = path.join(process.cwd(), 'data', 'cerotalk-state.json');

type SharedCeroState = {
  profiles: unknown[];
  posts: unknown[];
  stories: unknown[];
  chats: unknown[];
  notifications: unknown[];
  updatedAt?: string;
};

function readDefaultStateFile(): SharedCeroState {
  try {
    const parsed = JSON.parse(fs.readFileSync(DEFAULT_STATE_PATH, 'utf8')) as Partial<SharedCeroState>;

    return {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return {
      profiles: [],
      posts: [],
      stories: [],
      chats: [],
      notifications: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export function defaultState(): SharedCeroState {
  return {
    ...readDefaultStateFile(),
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
  const defaults = defaultState();

  return {
    profiles: Array.isArray(state.profiles) ? state.profiles : defaults.profiles,
    posts: Array.isArray(state.posts) ? state.posts : defaults.posts,
    stories: Array.isArray(state.stories) ? state.stories : defaults.stories,
    chats: Array.isArray(state.chats) ? state.chats : defaults.chats,
    notifications: Array.isArray(state.notifications) ? state.notifications : defaults.notifications,
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
