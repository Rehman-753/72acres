// Thin fetch wrapper. Auth is Django's session cookie; state-changing requests
// carry Django's CSRF token. Permissions are enforced by Django, not here.

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

let csrfReady = null
function ensureCsrf() {
  if (getCookie('csrftoken')) return Promise.resolve()
  if (!csrfReady) csrfReady = fetch('/api/lister/csrf/', { credentials: 'include' })
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
    headers['X-CSRFToken'] = getCookie('csrftoken') || ''
  }
  const res = await fetch(path, { method, body, headers, credentials: 'include' })
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
