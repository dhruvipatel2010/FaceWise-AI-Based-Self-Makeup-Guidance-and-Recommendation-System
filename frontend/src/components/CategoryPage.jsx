import { useEffect, useState } from 'react'
import api, { errorMessage } from '../services/api'
import ProductCard from './ProductCard'

export default function CategoryPage({ category, title, intro, scanner }) {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api
      .get('/products', { params: { category, q: search || undefined } })
      .then((res) => {
        if (active) setProducts(res.data)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [category, search])

  function handleSearch(e) {
    e.preventDefault()
    setSearch(query.trim())
  }

  return (
    <main className='mx-auto max-w-6xl px-6 py-10 md:px-12'>
      <h1 className='font-display text-4xl font-bold text-plum'>{title}</h1>
      <p className='mt-2 max-w-2xl text-plum/70'>{intro}</p>

      {/* Embedded Live Camera AI Scanner Module */}
      {scanner && <div className='mt-8'>{scanner}</div>}

      <div className='mt-12 border-t border-plum/10 pt-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='font-display text-2xl font-bold text-plum'>Curated {title} Products</h2>
            <p className='text-xs text-plum/60'>Formulated and matched for your skin tone, texture, and style</p>
          </div>

          <form onSubmit={handleSearch} className='flex w-full max-w-md gap-2'>
            <label htmlFor='search' className='sr-only'>Search products</label>
            <input
              id='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'Search in ' + title}
              className='min-h-11 flex-1 rounded-full border-2 border-plum/20 bg-white px-5 text-sm focus:border-rose focus:outline-none'
            />
            <button type='submit' className='min-h-11 rounded-full bg-rose px-6 text-sm font-semibold text-white hover:opacity-90'>
              Search
            </button>
          </form>
        </div>

        {error && <p role='alert' className='mt-6 font-semibold text-rose'>{error}</p>}
        {loading && <p className='mt-6 text-plum/70'>Loading products from catalog...</p>}
        {!loading && !error && products.length === 0 && (
          <p className='mt-6 text-plum/70'>No products found.</p>
        )}

        <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  )
}
