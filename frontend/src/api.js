// Thin fetch wrapper. Auth is Django's session cookie; state-changing requests
// carry Django's CSRF token. Permissions are enforced by Django, not here.
//
// In dev, Vite proxies /api to Django (same origin). In production the React
// site (Vercel) and Django (Render) are different domains, so API_BASE points
// requests at the real backend, and the CSRF token is read from the JSON
// response below instead of the cookie (cross-domain JS can't read it).

const API_BASE = import.meta.env.VITE_API_BASE || ''

let csrfToken = null
let csrfReady = null
function ensureCsrf() {
  if (csrfToken) return Promise.resolve()
  if (!csrfReady) {
    csrfReady = fetch(`${API_BASE}/api/lister/csrf/`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        csrfToken = data.csrfToken
      })
  }
  return csrfReady
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`)
    this.status = status
    this.code = body?.error
    this.fieldErrors = body?.errors || null
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (method !== 'GET') {
    await ensureCsrf()
    headers['X-CSRFToken'] = csrfToken || ''
  }
  const res = await fetch(`${API_BASE}${path}`, { method, body, headers, credentials: 'include' })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const get = (path) => request(path)
export const post = (path, body) => request(path, { method: 'POST', body })

// Build a FormData from a plain object (arrays become repeated keys, File objects are kept).
export function toFormData(values) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) v.forEach((x) => fd.append(k, x))
    else if (typeof v === 'boolean') {
      if (v) fd.append(k, 'on')
    } else if (v !== null && v !== undefined) fd.append(k, v)
  }
  return fd
}

export function qs(params) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) p.set(k, v)
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}
