import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get, post } from '../../api.js'
import { formatPrice } from '../../format.js'

export default function MyProperties() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    get('/api/lister/properties/').then((d) => setItems(d.results)).catch((e) => setError(e.message))
  }, [])

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    try {
      await post(`/api/lister/properties/${p.id}/delete/`) // POST, never GET
      setItems((list) => list.filter((x) => x.id !== p.id))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="toolbar">
        <h2>All Properties</h2>
        <Link to="/lister/properties/add" className="btn-primary btn-sm">+ Add Property</Link>
      </div>
      {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
      {items === null ? (
        <div className="loading">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty">You haven’t added any properties yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th></th><th>Title</th><th>Type</th><th>Listing</th><th>City</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.images[0] && <img className="thumb" src={p.images[0]} alt="" />}</td>
                  <td>{p.title}</td>
                  <td>{p.property_type_label}</td>
                  <td>{p.listing_type_label}</td>
                  <td>{p.city}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn-ghost btn-sm" to={`/lister/properties/${p.id}`}>View</Link>
                      <Link className="btn-ghost btn-sm" to={`/lister/properties/${p.id}/edit`}>Edit</Link>
                      <button className="btn-danger" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
