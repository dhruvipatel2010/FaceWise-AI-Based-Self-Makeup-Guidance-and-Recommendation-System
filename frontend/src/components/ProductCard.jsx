export default function ProductCard({ product }) {
  return (
    <div className='rounded-3xl border border-plum/10 bg-white p-4'>
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className='h-40 w-full rounded-2xl object-cover' />
      ) : (
        <div className='flex h-40 items-center justify-center rounded-2xl bg-lilac text-sm text-plum/60'>
          No image yet
        </div>
      )}
      <h3 className='mt-4 font-semibold'>{product.name}</h3>
      <p className='text-sm text-plum/70'>{product.brand}</p>
      <p className='mt-2 font-display text-xl'>{'\u20B9'}{product.price}</p>
    </div>
  )
}
