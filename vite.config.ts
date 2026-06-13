import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  INITIAL_PROFILES,
  INITIAL_STORIES,
} from './src/data/mockData';

const stateDir = path.resolve(__dirname, 'data');
const statePath = path.join(stateDir, 'cerotalk-state.json');

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
  const next = {
    profiles: Array.isArray(payload.profiles) ? payload.profiles : current.profiles,
    posts: Array.isArray(payload.posts) ? payload.posts : current.posts,
    stories: Array.isArray(payload.stories) ? payload.stories : current.stories,
    chats: Array.isArray(payload.chats) ? payload.chats : current.chats,
    notifications: Array.isArray(payload.notifications) ? payload.notifications : current.notifications,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(statePath, JSON.stringify(next, null, 2), 'utf8');
  return next;
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

function sharedStateApi(): Plugin {
  return {
    name: 'cerotalk-shared-state-api',
    configureServer(server) {
      server.middlewares.use('/api/cero-state', async (req, res) => {
        try {
          if (req.method === 'GET') {
            sendJson(res, 200, readSharedState());
            return;
          }

          if (req.method === 'PUT') {
            const body = await readRequestBody(req);
            const payload = body ? JSON.parse(body) : {};
            sendJson(res, 200, writeSharedState(payload));
            return;
          }

          if (req.method === 'POST' && req.url === '/reset') {
            const initial = defaultState();
            fs.mkdirSync(stateDir, { recursive: true });
            fs.writeFileSync(statePath, JSON.stringify(initial, null, 2), 'utf8');
            sendJson(res, 200, initial);
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

export default defineConfig(() => {
  return {
    plugins: [sharedStateApi(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
