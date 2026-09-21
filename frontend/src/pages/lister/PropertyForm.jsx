import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, post, toFormData } from '../../api.js'

// Field components live at module level (stable identity) so inputs keep focus while typing.
const FormCtx = createContext(null)

function Input({ k, label, type = 'text', span, ...rest }) {
  const { v, set, err } = useContext(FormCtx)
  return (
    <div className={`field${span ? ' span-all' : ''}`}>
      <label>{label}</label>
      <input type={type} value={v[k]} onChange={set(k)} {...rest} />
      {err(k)}
    </div>
  )
}

function Select({ k, label, blank }) {
  const { v, set, err, options } = useContext(FormCtx)
  return (
    <div className="field">
      <label>{label}</label>
      <select value={v[k]} onChange={set(k)}>
        <option value="">{blank || 'Select'}</option>
        {options[k].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {err(k)}
    </div>
  )
}

const EMPTY = {
  title: '', property_type: '', listing_type: '', description: '',
  state: '', city: '', locality: '', address: '', landmark: '', pincode: '',
  carpet_area: '', built_up_area: '', area_unit: 'sqft',
  bhk: '', bathrooms: '', balconies: '', floor: '', total_floors: '',
  furnishing: '', parking: '', price: '', construction_status: '',
  possession_date: '', rera_registered: false, rera_number: '', amenities: [],
}
const IMAGES = ['image_1', 'image_2', 'image_3']

export default function PropertyForm() {
  const { id } = useParams() // present => edit
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [options, setOptions] = useState(null)
  const [v, setV] = useState(EMPTY)
  const [files, setFiles] = useState({})
  const [existing, setExisting] = useState([])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    get('/api/options/').then(setOptions)
  }, [])

  useEffect(() => {
    if (!editing) return
    get(`/api/lister/properties/${id}/`)
      .then((p) => {
        const next = { ...EMPTY }
        Object.keys(EMPTY).forEach((k) => {
          if (p[k] !== null && p[k] !== undefined) next[k] = p[k]
        })
        setV(next)
        setExisting(p.images)
      })
      .catch(() => setMissing(true))
  }, [editing, id])

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const toggleAmenity = (val) =>
    setV({ ...v, amenities: v.amenities.includes(val) ? v.amenities.filter((a) => a !== val) : [...v.amenities, val] })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    setFormError('')
    try {
      const fd = toFormData({ ...v, ...files })
      const saved = await post(editing ? `/api/lister/properties/${id}/edit/` : '/api/lister/properties/add/', fd)
      navigate(`/lister/properties/${saved.id}`)
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors)
        setFormError('Please fix the highlighted fields.')
      } else setFormError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setBusy(false)
    }
  }

  if (missing) return <div className="empty">Property not found.</div>
  if (!options) return <div className="loading">Loading…</div>

  const err = (k) => errors[k] && <div className="err">{errors[k].map((x) => x.message).join(' ')}</div>

  return (
    <FormCtx.Provider value={{ v, set, err, options }}>
    <form className="pform" onSubmit={submit} encType="multipart/form-data">
      <h2>{editing ? 'Edit Property' : 'Add Property'}</h2>
      {formError && <div className="form-error" style={{ marginTop: 16 }}>{formError}</div>}

      <h3 className="form-section">Basics</h3>
      <div className="form-grid">
        <Input k="title" label="Title" span required />
        <Select k="property_type" label="Property Type" />
        <Select k="listing_type" label="Listing Type" />
        <Input k="price" label="Price (₹)" type="number" min="1" step="any" required />
        <div className="field span-all">
          <label>Description</label>
          <textarea value={v.description} onChange={set('description')} required />
          {err('description')}
        </div>
      </div>

      <h3 className="form-section">Location</h3>
      <div className="form-grid">
        <Input k="state" label="State" required />
        <Input k="city" label="City" required />
        <Input k="locality" label="Locality" required />
        <Input k="address" label="Address" span required />
        <Input k="landmark" label="Landmark" />
        <Input k="pincode" label="Pincode" maxLength={6} required />
      </div>

      <h3 className="form-section">Area & Configuration</h3>
      <div className="form-grid">
        <Input k="carpet_area" label="Carpet Area" type="number" min="0" step="any" required />
        <Input k="built_up_area" label="Built-up Area" type="number" min="0" step="any" />
        <Select k="area_unit" label="Area Unit" blank="Select" />
        <Select k="bhk" label="BHK" blank="Not applicable" />
        <Select k="bathrooms" label="Bathrooms" blank="Not applicable" />
        <Select k="balconies" label="Balconies" blank="Not applicable" />
        <Select k="floor" label="Floor" blank="Not applicable" />
        <Select k="total_floors" label="Total Floors" blank="Not applicable" />
        <Select k="furnishing" label="Furnishing" blank="Not applicable" />
        <Select k="parking" label="Parking" blank="Not applicable" />
      </div>

      <h3 className="form-section">Status & RERA</h3>
      <div className="form-grid">
        <Select k="construction_status" label="Construction Status" />
        <Input k="possession_date" label="Possession Date" type="date" />
        <div />
        <div className="field">
          <label className="check-line">
            <input type="checkbox" checked={v.rera_registered} onChange={(e) => setV({ ...v, rera_registered: e.target.checked })} style={{ width: 'auto' }} />
            RERA registered
          </label>
        </div>
        <Input k="rera_number" label="RERA Number (optional)" />
      </div>

      <h3 className="form-section">Amenities</h3>
      <div className="amenity-pick">
        {options.amenities.map((a) => (
          <label key={a.value} className={v.amenities.includes(a.value) ? 'on' : ''}>
            <input type="checkbox" checked={v.amenities.includes(a.value)} onChange={() => toggleAmenity(a.value)} style={{ width: 'auto' }} />
            {a.label}
          </label>
        ))}
      </div>
      {err('amenities')}

      <h3 className="form-section">Images</h3>
      <div className="form-grid">
        {IMAGES.map((k, i) => (
          <div className="field" key={k}>
            <label>Image {i + 1}{i === 0 ? ' (required)' : ''}</label>
            <input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, [k]: e.target.files[0] })} />
            {files[k] ? (
              <img className="img-preview" src={URL.createObjectURL(files[k])} alt="" />
            ) : (
              existing[i] && <img className="img-preview" src={existing[i]} alt="" />
            )}
            {err(k)}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Property'}</button>
      </div>
    </form>
    </FormCtx.Provider>
  )
}

