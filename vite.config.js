import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Load .env file into process.env for Vite's SSR (API) module loader
function loadEnvForServer() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      }
      console.log(`[Vite API] Loaded env from: ${file}`);
      break;
    }
  }
}

// Call at startup
loadEnvForServer();

// Lightweight Vercel API middleware plugin for local Vite development
function vercelApiPlugin() {
  return {
    name: 'vercel-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const urlPath = req.url.split('?')[0];
            const relativePath = `.${urlPath}.js`;
            const absolutePath = path.resolve(process.cwd(), relativePath);

            if (fs.existsSync(absolutePath)) {
              const module = await server.ssrLoadModule(relativePath);
              const handler = module.default;

              if (typeof handler === 'function') {
                // Parse request body if POST/PUT/PATCH
                if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                  if (!req.body || typeof req.body !== 'object') {
                    const buffers = [];
                    for await (const chunk of req) {
                      buffers.push(chunk);
                    }
                    const bodyString = Buffer.concat(buffers).toString();
                    try {
                      req.body = bodyString ? JSON.parse(bodyString) : {};
                    } catch (e) {
                      req.body = {};
                    }
                  }
                }

                // Polyfill express-like res functions for Vercel serverless functions
                if (!res.status) {
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                }
                if (!res.json) {
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  };
                }

                await handler(req, res);
                return;
              }
            }
          } catch (err) {
            console.error('[Vite API] Handler Error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiPlugin()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('swiper')) return 'vendor-swiper';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor'; // all other node_modules
          }
        },
      },
    },
  },
})