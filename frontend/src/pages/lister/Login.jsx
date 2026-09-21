import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'

export default function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/lister/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      navigate('/lister/dashboard') // guard shows pending/rejected message if needed
    } catch (err) {
      const nf = err.fieldErrors?.__all__?.[0]?.message
      setError(nf || err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-box" onSubmit={submit}>
      <h1>Lister Login</h1>
      <p style={{ marginBottom: 24 }}>Property lister accounts are created by the admin.</p>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'Signing in…' : 'Login'}
      </button>
    </form>
  )
}
