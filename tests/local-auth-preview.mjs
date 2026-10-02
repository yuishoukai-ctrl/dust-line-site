// Local-only auth fixture. Production Vite config does not import this file.
// node tests/local-auth-preview.mjs [--port=4175]
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, extname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const portArgument = process.argv.slice(2).find((argument) => argument.startsWith('--port='))
const port = Number(portArgument?.slice('--port='.length) || 4175)
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Use a local preview port between 1024 and 65535.')
}
const clientFile = resolve(root, 'src/lib/supabaseClient.js')
const mockFile = resolve(root, 'tests/fixtures/auth-recovery-supabase.js')

const bootstrap = `
(() => {
  const params = new URL(window.location.href).searchParams;
  const settingsKey = 'dustline-local-auth-qa-settings';
  const sessionKey = 'dustline-local-auth-qa-session';
  let previous = {};
  try {
    if (params.get('qaReset') === '1') {
      window.localStorage.removeItem(settingsKey);
      window.localStorage.removeItem(sessionKey);
    } else {
      previous = JSON.parse(window.localStorage.getItem(settingsKey) || '{}');
    }
  } catch {}
  const choice = (key, values, fallback) => {
    const candidate = params.get(key) || previous[key];
    return values.includes(candidate) ? candidate : fallback;
  };
  const settings = {
    qaSignup: choice('qaSignup', ['success', 'session', 'error', 'throw'], 'success'),
    qaVerify: choice('qaVerify', ['success', 'error', 'throw'], 'success'),
    qaAnalytics: choice('qaAnalytics', ['ok', 'throw', 'throw-event'], 'ok'),
    qaStorage: choice('qaStorage', ['available', 'unavailable'], 'available'),
    qaConsent: choice('qaConsent', ['granted', 'denied', 'unset'], params.get('qaAnalytics')?.startsWith('throw') ? 'granted' : 'denied'),
  };
  if (params.get('qaAnalytics')?.startsWith('throw') && !params.has('qaConsent')) settings.qaConsent = 'granted';
  window.__DUSTLINE_AUTH_QA__ = settings;
  window.__DUSTLINE_AUTH_QA_EVENTS__ = [];
  try {
    window.localStorage.setItem(settingsKey, JSON.stringify(settings));
    if (settings.qaConsent === 'unset') window.localStorage.removeItem('dustline_analytics_consent');
    else window.localStorage.setItem('dustline_analytics_consent', settings.qaConsent);
  } catch {}
  window.gtag = (...args) => {
    window.__DUSTLINE_AUTH_QA_EVENTS__.push({ type: 'analytics', command: args[0], event: args[1] instanceof Date ? 'date' : args[1] });
    if (settings.qaAnalytics === 'throw' || (settings.qaAnalytics === 'throw-event' && args[0] === 'event')) throw new Error('LOCAL QA simulated analytics exception');
  };
  const appendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = (node) => {
    if (node.tagName === 'SCRIPT' && /^https:\\/\\/www\\.googletagmanager\\.com\\/gtag\\/js(?:[?]|$)/.test(node.src || '')) {
      window.__DUSTLINE_AUTH_QA_EVENTS__.push({ type: 'analytics-script-blocked' });
      return node;
    }
    return appendChild(node);
  };
  if (settings.qaStorage === 'unavailable') {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() { throw new DOMException('LOCAL QA simulated unavailable session storage', 'SecurityError'); },
    });
  }
})();
`

const server = await createServer({
  configFile: false,
  root,
  envDir: false,
  cacheDir: resolve(root, 'qa/.vite-local-preview'),
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    headers: {
      'Content-Security-Policy': `default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:${port}; object-src 'none'`,
    },
  },
  define: {
    'import.meta.env.VITE_GA4_MEASUREMENT_ID': JSON.stringify('G-QATEST'),
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
  plugins: [
    {
      name: 'local-auth-recovery-qa',
      enforce: 'pre',
      resolveId(source, importer) {
        const cleanSource = source.split('?')[0]
        const candidate = cleanSource.startsWith('/src/')
          ? resolve(root, cleanSource.slice(1))
          : isAbsolute(cleanSource)
            ? resolve(cleanSource)
            : importer && resolve(dirname(importer.split('?')[0]), cleanSource)
        if (!candidate) return undefined
        return (extname(candidate) ? candidate : `${candidate}.js`) === clientFile ? mockFile : undefined
      },
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            { tag: 'script', children: bootstrap, injectTo: 'head-prepend' },
            {
              tag: 'div',
              attrs: {
                style: 'position:fixed;z-index:99999;bottom:0;left:0;background:#fff3c4;color:#191919;padding:4px 12px;font:12px sans-serif',
                'data-local-auth-qa': 'true',
              },
              children: 'LOCAL AUTH QA / synthetic account / no external auth or analytics',
              injectTo: 'body',
            },
          ],
        }
      },
    },
    react(),
  ],
})

await server.listen()
console.log(`Local auth recovery QA: http://127.0.0.1:${port}/account/signup/?qaReset=1`)
console.log('Modes: qaSignup=success|session|error|throw; qaVerify=success|error|throw; qaAnalytics=ok|throw|throw-event; qaStorage=available|unavailable; qaConsent=granted|denied|unset.')
console.log('Settings persist across local navigation. Add qaReset=1 to clear the fixture session and settings. Stop with Ctrl+C.')

const stop = async () => {
  await server.close()
  process.exit(0)
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)
