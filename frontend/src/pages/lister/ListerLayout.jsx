import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'

// Route guard + sidebar. This is UX only: Django re-checks login, approval
// and ownership on every request.
export default function ListerLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="loading">Loading…</div>
  if (!user) return <Navigate to="/lister/login" replace />

  const doLogout = async () => {
    await logout()
    navigate('/lister/login')
  }

  if (user.approval_status !== 'APPROVED') {
    const rejected = user.approval_status === 'REJECTED'
    return (
      <div className="wrap">
        <div className="notice">
          <h2>{rejected ? 'Account rejected' : 'Awaiting approval'}</h2>
          <p>
            {rejected
              ? 'Your property lister account was rejected by the admin. Please contact support.'
              : 'Your account has been created and is pending admin approval. You will be able to manage properties once it is approved.'}
          </p>
          <button className="btn-ghost" onClick={doLogout}>Logout</button>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap portal">
      <aside className="side">
        <div className="who">
          <b>{user.first_name || user.username}</b>
          <span>Property Lister</span>
        </div>
        <NavLink to="/lister/dashboard">Dashboard</NavLink>
        <NavLink to="/lister/properties" end>My Properties · All Properties</NavLink>
        <NavLink to="/lister/properties/add">Add Property</NavLink>
        <NavLink to="/lister/profile">My Profile</NavLink>
        <button onClick={doLogout}>Logout</button>
      </aside>
      <div><Outlet /></div>
    </div>
  )
}
