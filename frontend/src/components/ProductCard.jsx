export default function ProductCard({ product }) {
  const rating = product.rating || 4.8
  const reviews = product.reviews || 140

  return (
    <div className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-plum/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-xl'>
      {/* Product Image Container with Zoom */}
      <div className='relative aspect-square w-full overflow-hidden rounded-2xl bg-lilac/50'>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-lilac text-sm text-plum/60'>
            No image
          </div>
        )}

        {/* Category Pill Tag */}
        <span className='absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-plum shadow-xs backdrop-blur-md'>
          {product.category}
        </span>

        {/* Rating Badge */}
        <span className='absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-plum/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md'>
          <span className='text-amber-400'>★</span> {rating} ({reviews})
        </span>
      </div>

      {/* Info Section */}
      <div className='mt-4 flex flex-1 flex-col justify-between'>
        <div>
          <p className='text-xs font-bold tracking-wider uppercase text-rose'>
            {product.brand || 'FaceWise Exclusive'}
          </p>
          <h3 className='mt-1 font-display text-base font-bold text-plum group-hover:text-rose transition-colors line-clamp-1'>
            {product.name}
          </h3>
          <p className='mt-1 text-xs text-plum/70 line-clamp-2 leading-relaxed'>
            {product.description || 'Formulated with skin-nourishing botanical active ingredients.'}
          </p>
          {product.shade && (
            <p className='mt-2 inline-block rounded-md bg-lilac/70 px-2 py-0.5 text-[10px] font-semibold text-plum/80'>
              Shade: {product.shade}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className='mt-4 flex items-center justify-between border-t border-plum/5 pt-3'>
          <div>
            <span className='text-[10px] text-plum/50 uppercase font-semibold block'>Price</span>
            <span className='font-display text-xl font-bold text-plum'>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='rounded-full bg-page px-4 py-2 text-xs font-bold text-plum transition-all duration-200 hover:bg-rose hover:text-white hover:shadow-md'
          >
            Try On ↑
          </button>
        </div>
      </div>
    </div>
  )
}
