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
    <main className='w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-8'>
      {/* Page Title & Intro */}
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-plum/10 pb-6'>
        <div>
          <span className='text-xs font-bold uppercase tracking-widest text-rose'>
            FaceWise Beauty Suite
          </span>
          <h1 className='mt-1 font-display text-4xl md:text-5xl font-bold text-plum'>{title}</h1>
          <p className='mt-2 max-w-3xl text-sm md:text-base text-plum/70 leading-relaxed'>{intro}</p>
        </div>

        <div className='flex items-center gap-3'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200'>
            <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse'></span>
            MediaPipe Vision Ready
          </span>
        </div>
      </div>

      {/* Embedded Full-Width Live Camera AI Scanner Module */}
      {scanner && <div className='mt-8 w-full'>{scanner}</div>}

      {/* Curated Products Section */}
      <div className='mt-14 pt-8 border-t border-plum/10'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='font-display text-2xl md:text-3xl font-bold text-plum'>
              Curated {title} Catalog
            </h2>
            <p className='text-xs md:text-sm text-plum/60 mt-1'>
              Recommended based on scanned facial proportions, skin tone index, and personal preferences
            </p>
          </div>

          <form onSubmit={handleSearch} className='flex w-full md:w-96 gap-2'>
            <label htmlFor='search' className='sr-only'>Search products</label>
            <input
              id='search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'Search in ' + title + '...'}
              className='min-h-11 flex-1 rounded-full border-2 border-plum/20 bg-white px-5 text-sm focus:border-rose focus:outline-none transition shadow-xs'
            />
            <button
              type='submit'
              className='min-h-11 rounded-full bg-rose px-6 text-sm font-semibold text-white shadow-xs transition hover:opacity-90'
            >
              Search
            </button>
          </form>
        </div>

        {error && <p role='alert' className='mt-6 font-semibold text-rose'>{error}</p>}
        {loading && <p className='mt-6 text-plum/70'>Loading products from MongoDB Atlas...</p>}
        {!loading && !error && products.length === 0 && (
          <p className='mt-6 text-plum/70'>No products found.</p>
        )}

        {/* Full-Screen Responsive Product Grid */}
        <div className='mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  )
}
