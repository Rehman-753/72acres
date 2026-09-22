// Thin fetch wrapper. Auth is a bearer token (not a session cookie): the
// React site (Vercel) and Django (Render) are different sites, and browsers
// commonly block cross-site cookies by default (e.g. Safari), which silently
// breaks login for some visitors. A token the page holds itself and sends in
// a header works the same on every browser. See auth.jsx for storage.
//
// In dev, Vite proxies /api to Django (same origin, no CORS needed). In
// production API_BASE points requests at the real Render backend.

const API_BASE = import.meta.env.VITE_API_BASE || ''
const TOKEN_KEY = 'lister_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export const setToken = (token) => {
  try {
    token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private browsing etc: session just won't persist across reloads */
  }
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
  const token = getToken()
  if (token) headers['Authorization'] = `Token ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method, body, headers })
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
