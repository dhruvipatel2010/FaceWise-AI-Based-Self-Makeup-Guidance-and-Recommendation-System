import { useEffect, useState } from 'react'
import api, { errorMessage } from '../services/api'
import ProductCard from './ProductCard'

export default function CategoryPage({ category, title, intro }) {
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
      <h1 className='font-display text-4xl'>{title}</h1>
      <p className='mt-2 max-w-xl text-plum/70'>{intro}</p>

      <form onSubmit={handleSearch} className='mt-6 flex flex-wrap gap-3'>
        <label htmlFor='search' className='sr-only'>Search products</label>
        <input
          id='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'Search in ' + title}
          className='min-h-12 flex-1 rounded-full border-2 border-plum/20 bg-white px-5 focus:border-rose focus:outline-none'
        />
        <button type='submit' className='min-h-12 rounded-full bg-rose px-8 font-semibold text-white hover:opacity-90'>
          Search
        </button>
      </form>

      {error && <p role='alert' className='mt-6 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/70'>Loading products...</p>}
      {!loading && !error && products.length === 0 && (
        <p className='mt-6 text-plum/70'>No products found.</p>
      )}

      <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  )
}
