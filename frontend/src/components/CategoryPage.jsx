import { useEffect, useState, useMemo } from 'react'
import api, { errorMessage } from '../services/api'
import ProductCard from './ProductCard'

export default function CategoryPage({ category, title, intro, scanner, detectedInfo }) {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'top-rated', 'luxury'
  const [sortBy, setSortBy] = useState('recommended') // 'recommended', 'rating', 'price-low', 'price-high'

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

  // Dynamic client-side filtering & sorting
  const displayedProducts = useMemo(() => {
    let list = [...products]

    if (activeFilter === 'top-rated') {
      list = list.filter((p) => (p.rating || 0) >= 4.8)
    } else if (activeFilter === 'luxury') {
      list = list.filter((p) => (p.price || 0) >= 1500)
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return list
  }, [products, activeFilter, sortBy])

  return (
    <div className='relative w-full overflow-hidden bg-page min-h-screen'>
      {/* Decorative ambient glowing orbs */}
      <div className='pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-rose/10 blur-3xl'></div>
      <div className='pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-lilac/30 blur-3xl'></div>

      {/* Main Full-Width Studio Container (Edge-to-edge space utilization) */}
      <main className='relative z-10 w-full px-4 sm:px-6 md:px-10 py-6'>
        {/* Page Title & Intro */}
        <div className='flex flex-wrap items-end justify-between gap-4 border-b border-plum/10 pb-6'>
          <div>
            <span className='text-xs font-bold uppercase tracking-widest text-rose'>
              FaceWise Beauty Suite
            </span>
            <h1 className='mt-1 font-display text-4xl md:text-5xl font-bold text-plum'>{title}</h1>
            <p className='mt-2 max-w-4xl text-sm md:text-base text-plum/70 leading-relaxed'>{intro}</p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            {detectedInfo && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-plum px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs animate-in fade-in'>
                <span>✦</span>
                Live Profile: {detectedInfo.shape || ''} {detectedInfo.tone ? `· ${detectedInfo.tone} Tone` : ''}
              </span>
            )}
            <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-2xs'>
              <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse'></span>
              MediaPipe Vision Ready
            </span>
          </div>
        </div>

        {/* Embedded Full-Width Live Camera AI Scanner Module */}
        {scanner && <div className='mt-6 w-full'>{scanner}</div>}

        {/* Curated Products Section (Full Width Space Utilization) */}
        <div className='mt-12 pt-8 border-t border-plum/10'>
          {/* Header & Controls Bar */}
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='font-display text-2xl md:text-3xl font-bold text-plum'>
                  Curated {title} Catalog
                </h2>
                <span className='rounded-full bg-rose/10 px-3 py-0.5 text-xs font-bold text-rose'>
                  {displayedProducts.length} Items
                </span>
              </div>
              <p className='text-xs md:text-sm text-plum/60 mt-1'>
                Formulated with luxury active ingredients, rated for photorealistic results
              </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className='flex w-full md:w-80 gap-2'>
              <label htmlFor='search' className='sr-only'>Search products</label>
              <input
                id='search'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={'Search in ' + title + '...'}
                className='min-h-10 flex-1 rounded-full border-2 border-plum/20 bg-white px-4 text-xs text-plum focus:border-rose focus:outline-none transition shadow-2xs'
              />
              <button
                type='submit'
                className='min-h-10 rounded-full bg-rose px-5 text-xs font-bold text-white shadow-xs transition hover:opacity-90'
              >
                Search
              </button>
            </form>
          </div>

          {/* Dynamic Interactive Filter & Sort Bar */}
          <div className='mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-plum/10 shadow-2xs'>
            {/* Filter Pills */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-xs font-bold text-plum/60 mr-1'>Filter:</span>
              <button
                onClick={() => setActiveFilter('all')}
                className={
                  'rounded-full px-3.5 py-1 text-xs font-semibold transition ' +
                  (activeFilter === 'all'
                    ? 'bg-plum text-white shadow-2xs'
                    : 'bg-page text-plum/70 hover:bg-plum/10')
                }
              >
                ✦ All Products ({products.length})
              </button>
              <button
                onClick={() => setActiveFilter('top-rated')}
                className={
                  'rounded-full px-3.5 py-1 text-xs font-semibold transition ' +
                  (activeFilter === 'top-rated'
                    ? 'bg-rose text-white shadow-2xs'
                    : 'bg-page text-plum/70 hover:bg-rose/10 hover:text-rose')
                }
              >
                ⭐ Top Rated (4.8★+)
              </button>
              <button
                onClick={() => setActiveFilter('luxury')}
                className={
                  'rounded-full px-3.5 py-1 text-xs font-semibold transition ' +
                  (activeFilter === 'luxury'
                    ? 'bg-plum text-white shadow-2xs'
                    : 'bg-page text-plum/70 hover:bg-plum/10')
                }
              >
                💎 Luxury Tier (₹1,500+)
              </button>
            </div>

            {/* Sort Selector */}
            <div className='flex items-center gap-2'>
              <span className='text-xs font-bold text-plum/60'>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='rounded-xl border border-plum/20 bg-page px-3 py-1 text-xs font-semibold text-plum focus:border-rose focus:outline-none transition cursor-pointer'
              >
                <option value='recommended'>AI Recommended</option>
                <option value='rating'>Highest Rated ★</option>
                <option value='price-low'>Price: Low to High</option>
                <option value='price-high'>Price: High to Low</option>
              </select>
            </div>
          </div>

          {error && <p role='alert' className='mt-6 font-semibold text-rose'>{error}</p>}
          {loading && <p className='mt-6 text-plum/70'>Loading products from MongoDB Atlas...</p>}
          {!loading && !error && displayedProducts.length === 0 && (
            <p className='mt-6 text-plum/70'>No products found matching your filter.</p>
          )}

          {/* Full-Width Dynamic Grid (Up to 6 columns on wide screens!) */}
          <div className='mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
