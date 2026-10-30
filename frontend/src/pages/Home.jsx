import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

const categories = [
  { title: 'Makeup', to: '/makeup', text: 'Looks, shades and products matched to your face.' },
  { title: 'Skincare', to: '/skincare', text: 'Answer a short questionnaire and get routines and products.' },
  { title: 'Hairdressing', to: '/hairdressing', text: 'Haircuts, hairstyles and colors that suit your face shape.' },
]

export default function Home() {
  const { token } = useAuth()

  return (
    <main className='mx-auto max-w-6xl px-6 md:px-12'>
      <section className='py-12 md:py-20'>
        <p className='text-sm font-semibold tracking-widest text-plum/70'>AI BEAUTY GUIDE</p>
        <h1 className='mt-4 max-w-2xl font-display text-5xl leading-tight md:text-6xl'>
          Scan your face. Get looks made for you.
        </h1>
        <p className='mt-5 max-w-xl text-lg text-plum/70'>
          FaceWise reads your face shape from a live camera scan and suggests makeup, skincare and hairstyles.
        </p>
        <div className='mt-8'>
          <Link
            to={token ? '/dashboard' : '/register'}
            className='inline-flex min-h-12 items-center rounded-full bg-rose px-8 font-semibold text-white hover:opacity-90'
          >
            {token ? 'Go to dashboard' : 'Get started'}
          </Link>
        </div>
      </section>
      <section className='grid gap-6 pb-16 md:grid-cols-3'>
        {categories.map((c) => (
          <Link key={c.title} to={c.to} className='rounded-3xl border border-plum/10 bg-white p-7 hover:border-rose'>
            <h2 className='font-display text-2xl'>{c.title}</h2>
            <p className='mt-2 text-sm text-plum/70'>{c.text}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
