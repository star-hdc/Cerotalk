import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_PROFILES,
  INITIAL_STORIES,
} from './src/data/mockData';

const stateDir = path.resolve(__dirname, 'data');
const statePath = path.join(stateDir, 'cerotalk-state.json');
const normalizedStatePath = statePath.split(path.sep).join('/');
const supabaseTableName = 'cerotalk_state';
const supabaseStateId = 'main';

type RuntimeEnv = Record<string, string | undefined>;

function defaultState() {
  return {
    profiles: INITIAL_PROFILES,
    posts: INITIAL_POSTS,
    stories: INITIAL_STORIES,
    chats: INITIAL_CHATS,
    notifications: INITIAL_NOTIFICATIONS,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSharedState(payload: Record<string, unknown>, current = defaultState()) {
  return {
    profiles: Array.isArray(payload.profiles) ? payload.profiles : current.profiles,
    posts: Array.isArray(payload.posts) ? payload.posts : current.posts,
    stories: Array.isArray(payload.stories) ? payload.stories : current.stories,
    chats: Array.isArray(payload.chats) ? payload.chats : current.chats,
    notifications: Array.isArray(payload.notifications) ? payload.notifications : current.notifications,
    updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
  };
}

function readSharedState() {
  fs.mkdirSync(stateDir, { recursive: true });

  if (!fs.existsSync(statePath)) {
    const initial = defaultState();
    fs.writeFileSync(statePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    const initial = defaultState();
    fs.writeFileSync(statePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function writeSharedState(payload: Record<string, unknown>) {
  const current = readSharedState();
  const next = normalizeSharedState(
    { ...payload, updatedAt: new Date().toISOString() },
    current
  );

  fs.writeFileSync(statePath, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function getSupabaseConfig(env: RuntimeEnv) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
  };
}

async function supabaseFetch(pathname: string, env: RuntimeEnv, init: RequestInit = {}) {
  const config = getSupabaseConfig(env);

  if (!config) {
    throw new Error('Supabase local sync needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return fetch(`${config.url}${pathname}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function readSupabaseState(env: RuntimeEnv) {
  const response = await supabaseFetch(
    `/rest/v1/${supabaseTableName}?id=eq.${supabaseStateId}&select=state,updated_at`,
    env
  );

  if (!response.ok) {
    throw new Error(`Supabase read failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : undefined;

  if (!row?.state) {
    return writeSupabaseState(defaultState(), env);
  }

  return normalizeSharedState({
    ...row.state,
    updatedAt: row.updated_at,
  });
}

async function writeSupabaseState(payload: Record<string, unknown>, env: RuntimeEnv) {
  const next = normalizeSharedState({
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  const response = await supabaseFetch(
    `/rest/v1/${supabaseTableName}?on_conflict=id`,
    env,
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: supabaseStateId,
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

  return normalizeSharedState({
    ...(row?.state || next),
    updatedAt: row?.updated_at || next.updatedAt,
  });
}

function readRequestBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res: import('node:http').ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function sharedStateApi(env: RuntimeEnv): Plugin {
  return {
    name: 'cerotalk-shared-state-api',
    configureServer(server) {
      server.watcher.unwatch(statePath);

      server.middlewares.use('/api/cero-state', async (req, res) => {
        try {
          const useSupabase = Boolean(getSupabaseConfig(env));

          if (req.method === 'GET') {
            sendJson(res, 200, useSupabase ? await readSupabaseState(env) : readSharedState());
            return;
          }

          if (req.method === 'PUT') {
            const body = await readRequestBody(req);
            const payload = body ? JSON.parse(body) : {};
            sendJson(res, 200, useSupabase ? await writeSupabaseState(payload, env) : writeSharedState(payload));
            return;
          }

          if (req.method === 'POST' && req.url === '/reset') {
            const initial = defaultState();
            if (useSupabase) {
              sendJson(res, 200, await writeSupabaseState(initial, env));
            } else {
              fs.mkdirSync(stateDir, { recursive: true });
              fs.writeFileSync(statePath, JSON.stringify(initial, null, 2), 'utf8');
              sendJson(res, 200, initial);
            }
            return;
          }

          sendJson(res, 405, { error: 'Method not allowed' });
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Unexpected server error',
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), ''),
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://cerotalk.vercel.app',
          changeOrigin: true,
          secure: false,
        }
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: env.DISABLE_HMR === 'true'
        ? null
        : {
            ignored: [normalizedStatePath, '**/data/cerotalk-state.json'],
          },
    },
  };
});
