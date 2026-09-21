import { useEffect, useState } from 'react'
import { get, post, toFormData } from '../../api.js'
import { useAuth } from '../../auth.jsx'

export default function Profile() {
  const { refresh } = useAuth()
  const [v, setV] = useState(null)
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    get('/api/lister/profile/').then(setV)
  }, [])

  if (!v) return <div className="loading">Loading…</div>

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const err = (k) => errors[k] && <div className="err">{errors[k].map((x) => x.message).join(' ')}</div>

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setMsg('')
    try {
      setV(await post('/api/lister/profile/', toFormData({ first_name: v.first_name, last_name: v.last_name, email: v.email })))
      setMsg('Profile updated.')
      refresh()
    } catch (e2) {
      if (e2.fieldErrors) setErrors(e2.fieldErrors)
      else setMsg(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 520 }}>
      <h2 style={{ marginBottom: 24 }}>My Profile</h2>
      {msg && <div className="form-error" style={{ color: 'var(--ok)', borderColor: 'var(--ok)', background: '#f2fbf6' }}>{msg}</div>}
      <div className="field"><label>Username</label><input value={v.username} disabled /></div>
      <div className="field"><label>Account Status</label><input value={v.approval_status} disabled /></div>
      <div className="field"><label>First Name</label><input value={v.first_name} onChange={set('first_name')} />{err('first_name')}</div>
      <div className="field"><label>Last Name</label><input value={v.last_name} onChange={set('last_name')} />{err('last_name')}</div>
      <div className="field"><label>Email</label><input type="email" value={v.email} onChange={set('email')} />{err('email')}</div>
      <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Profile'}</button>
    </form>
  )
}
