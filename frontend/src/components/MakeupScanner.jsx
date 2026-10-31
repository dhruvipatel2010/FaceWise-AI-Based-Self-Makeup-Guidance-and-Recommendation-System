import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { drawMakeup, sampleTone, LIP_COLORS, BLUSH_COLORS } from '../makeupOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export default function MakeupScanner({ onDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const filesetRef = useRef(null)
  const rafRef = useRef(0)
  const lastShapeAt = useRef(0)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [faceShape, setFaceShape] = useState(null)
  const [skinTone, setSkinTone] = useState('')
  const [tryOn, setTryOn] = useState(true)

  const [selectedLip, setSelectedLip] = useState('Berry Velvet')
  const [selectedBlush, setSelectedBlush] = useState('Rose Petal')

  const tryOnRef = useRef(true)
  const lipRef = useRef(LIP_COLORS['Berry Velvet'])
  const blushRef = useRef(BLUSH_COLORS['Rose Petal'])
  const shapeRef = useRef('Oval')
  const toneRef = useRef('Medium')

  useEffect(() => {
    tryOnRef.current = tryOn
  }, [tryOn])

  function pickLip(name) {
    setSelectedLip(name)
    lipRef.current = LIP_COLORS[name]
  }

  function pickBlush(name) {
    setSelectedBlush(name)
    blushRef.current = BLUSH_COLORS[name]
  }

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

        if (now - lastShapeAt.current > 400) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          const t = sampleTone(ctx, lm, w, h)
          shapeRef.current = s.shape
          toneRef.current = t
          setFaceShape(s)
          setSkinTone(t)
          if (onDetected) onDetected({ shape: s.shape, tone: t })
        }

        if (tryOnRef.current) {
          drawMakeup(ctx, lm, w, h, shapeRef.current, toneRef.current, {
            lipColor: lipRef.current,
            blushColor: blushRef.current,
          })
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
            AI Camera Makeup Match
          </span>
          <h2 className='mt-2 font-display text-2xl font-bold text-plum'>
            Live Face & Skin Tone Makeup Try-On
          </h2>
          <p className='text-sm text-plum/70'>
            Scan your face in real-time to detect your skin tone and test lipstick & blush overlays live on camera.
          </p>
        </div>

        <div>
          {!active ? (
            <button
              onClick={startCamera}
              disabled={loading}
              className='min-h-11 rounded-full bg-rose px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50'
            >
              {loading ? (status || 'Starting Camera...') : '📸 Start Live Makeup Try-On'}
            </button>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={() => setTryOn(!tryOn)}
                className={
                  'min-h-10 rounded-full px-5 text-sm font-semibold transition ' +
                  (tryOn ? 'bg-rose text-white shadow-xs' : 'border border-plum/20 bg-page text-plum')
                }
              >
                {tryOn ? '✓ Makeup ON' : 'Makeup OFF'}
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

      {/* Camera Viewport & Controls Grid - ALWAYS IN DOM so videoRef is never null */}
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
                <span className='text-2xl'>💄</span>
              </div>
              <p className='mt-3 font-display text-lg font-semibold text-plum'>Camera is currently off</p>
              <p className='mt-1 max-w-sm text-xs text-plum/70'>
                Click "Start Live Makeup Try-On" above to activate your camera and preview shades directly on your face.
              </p>
            </div>
          )}

          {active && skinTone && (
            <div className='absolute bottom-3 left-3 rounded-full bg-plum/85 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur'>
              Detected: {skinTone} Tone · {faceShape?.shape} Face
            </div>
          )}
        </div>

        {/* Real-time Makeup Controls */}
        <div className='flex flex-col justify-between rounded-2xl border border-plum/10 bg-page p-5 md:col-span-5'>
          <div>
            <h3 className='font-display text-base font-bold text-plum'>Try Lipstick Shades</h3>
            <p className='text-xs text-plum/60'>Click a shade to preview live on your lips:</p>
            <div className='mt-2.5 flex flex-wrap gap-2'>
              {Object.keys(LIP_COLORS).map((name) => (
                <button
                  key={name}
                  onClick={() => pickLip(name)}
                  className={
                    'min-h-8 rounded-full px-3.5 text-xs font-semibold transition ' +
                    (selectedLip === name
                      ? 'bg-rose text-white shadow-xs'
                      : 'border border-plum/20 bg-white hover:border-rose')
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            <h3 className='mt-5 font-display text-base font-bold text-plum'>Blush Placement</h3>
            <p className='text-xs text-plum/60'>Angle optimized for {faceShape?.shape || 'your'} face structure:</p>
            <div className='mt-2.5 flex flex-wrap gap-2'>
              {Object.keys(BLUSH_COLORS).map((name) => (
                <button
                  key={name}
                  onClick={() => pickBlush(name)}
                  className={
                    'min-h-8 rounded-full px-3.5 text-xs font-semibold transition ' +
                    (selectedBlush === name
                      ? 'bg-plum text-white shadow-xs'
                      : 'border border-plum/20 bg-white hover:border-plum')
                  }
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className='mt-5 rounded-xl border border-rose/20 bg-rose/5 p-3.5'>
            <p className='text-xs font-bold text-rose'>💡 Real-time Beauty Guidance:</p>
            <p className='mt-1 text-xs text-plum/80 leading-relaxed'>
              {skinTone === 'Light' && 'Peach and soft rose shades illuminate your fair complexion with a natural flush.'}
              {skinTone === 'Medium' && 'Warm berry, terracotta and nude tones create a radiant, sun-kissed balance.'}
              {skinTone === 'Deep' && 'Rich wine, ruby red, and plum tones create dramatic, gorgeous contrast.'}
              {!skinTone && 'Start the camera to detect your tone index and unlock personalized shade pairings.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
