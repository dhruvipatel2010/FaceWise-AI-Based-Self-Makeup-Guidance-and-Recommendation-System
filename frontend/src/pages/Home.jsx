import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

export default function Home() {
  const { token } = useAuth()

  const categories = [
    {
      title: 'Virtual Makeup & Shade Matching',
      tag: 'Lipstick · Blush · Contour · Eye',
      to: '/makeup',
      desc: 'Detects skin tone index and facial proportions in real time. Try custom lip shades and blush angles live on camera.',
      img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80',
      badge: 'Live Makeup Try-On',
      cta: 'Try Makeup Live →',
    },
    {
      title: 'Facial Skin Diagnostic & Routines',
      tag: 'Moisture · Pores · Texture · SPF',
      to: '/skincare',
      desc: 'Scans surface radiance and T-zone oiliness zones. Builds tailored morning & night regimens with proven active serums.',
      img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
      badge: 'Live Skin Diagnostics',
      cta: 'Scan Skin Live →',
    },
    {
      title: 'Face-Shape Haircuts & Color Try-On',
      tag: 'Cut Silhouettes · Multi-Tone Tint',
      to: '/hairdressing',
      desc: '3D facial geometry calculates whether your face is Oval, Round, Square, Heart, or Oblong, rendering cuts that balance your features.',
      img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=700&q=80',
      badge: 'Live Hair & Cut Try-On',
      cta: 'Try Haircut & Color →',
    },
  ]

  const stats = [
    { value: '478', label: '3D Face Landmarks Tracked' },
    { value: '60 FPS', label: 'Real-Time Browser Engine' },
    { value: '100%', label: 'Private (Zero Video Uploads)' },
    { value: '5 Shapes', label: 'Geometric Proportion Models' },
  ]

  return (
    <div className='w-full'>
      {/* ── Hero Section (Full-Width Aesthetic) ────────────────────── */}
      <section className='relative overflow-hidden bg-gradient-to-b from-lilac/60 via-page to-page py-16 md:py-24'>
        {/* Decorative soft glow orbs */}
        <div className='pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-rose/15 blur-3xl'></div>
        <div className='pointer-events-none absolute -top-10 right-10 h-80 w-80 rounded-full bg-plum/10 blur-3xl'></div>

        <div className='mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16'>
          <div className='grid items-center gap-12 lg:grid-cols-12'>
            {/* Left Column: Headline & Action */}
            <div className='lg:col-span-7'>
              <div className='inline-flex items-center gap-2 rounded-full border border-rose/30 bg-white/80 px-4 py-1.5 shadow-xs backdrop-blur-md'>
                <span className='h-2 w-2 rounded-full bg-rose animate-pulse'></span>
                <span className='text-xs font-bold uppercase tracking-wider text-rose'>
                  Next-Gen Computer Vision Beauty Assistant
                </span>
              </div>

              <h1 className='mt-6 font-display text-5xl font-bold leading-[1.12] tracking-tight text-plum md:text-6xl lg:text-7xl'>
                Scan your face. <br />
                <span className='bg-gradient-to-r from-rose via-plum to-rose bg-clip-text text-transparent'>
                  Discover looks made for you.
                </span>
              </h1>

              <p className='mt-6 max-w-2xl text-lg text-plum/75 leading-relaxed md:text-xl'>
                FaceWise scans your face shape, tone index, and facial geometry live in your browser camera. 
                Experience instant lipstick try-on, skin texture diagnostics, and haircuts sculpted to your unique facial structure.
              </p>

              {/* Action Buttons */}
              <div className='mt-8 flex flex-wrap items-center gap-4'>
                <Link
                  to='/makeup'
                  className='inline-flex min-h-12 items-center justify-center rounded-full bg-rose px-8 text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-rose/95 hover:shadow-lg'
                >
                  💄 Open Camera & Try On
                </Link>
                <Link
                  to={token ? '/dashboard' : '/register'}
                  className='inline-flex min-h-12 items-center justify-center rounded-full border-2 border-plum px-7 text-base font-bold text-plum transition-all duration-200 hover:bg-plum hover:text-white'
                >
                  {token ? 'Go to Dashboard' : 'Create Free Account'}
                </Link>
              </div>

              {/* Feature Tags */}
              <div className='mt-10 flex flex-wrap gap-4 text-xs font-semibold text-plum/70'>
                <span className='flex items-center gap-1.5'>✓ 100% In-Browser Privacy</span>
                <span className='flex items-center gap-1.5'>✓ No App Required</span>
                <span className='flex items-center gap-1.5'>✓ Real-Time 3D Landmark Tracking</span>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase Card */}
            <div className='lg:col-span-5'>
              <div className='relative overflow-hidden rounded-3xl border border-plum/15 bg-white p-6 shadow-2xl'>
                <div className='flex items-center justify-between border-b border-plum/10 pb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-3 w-3 rounded-full bg-rose animate-ping'></span>
                    <span className='text-xs font-bold uppercase tracking-wider text-plum'>
                      Live Face Landmark Mesh
                    </span>
                  </div>
                  <span className='rounded-full bg-lilac px-3 py-1 text-[11px] font-bold text-plum'>
                    Active Stream
                  </span>
                </div>

                {/* Simulated Visual Landmark Scanner Preview */}
                <div className='relative mt-4 aspect-4/3 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-plum/5 via-lilac to-plum/10 p-4'>
                  <img
                    src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80'
                    alt='Facial Scan Preview'
                    className='h-full w-full rounded-xl object-cover mix-blend-multiply opacity-90'
                  />

                  {/* Aesthetic Target Reticle Overlay */}
                  <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                    <div className='h-48 w-40 rounded-full border-2 border-dashed border-rose/80 animate-pulse'></div>
                  </div>

                  <div className='absolute top-6 left-6 rounded-lg bg-plum/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md'>
                    Face Shape: Oval (1.42)
                  </div>
                  <div className='absolute bottom-6 left-6 rounded-lg bg-rose/90 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md'>
                    Tone: Warm Medium · Smoothness: 92%
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between text-xs text-plum/70'>
                  <span>Try any category live:</span>
                  <div className='flex gap-2 font-bold text-rose'>
                    <Link to='/makeup' className='hover:underline'>Makeup</Link> · 
                    <Link to='/skincare' className='hover:underline'>Skincare</Link> · 
                    <Link to='/hairdressing' className='hover:underline'>Hair</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics / Proof Bar ──────────────────────────────────── */}
      <section className='border-y border-plum/10 bg-white py-10'>
        <div className='mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-6 text-center md:grid-cols-4 md:px-12 lg:px-16'>
          {stats.map((s) => (
            <div key={s.label}>
              <p className='font-display text-3xl md:text-4xl font-bold text-rose'>{s.value}</p>
              <p className='mt-1 text-xs md:text-sm font-medium text-plum/70'>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three Category Exploration Cards (Full-Width Responsive) ── */}
      <section className='py-16 md:py-24'>
        <div className='mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16'>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
              <span className='text-xs font-bold uppercase tracking-wider text-rose'>
                Tailored Guidance
              </span>
              <h2 className='mt-1 font-display text-3xl md:text-5xl font-bold text-plum'>
                Choose What You Want to Elevate
              </h2>
            </div>
            <p className='max-w-md text-sm text-plum/70'>
              Each section features a dedicated live camera scanner engineered specifically for that beauty discipline.
            </p>
          </div>

          <div className='mt-10 grid gap-8 md:grid-cols-3'>
            {categories.map((c) => (
              <div
                key={c.title}
                className='group flex flex-col justify-between overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-rose/40 hover:shadow-xl'
              >
                {/* Card Banner Image */}
                <div className='relative h-60 w-full overflow-hidden bg-lilac'>
                  <img
                    src={c.img}
                    alt={c.title}
                    className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                  />
                  <span className='absolute top-4 left-4 rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold text-plum shadow-xs backdrop-blur-md'>
                    {c.badge}
                  </span>
                </div>

                {/* Card Content */}
                <div className='flex flex-1 flex-col justify-between p-6 md:p-8'>
                  <div>
                    <span className='text-[11px] font-bold uppercase tracking-wider text-rose block'>
                      {c.tag}
                    </span>
                    <h3 className='mt-2 font-display text-2xl font-bold text-plum group-hover:text-rose transition-colors'>
                      {c.title}
                    </h3>
                    <p className='mt-3 text-sm text-plum/70 leading-relaxed'>{c.desc}</p>
                  </div>

                  <div className='mt-6 border-t border-plum/10 pt-4'>
                    <Link
                      to={c.to}
                      className='inline-flex items-center text-sm font-bold text-rose transition group-hover:translate-x-1'
                    >
                      {c.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4-Step How It Works Section ────────────────────────────── */}
      <section className='bg-lilac/40 border-t border-plum/10 py-16 md:py-24'>
        <div className='mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16'>
          <div className='text-center'>
            <span className='text-xs font-bold uppercase tracking-wider text-rose'>
              Effortless Workflow
            </span>
            <h2 className='mt-2 font-display text-3xl md:text-5xl font-bold text-plum'>
              How Live Face Scanning Works
            </h2>
            <p className='mt-2 text-sm text-plum/70'>
              Seamless on-device AI in 4 simple steps without installing any mobile application.
            </p>
          </div>

          <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                step: '01',
                title: 'Select Category',
                desc: 'Choose Makeup, Skincare, or Hairdressing according to your styling goal today.',
              },
              {
                step: '02',
                title: 'Enable Browser Camera',
                desc: 'Allow quick camera access. Video runs entirely on your device and is never stored.',
              },
              {
                step: '03',
                title: 'Instant AI Geometry',
                desc: 'MediaPipe maps 478 3D landmarks to identify face shape, skin tone index, and proportions.',
              },
              {
                step: '04',
                title: 'Realistic Try-On',
                desc: 'Test lipsticks, preview hair colors, view fitted haircut silhouettes, and shop curated products.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className='rounded-3xl border border-plum/10 bg-white p-7 shadow-xs transition hover:border-rose/30'
              >
                <span className='font-display text-4xl font-extrabold text-rose/30'>{st.step}</span>
                <h4 className='mt-3 font-display text-xl font-bold text-plum'>{st.title}</h4>
                <p className='mt-2 text-xs md:text-sm text-plum/70 leading-relaxed'>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
