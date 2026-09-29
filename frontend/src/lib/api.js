const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
// Only /api/v1/chat is key-protected on the backend (X-API-Key header).
const API_KEY = import.meta.env.VITE_API_KEY ?? ''

function headers(extra) {
  return {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    ...extra,
  }
}

async function errorFrom(res) {
  let detail = ''
  try {
    const body = await res.json()
    detail = typeof body?.detail === 'string' ? body.detail : ''
  } catch {
    /* non-JSON error body */
  }
  const err = new Error(detail || `${res.status} ${res.statusText}`)
  err.status = res.status
  return err
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: headers(options.headers) })
  if (!res.ok) throw await errorFrom(res)
  return res.status === 204 ? null : res.json()
}

// Reads an NDJSON stream (one JSON object per line) and calls onEvent for each.
async function stream(path, body, onEvent, signal) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw await errorFrom(res)
  if (!res.body) throw new Error('Streaming not supported by this browser')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  const flush = (line) => {
    const s = line.trim()
    if (!s) return
    try {
      onEvent(JSON.parse(s))
    } catch {
      /* ignore partial / malformed lines */
    }
  }
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    lines.forEach(flush)
  }
  flush(buf)
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  stream,
}

export const q = encodeURIComponent
