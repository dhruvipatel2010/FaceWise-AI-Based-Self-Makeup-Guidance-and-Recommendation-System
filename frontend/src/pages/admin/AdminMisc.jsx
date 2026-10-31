/**
 * Remaining admin pages — each is a focused, minimal implementation.
 * Hairstyles, AI/ML Models, Recommendations, Content, Settings.
 * Export each as a named component from this file for clean imports.
 */

// ── Hairstyles ────────────────────────────────────────────────────────────────
export function AdminHairstyles() {
  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Hairstyles</h1>
      <p className='mt-2 text-plum/60'>
        Manage the haircut catalog. Add reference images and categorize by face shape.
      </p>
      <div className='mt-8 rounded-2xl border border-plum/10 bg-white p-8 text-center text-plum/40'>
        Hairstyle catalog — coming in the next phase.
      </div>
    </div>
  )
}

// ── AI/ML Models ─────────────────────────────────────────────────────────────
export function AdminModels() {
  const models = [
    { name: 'Face-shape classifier', version: 'v1.0 (rule-based)', accuracy: 'N/A', type: 'JavaScript rules' },
    { name: 'Makeup overlay',        version: 'v1.0',              accuracy: 'N/A', type: 'Canvas / MediaPipe' },
    { name: 'Hair color preview',    version: 'v1.0',              accuracy: 'N/A', type: 'Segmenter + Canvas' },
    { name: 'Recommendation engine', version: 'v1.0 (rule-based)', accuracy: 'N/A', type: 'Python rules' },
  ]
  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>AI/ML models</h1>
      <p className='mt-1 text-sm text-plum/60'>
        Current model versions and evaluation status. Scikit-learn upgrade planned for Phase 11.
      </p>
      <div className='mt-6 space-y-3'>
        {models.map(m => (
          <div key={m.name} className='rounded-2xl border border-plum/10 bg-white p-5'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='font-semibold text-plum'>{m.name}</p>
                <p className='mt-0.5 text-xs text-plum/60'>{m.type}</p>
              </div>
              <div className='text-right'>
                <span className='rounded-full bg-lilac px-3 py-0.5 text-xs font-semibold'>{m.version}</span>
                <p className='mt-1 text-xs text-plum/60'>Accuracy: {m.accuracy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Recommendations ───────────────────────────────────────────────────────────
export function AdminRecommendations() {
  const rules = [
    { shape: 'Oval',    haircuts: 'Layered bob, Long layers, Side-swept fringe',   makeup: 'Soft blush on cheekbones' },
    { shape: 'Round',   haircuts: 'Long layers, Side part, Angled lob',            makeup: 'Blush swept toward temples' },
    { shape: 'Square',  haircuts: 'Soft waves, Side-swept layers, Wispy fringe',   makeup: 'Soft blush on apple of cheeks' },
    { shape: 'Heart',   haircuts: 'Chin-length bob, Side-parted layers',           makeup: 'Blush on apples, contour temples' },
    { shape: 'Oblong',  haircuts: 'Chin-length bob, Full fringe, Soft waves',      makeup: 'Blush across cheeks, straight brows' },
  ]
  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Recommendations</h1>
      <p className='mt-1 text-sm text-plum/60'>
        Rule-based recommendation mappings by face shape. Edit these in{' '}
        <code className='rounded bg-lilac px-1 text-xs'>frontend/src/suggestions.js</code>.
      </p>
      <div className='mt-6 overflow-x-auto rounded-2xl border border-plum/10 bg-white'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-plum/10 text-left text-plum/60'>
              <th className='px-5 py-3 font-medium'>Face shape</th>
              <th className='px-5 py-3 font-medium'>Haircuts</th>
              <th className='px-5 py-3 font-medium'>Makeup tip</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.shape} className='border-b border-plum/5 last:border-0'>
                <td className='px-5 py-3 font-semibold text-rose'>{r.shape}</td>
                <td className='px-5 py-3 text-plum/70'>{r.haircuts}</td>
                <td className='px-5 py-3 text-plum/70'>{r.makeup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
export function AdminContent() {
  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Content</h1>
      <p className='mt-2 text-plum/60'>Manage FAQs, beauty tips and site-wide disclaimer text.</p>
      <div className='mt-8 rounded-2xl border border-plum/10 bg-white p-8 text-center text-plum/40'>
        Content manager — coming in the next phase.
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function AdminSettings() {
  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Settings</h1>
      <p className='mt-2 text-plum/60'>Application configuration and database backup policies.</p>

      <div className='mt-6 max-w-lg rounded-2xl border border-plum/10 bg-white p-6 space-y-4'>
        <div>
          <p className='text-sm font-semibold text-plum'>Database</p>
          <p className='mt-0.5 text-xs text-plum/60'>
            Connected via <code>MONGODB_URI</code> environment variable. Database name:{' '}
            <code>facewise</code>.
          </p>
        </div>
        <div>
          <p className='text-sm font-semibold text-plum'>Authentication</p>
          <p className='mt-0.5 text-xs text-plum/60'>JWT tokens · 8-hour expiry · bcrypt password hashing</p>
        </div>
        <div>
          <p className='text-sm font-semibold text-plum'>Image storage</p>
          <p className='mt-0.5 text-xs text-plum/60'>
            Cloudinary — configure <code>CLOUDINARY_CLOUD_NAME</code>,{' '}
            <code>CLOUDINARY_API_KEY</code>, <code>CLOUDINARY_API_SECRET</code> in .env.
          </p>
        </div>
        <div>
          <p className='text-sm font-semibold text-plum'>Audit logging</p>
          <p className='mt-0.5 text-xs text-plum/60'>All admin writes are recorded in the admin_logs collection.</p>
        </div>
      </div>
    </div>
  )
}

