import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { get } from '../../api.js'
import PropertyInfo from '../../components/PropertyInfo.jsx'

export default function ListerPropertyView() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    get(`/api/lister/properties/${id}/`).then(setP).catch(() => setMissing(true))
  }, [id])

  if (missing) return <div className="empty">Property not found.</div>
  if (!p) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="toolbar" style={{ marginBottom: 24 }}>
        <Link to="/lister/properties" className="btn-ghost btn-sm">← My Properties</Link>
        <Link to={`/lister/properties/${p.id}/edit`} className="btn-primary btn-sm">Edit</Link>
      </div>
      <PropertyInfo p={p} />
    </>
  )
}
