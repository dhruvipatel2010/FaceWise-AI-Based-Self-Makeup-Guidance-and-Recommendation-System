/**
 * AdminProducts — reusable product management page.
 * Used for makeup, skincare and hair categories.
 * Supports: list, add, edit (price/description), delete.
 * Props: category ('makeup' | 'skincare' | 'hair'), title (string)
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'

const inp =
  'mt-1 block min-h-11 w-full rounded-xl border-2 border-plum/20 bg-white px-4 text-sm focus:border-rose focus:outline-none'

function ProductForm({ initial, onSave, onCancel, category }) {
  const [name, setName]   = useState(initial?.name ?? '')
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [desc, setDesc]   = useState(initial?.description ?? '')
  const [imgUrl, setImg]  = useState(initial?.image_url ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr]     = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const payload = { name, brand, category, price: parseFloat(price) || 0, description: desc, image_url: imgUrl }
    try {
      if (initial?.id) {
        await api.put(`/products/${initial.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      onSave()
    } catch {
      setErr('Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className='mt-4 space-y-3 rounded-2xl border border-plum/10 bg-white p-6'>
      <div className='grid gap-3 sm:grid-cols-2'>
        <div>
          <label className='text-xs font-semibold text-plum'>Name *</label>
          <input required value={name} onChange={e => setName(e.target.value)} className={inp} />
        </div>
        <div>
          <label className='text-xs font-semibold text-plum'>Brand</label>
          <input value={brand} onChange={e => setBrand(e.target.value)} className={inp} />
        </div>
        <div>
          <label className='text-xs font-semibold text-plum'>Price (₹) *</label>
          <input required type='number' min='0' step='0.01' value={price} onChange={e => setPrice(e.target.value)} className={inp} />
        </div>
        <div>
          <label className='text-xs font-semibold text-plum'>Image URL</label>
          <input value={imgUrl} onChange={e => setImg(e.target.value)} className={inp} placeholder='https://...' />
        </div>
      </div>
      <div>
        <label className='text-xs font-semibold text-plum'>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
          className='mt-1 block w-full rounded-xl border-2 border-plum/20 bg-white px-4 py-2 text-sm focus:border-rose focus:outline-none' />
      </div>
      {err && <p className='text-sm text-rose'>{err}</p>}
      <div className='flex gap-3'>
        <button type='submit' disabled={saving}
          className='min-h-10 rounded-full bg-rose px-6 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60'>
          {saving ? 'Saving...' : (initial?.id ? 'Update' : 'Add product')}
        </button>
        <button type='button' onClick={onCancel}
          className='min-h-10 rounded-full border-2 border-plum px-6 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminProducts({ category, title }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [error, setError]       = useState('')

  function load() {
    setLoading(true)
    api.get('/products', { params: { category } })
      .then(r => setProducts(r.data))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [category])

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    load()
  }

  function saved() { setShowForm(false); setEditing(null); load() }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='font-display text-4xl font-bold text-plum'>{title}</h1>
        {!showForm && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className='min-h-10 rounded-full bg-rose px-6 text-sm font-semibold text-white hover:opacity-90'
          >
            + Add product
          </button>
        )}
      </div>

      {(showForm && !editing) && (
        <ProductForm category={category} onSave={saved} onCancel={() => setShowForm(false)} />
      )}

      {error && <p role='alert' className='mt-4 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/60'>Loading...</p>}

      {!loading && (
        <div className='mt-6 space-y-3'>
          {products.length === 0 && (
            <p className='text-plum/40'>No products yet. Add one above.</p>
          )}
          {products.map(p => (
            <div key={p.id}>
              {editing?.id === p.id ? (
                <ProductForm
                  category={category}
                  initial={p}
                  onSave={saved}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className='flex items-center gap-4 rounded-2xl border border-plum/10 bg-white p-4'>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className='h-14 w-14 rounded-xl object-cover' />
                  ) : (
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-lilac text-xs text-plum/40'>
                      No img
                    </div>
                  )}
                  <div className='flex-1'>
                    <p className='font-semibold text-plum'>{p.name}</p>
                    <p className='text-xs text-plum/60'>{p.brand} · ₹{p.price}</p>
                  </div>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => setEditing(p)}
                      className='text-xs font-semibold text-plum hover:text-rose'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className='text-xs font-semibold text-rose hover:underline'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

