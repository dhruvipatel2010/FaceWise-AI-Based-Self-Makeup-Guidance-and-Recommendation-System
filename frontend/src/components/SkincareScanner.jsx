import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { analyzeSkinMetrics, drawSkincareOverlay } from '../makeupOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export default function SkincareScanner({ onSkinAnalyzed }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const filesetRef = useRef(null)
  const rafRef = useRef(0)
  const lastAnalyzedAt = useRef(0)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [skinData, setSkinData] = useState(null)
  const [showZones, setShowZones] = useState(true)
  const [concern, setConcern] = useState('Hydration & Glow')

  const CONCERNS = ['Hydration & Glow', 'Acne & Blemish', 'Anti-Aging', 'Dark Spots', 'Oil Control']

  async function startCamera() {
    setError('')
    setLoading(true)
    setStatus('Loading AI facial model...')

    try {
      if (!filesetRef.current) {
        filesetRef.current = await FilesetResolver.forVisionTasks(WASM_URL)
      }
      if (!landmarkerRef.current) {
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetRef.current, {
          baseOptions: { modelAssetPath: FACE_MODEL },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      }

      setStatus('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setActive(true)
      setLoading(false)
      setStatus('')
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      console.error(err)
      setError('Could not access camera. Please allow camera permissions and ensure no other app is using it.')
      setLoading(false)
      setStatus('')
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setActive(false)
    setStatus('')
  }

  function loop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker) return

    if (video.readyState >= 2) {
      const w = video.videoWidth
      const h = video.videoHeight
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, w, h)

      const result = landmarker.detectForVideo(video, performance.now())
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const lm = result.faceLandmarks[0]
        const now = performance.now()

        if (now - lastAnalyzedAt.current > 500) {
          lastAnalyzedAt.current = now
          const metrics = analyzeSkinMetrics(ctx, lm, w, h)
          setSkinData(metrics)
          if (onSkinAnalyzed) onSkinAnalyzed(metrics)
        }

        if (showZones) {
          drawSkincareOverlay(ctx, lm, w, h)
        }
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className='overflow-hidden rounded-3xl border border-plum/10 bg-white p-6 shadow-sm'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <span className='rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose'>
            AI Camera Skin Diagnostic
          </span>
          <h2 className='mt-2 font-display text-2xl font-bold text-plum'>
            Live Facial Skin Structure & Tone Analysis
          </h2>
          <p className='text-sm text-plum/70'>
            Real-time camera analysis of your skin tone, texture, moisture balance and T-zone pore profile.
          </p>
        </div>

        <div>
          {!active ? (
            <button
              onClick={startCamera}
              disabled={loading}
              className='min-h-11 rounded-full bg-rose px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50'
            >
              {loading ? (status || 'Starting Camera...') : '🔬 Start Live Skin Scan'}
            </button>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={() => setShowZones(!showZones)}
                className='min-h-10 rounded-full border border-plum/20 bg-page px-5 text-sm font-semibold text-plum hover:border-plum'
              >
                {showZones ? 'Hide Zones' : 'Show Zones'}
              </button>
              <button
                onClick={stopCamera}
                className='min-h-10 rounded-full border border-plum/30 px-5 text-sm font-semibold hover:bg-plum hover:text-white transition'
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {status && <p className='mt-3 text-xs font-medium text-plum/70 animate-pulse'>{status}</p>}
      {error && <p role='alert' className='mt-3 text-sm font-semibold text-rose'>{error}</p>}

      {/* Camera Viewport & Metrics Grid - ALWAYS IN DOM so videoRef is never null */}
      <div className='mt-6 grid gap-6 md:grid-cols-12'>
        {/* Camera Viewport */}
        <div className='relative aspect-video w-full overflow-hidden rounded-2xl bg-lilac md:col-span-7'>
          <video
            ref={videoRef}
            playsInline
            muted
            className={'h-full w-full -scale-x-100 object-cover ' + (!active ? 'hidden' : 'block')}
          />
          <canvas
            ref={canvasRef}
            className={'pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover ' + (!active ? 'hidden' : 'block')}
          />

          {!active && (
            <div className='flex h-full w-full flex-col items-center justify-center p-6 text-center text-plum/60'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm'>
                <span className='text-2xl'>📷</span>
              </div>
              <p className='mt-3 font-display text-lg font-semibold text-plum'>Camera is currently off</p>
              <p className='mt-1 max-w-sm text-xs text-plum/70'>
                Click "Start Live Skin Scan" above to activate your camera and perform facial structure & texture analysis.
              </p>
            </div>
          )}

          {active && skinData && (
            <div className='absolute bottom-3 left-3 rounded-full bg-plum/85 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur'>
              Skin Tone: {skinData.tone} · Tendency: {skinData.skinType}
            </div>
          )}
        </div>

        {/* Diagnostic Metrics Display */}
        <div className='flex flex-col justify-between rounded-2xl border border-plum/10 bg-page p-5 md:col-span-5'>
          <div>
            <h3 className='font-display text-base font-bold text-plum'>Scanned Skin Metrics</h3>

            <div className='mt-3 space-y-2.5 text-xs'>
              <div className='flex items-center justify-between rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/70'>Estimated Skin Profile:</span>
                <span className='font-bold text-rose'>{skinData?.skinType || (active ? 'Analyzing...' : 'Ready to scan')}</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/70'>Tone Index:</span>
                <span className='font-bold text-plum'>{skinData?.tone || (active ? 'Detecting...' : 'Ready')}</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/70'>Surface Radiance:</span>
                <span className='font-bold text-green-700'>{skinData?.smoothness || (active ? 'Scanning...' : 'Ready')}</span>
              </div>
              <div className='flex items-center justify-between rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/70'>T-Zone / Pores:</span>
                <span className='font-bold text-plum'>{skinData?.pores || (active ? 'Assessing...' : 'Balanced')}</span>
              </div>
            </div>

            {/* Primary Concern Selector */}
            <h4 className='mt-4 font-display text-xs font-bold text-plum'>Target Skin Goal:</h4>
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {CONCERNS.map((c) => (
                <button
                  key={c}
                  onClick={() => setConcern(c)}
                  className={
                    'rounded-full px-3 py-1 text-xs font-semibold transition ' +
                    (concern === c ? 'bg-rose text-white shadow-xs' : 'border border-plum/20 bg-white hover:border-rose')
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Routine summary */}
          <div className='mt-4 rounded-xl border border-plum/10 bg-white p-3 text-xs'>
            <p className='font-bold text-plum'>☀️ Recommended Routine for your scan:</p>
            <p className='mt-1 text-plum/70 leading-relaxed'>
              1. Gentle Cleanser → 2. Vitamin C / Niacinamide Serum → 3. Light Hydrating Moisturizer → 4. Broad Spectrum SPF 50.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
