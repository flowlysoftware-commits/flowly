'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const NOW = Math.floor(Date.now() / 1000);
const token = exp => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const validToken = token(NOW + 900);
const userId = '11111111-1111-4111-8111-111111111111';

function compile(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `${file}: ${errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('\n')}`);
  return result.outputText;
}

function harness(overrides = {}) {
  const state = { role: 'admin', authError: false, profileError: false, anonymous: false, token: validToken, ...overrides };
  const calls = [];
  const responseCookies = new WeakMap();
  const json = (body, init = {}) => {
    const response = new Response(JSON.stringify(body), { ...init, headers: { 'content-type': 'application/json', ...init.headers } });
    const cookies = new Map(); responseCookies.set(response, cookies);
    response.cookies = { set(name, value, options) { cookies.set(name, { value, ...options }); } };
    return response;
  };
  const admin = {
    auth: { getUser: async value => {
      calls.push(['getUser', value]);
      return { error: state.authError || value !== state.token ? new Error('invalid') : null,
        data: { user: { id: userId, email: 'admin@example.test', is_anonymous: state.anonymous, user_metadata: { account_type: 'admin' } } } };
    } },
    from(table) {
      calls.push(['from', table]); assert.equal(table, 'user_profiles');
      return { select(fields) {
        assert.equal(fields, 'account_type');
        return { eq(column, value) {
          assert.equal(column, 'user_id'); assert.equal(value, userId);
          return { maybeSingle: async () => ({ error: state.profileError ? new Error('database') : null, data: { account_type: state.role } }) };
        } };
      } };
    },
    rpc() { throw new Error('Old shared-password RPC must not be used'); },
  };
  const env = { NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-only', ...state.env };
  let auth;
  function load(file) {
    const module = { exports: {} };
    const req = name => {
      if (name === 'next/server') return { NextResponse: { json } };
      if (name === '@/lib/supabaseAdmin') return { supabaseAdmin: admin };
      if (name === '@/lib/accountingAuth') return auth;
      if (name === '@supabase/supabase-js') return { createClient: (_url, _key, options) => ({ options }) };
      throw new Error(`Unexpected import: ${name}`);
    };
    vm.runInNewContext(compile(file), { require: req, module, exports: module.exports, Buffer, URL, Headers, Response, Date, process: { env } }, { filename: file });
    return module.exports;
  }
  auth = load('lib/accountingAuth.ts');
  const routes = load('app/api/contabilidad/sesion/route.ts');
  function request(method = 'GET', { bearer, cookie, legacy, origin = 'https://www.flowlyia.com', custom = true, site = 'same-origin' } = {}) {
    const headers = new Headers({ origin, 'sec-fetch-site': site });
    if (custom) headers.set('x-accounting-request', '1');
    if (bearer !== undefined) headers.set('authorization', bearer);
    return { method, headers, nextUrl: new URL('https://www.flowlyia.com/api/contabilidad/sesion'),
      cookies: { get(name) { const value = name === auth.accountingCookie ? cookie : name === auth.legacyAccountingCookie ? legacy : undefined; return value ? { value } : undefined; } } };
  }
  return { state, calls, auth, routes, request, cookies: r => responseCookies.get(r) };
}

test('anonymous visitors cannot read the accounting session', async () => {
  const h = harness(); assert.equal((await h.routes.GET(h.request())).status, 401); assert.equal(h.calls.length, 0);
});
test('a legacy shared-password cookie no longer grants access', async () => {
  const h = harness(); assert.equal((await h.routes.GET(h.request('GET', { legacy: 'a'.repeat(64) }))).status, 401);
});
test('a forged token is rejected by Auth before checking privileges', async () => {
  const h = harness({ authError: true });
  assert.equal((await h.routes.GET(h.request('GET', { bearer: `Bearer ${validToken}` }))).status, 401);
  assert.equal(h.calls.filter(c => c[0] === 'from').length, 0);
});
test('user_metadata cannot turn a non-admin into an accounting administrator', async () => {
  const h = harness({ role: 'sales' });
  assert.equal((await h.routes.GET(h.request('GET', { bearer: `Bearer ${validToken}` }))).status, 401);
});
test('anonymous Supabase identities remain denied', async () => {
  const h = harness({ anonymous: true });
  assert.equal((await h.routes.GET(h.request('GET', { bearer: `Bearer ${validToken}` }))).status, 401);
});
test('missing or failed profile lookup fails closed', async () => {
  const h = harness({ profileError: true });
  assert.equal((await h.routes.GET(h.request('GET', { bearer: `Bearer ${validToken}` }))).status, 401);
});
test('verified administrator can enter without the old login RPC or tables', async () => {
  const h = harness(); const response = await h.routes.GET(h.request('GET', { bearer: `Bearer ${validToken}` }));
  assert.equal(response.status, 200); const data = await response.json();
  assert.equal(data.user.id, userId); assert.equal(data.user.name, 'admin@example.test');
  assert.deepEqual(h.calls.filter(c => c[0] === 'from').map(c => c[1]), ['user_profiles']);
});
test('verified token is held only in a bounded Secure HttpOnly Strict cookie', async () => {
  const h = harness(); const response = await h.routes.POST(h.request('POST', { bearer: `Bearer ${validToken}` }));
  assert.equal(response.status, 200); const cookie = h.cookies(response).get(h.auth.accountingCookie);
  assert.equal(cookie.httpOnly, true); assert.equal(cookie.secure, true); assert.equal(cookie.sameSite, 'strict'); assert.equal(cookie.path, '/');
  assert.ok(cookie.maxAge > 0 && cookie.maxAge <= 900); assert.equal(cookie.value, validToken);
  assert.equal(JSON.stringify(await response.json()).includes(validToken), false);
});
test('a reload can revalidate the cookie without a client-memory login', async () => {
  const h = harness(); const response = await h.routes.GET(h.request('GET', { cookie: validToken }));
  assert.equal(response.status, 200); assert.equal(h.calls[0][0], 'getUser');
});
test('admin permission is rechecked after each reload', async () => {
  const h = harness(); assert.equal((await h.routes.GET(h.request('GET', { cookie: validToken }))).status, 200);
  h.state.role = 'client'; assert.equal((await h.routes.GET(h.request('GET', { cookie: validToken }))).status, 401);
});
test('invalid explicit authorization never falls back to an admin cookie', async () => {
  const h = harness(); assert.equal((await h.routes.GET(h.request('GET', { bearer: 'Basic rejected', cookie: validToken }))).status, 401);
});
test('expired verified tokens cannot be remembered or used', async () => {
  const expired = token(NOW - 5); const h = harness({ token: expired });
  assert.equal((await h.routes.GET(h.request('GET', { cookie: expired }))).status, 401);
  assert.equal(h.auth.verifiedAccountingTokenMaxAge(expired), 0);
});
test('a valid long-lived token still gets a maximum one-hour accounting cookie', () => {
  const h = harness(); assert.equal(h.auth.verifiedAccountingTokenMaxAge(token(NOW + 86400)), 3600);
});
test('password-only POST cannot issue a cookie', async () => {
  const h = harness(); const response = await h.routes.POST(h.request('POST'));
  assert.equal(response.status, 401); assert.equal(h.cookies(response).size, 0);
});
test('cross-origin or missing custom-header exchanges are blocked', async () => {
  for (const options of [{ origin: 'https://outside.example' }, { custom: false }, { site: 'cross-site' }]) {
    const h = harness(); assert.equal((await h.routes.POST(h.request('POST', { bearer: `Bearer ${validToken}`, ...options }))).status, 403);
    assert.equal(h.calls.length, 0);
  }
});
test('server configuration missing is reported without exposing credentials', async () => {
  const h = harness({ env: { SUPABASE_SERVICE_ROLE_KEY: '' } });
  assert.equal((await h.routes.GET(h.request())).status, 503);
});
test('closing accounting removes both cookies and does not modify any database rows', async () => {
  const h = harness(); const response = await h.routes.DELETE(h.request('DELETE', { cookie: validToken }));
  assert.equal(response.status, 200); assert.equal(h.cookies(response).get(h.auth.accountingCookie).maxAge, 0);
  assert.equal(h.cookies(response).get(h.auth.legacyAccountingCookie).maxAge, 0); assert.equal(h.calls.length, 0);
});
test('responses cannot be publicly cached and vary with authorization and cookie', async () => {
  const h = harness(); const response = await h.routes.GET(h.request('GET', { cookie: validToken }));
  assert.match(response.headers.get('cache-control'), /private, no-store/);
  assert.match(response.headers.get('vary'), /Authorization, Cookie/);
});
test('UI and login source transpile; common-password form is absent', () => {
  compile('app/contabilidad/AccountingAccess.tsx'); compile('app/login/page.tsx'); compile('lib/accountingFetch.ts');
  const ui = fs.readFileSync(path.join(root, 'app/contabilidad/AccountingAccess.tsx'), 'utf8');
  assert.doesNotMatch(ui, /accounting-password|validSharedPassword|type="password"/);
  assert.match(ui, /\/login\?next=\/contabilidad/);
  const login = fs.readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');
  assert.match(login, /get\("next"\) === "\/contabilidad"/);
  assert.doesNotMatch(login, /router\.push\((?:next|redirect|returnTo)\)/);
});
test('accounting transport keeps credentials on this origin and blocks redirects', async () => {
  const exports = {}; const calls = []; const events = [];
  const req = name => {
    assert.equal(name, '@/lib/supabaseClient');
    return { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: validToken } } }) } } };
  };
  vm.runInNewContext(compile('lib/accountingFetch.ts'), { exports, require: req, URL, Headers, Event,
    window: { location: { origin: 'https://www.flowlyia.com' }, dispatchEvent: e => events.push(e.type) },
    fetch: async (url, options) => { calls.push({ url, options }); return { status: 401 }; },
  });
  await assert.rejects(() => exports.accountingFetch('https://outside.example/api/contabilidad'));
  await assert.rejects(() => exports.accountingFetch('/api/unrelated'));
  assert.equal(calls.length, 0);
  await exports.accountingFetch('/api/contabilidad/movimientos?month=2026-09');
  assert.equal(calls[0].options.headers.get('authorization'), `Bearer ${validToken}`);
  assert.equal(calls[0].options.redirect, 'error'); assert.equal(calls[0].options.cache, 'no-store');
  assert.deepEqual(events, ['accounting-session-expired']);
});
