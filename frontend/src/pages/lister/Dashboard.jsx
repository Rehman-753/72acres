import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    get('/api/lister/dashboard/').then(setStats).catch(() => setStats({ total_properties: 0 }))
  }, [])

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <span>Total Properties</span>
          <b>{stats ? stats.total_properties : '–'}</b>
        </div>
      </div>
      <div style={{ marginTop: 30, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/lister/properties/add" className="btn-primary">Add Property</Link>
        <Link to="/lister/properties" className="btn-ghost">My Properties</Link>
      </div>
    </>
  )
}
