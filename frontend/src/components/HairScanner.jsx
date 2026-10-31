import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { drawHaircut } from '../haircutOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const HAIR_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'

const HAIR_COLORS = {
  Natural: null,
  Chocolate: [107, 65, 48],
  Honey: [184, 134, 63],
  Burgundy: [110, 28, 48],
  Copper: [170, 85, 45],
  'Ash brown': [110, 95, 85],
  Caramel: [165, 105, 55],
}

const HAIRCUT_PREVIEWS = {
  Oval: [
    { name: 'Layered Bob', desc: 'Adds movement and flatters balanced cheekbones' },
    { name: 'Curtain Bangs', desc: 'Soft romantic fringe framing the face' },
    { name: 'Long Waves', desc: 'Maintains length with soft dimensional volume' },
  ],
  Round: [
    { name: 'Angled Lob', desc: 'Elongates the jawline and creates vertical balance' },
    { name: 'Long Waves', desc: 'Adds height and slimming vertical lines' },
    { name: 'Curtain Bangs', desc: 'Frames the sides to narrow cheek width' },
  ],
  Square: [
    { name: 'Soft Waves', desc: 'Softens strong jaw corners and adds flow' },
    { name: 'Side-Swept Fringe', desc: 'Breaks up sharp angular jawlines gently' },
    { name: 'Layered Bob', desc: 'Curves softly under the jaw to balance angles' },
  ],
  Heart: [
    { name: 'Chin-Length Bob', desc: 'Adds fullness around the narrower jaw and chin' },
    { name: 'Curtain Bangs', desc: 'Draws focus to eyes and balances wider forehead' },
    { name: 'Pixie Cut', desc: 'Textured crown with soft tapered temples' },
  ],
  Oblong: [
    { name: 'Layered Bob', desc: 'Shortens face length and adds width at cheekbones' },
    { name: 'Curtain Bangs', desc: 'Shortens forehead and creates horizontal balance' },
    { name: 'Soft Waves', desc: 'Adds side volume rather than vertical height' },
  ],
}

export default function HairScanner({ onFaceShapeDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const segmenterRef = useRef(null)
  const filesetRef = useRef(null)
  const hairMaskRef = useRef(null)
  const rafRef = useRef(0)
  const frameRef = useRef(0)
  const lastShapeAt = useRef(0)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [faceShape, setFaceShape] = useState(null)
  const [hairName, setHairName] = useState('Chocolate')
  const [activeCut, setActiveCut] = useState('Layered Bob')
  const [showCutOverlay, setShowCutOverlay] = useState(true)

  // Interactive Haircut Fitting Controls
  const [hairScale, setHairScale] = useState(1.0)
  const [hairHeight, setHairHeight] = useState(0)

  const hairRef = useRef(HAIR_COLORS['Chocolate'])
  const hairNameRef = useRef('Chocolate')
  const activeCutRef = useRef('Layered Bob')
  const showCutOverlayRef = useRef(true)
  const fitOptionsRef = useRef({ scaleMultiplier: 1.0, nudgeY: 0 })

  useEffect(() => {
    activeCutRef.current = activeCut
  }, [activeCut])

  useEffect(() => {
    showCutOverlayRef.current = showCutOverlay
  }, [showCutOverlay])

  useEffect(() => {
    fitOptionsRef.current = {
      scaleMultiplier: hairScale,
      nudgeY: hairHeight,
    }
  }, [hairScale, hairHeight])

  async function pickHair(name) {
    setHairName(name)
    hairNameRef.current = name
    hairRef.current = HAIR_COLORS[name]
    if (!HAIR_COLORS[name]) {
      hairMaskRef.current = null
      return
    }

    if (!segmenterRef.current && filesetRef.current) {
      try {
        segmenterRef.current = await ImageSegmenter.createFromOptions(filesetRef.current, {
          baseOptions: { modelAssetPath: HAIR_MODEL },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        })
      } catch (err) {
        console.error('Failed to load hair segmenter', err)
      }
    }
  }

  function updateMask(res) {
    const m = res.categoryMask
    if (!m || !hairRef.current) return
    const data = m.getAsUint8Array()
    const mw = m.width
    const mh = m.height
    let c = hairMaskRef.current
    if (!c || c.width !== mw || c.height !== mh) {
      c = document.createElement('canvas')
      c.width = mw
      c.height = mh
      hairMaskRef.current = c
    }
    const cctx = c.getContext('2d')
    const img = cctx.createImageData(mw, mh)
    const [r, g, b] = hairRef.current
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 1) {
        const k = i * 4
        img.data[k] = r
        img.data[k + 1] = g
        img.data[k + 2] = b
        img.data[k + 3] = 255
      }
    }
    cctx.putImageData(img, 0, 0)
  }

  function paintHair(ctx, w, h) {
    const mask = hairMaskRef.current
    if (!mask) return
    ctx.save()
    ctx.filter = 'blur(1.5px)'
    ctx.globalCompositeOperation = 'color'
    ctx.globalAlpha = 0.75
    ctx.drawImage(mask, 0, 0, w, h)
    ctx.globalCompositeOperation = 'soft-light'
    ctx.globalAlpha = 0.50
    ctx.drawImage(mask, 0, 0, w, h)
    ctx.restore()
  }

  async function startCamera() {
    setError('')
    setLoading(true)
    setStatus('Loading AI face & hair models...')

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
      if (!segmenterRef.current) {
        segmenterRef.current = await ImageSegmenter.createFromOptions(filesetRef.current, {
          baseOptions: { modelAssetPath: HAIR_MODEL },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
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

        if (now - lastShapeAt.current > 500) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          setFaceShape(s)
          if (onFaceShapeDetected) onFaceShapeDetected(s)
        }

        // 1. Live real hair color tinting via AI segmentation
        if (hairRef.current && segmenterRef.current) {
          frameRef.current++
          if (frameRef.current % 2 === 0) {
            segmenterRef.current.segmentForVideo(video, performance.now(), updateMask)
          }
          paintHair(ctx, w, h)
        }

        // 2. Realistic Photographic Haircut Try-On Overlay
        if (showCutOverlayRef.current && activeCutRef.current) {
          drawHaircut(
            ctx,
            lm,
            w,
            h,
            activeCutRef.current,
            hairNameRef.current,
            fitOptionsRef.current
          )
        }
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const haircuts = HAIRCUT_PREVIEWS[faceShape?.shape || 'Oval'] || HAIRCUT_PREVIEWS.Oval

  return (
    <div className='overflow-hidden rounded-3xl border border-plum/10 bg-white p-6 shadow-sm'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <span className='rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose'>
            AI Face Shape & Hair Try-On
          </span>
          <h2 className='mt-2 font-display text-2xl font-bold text-plum'>
            Photorealistic Haircut & Color Camera Preview
          </h2>
          <p className='text-sm text-plum/70'>
            Measure your face shape live on camera, recolor your real hair, and test high-definition photographic haircuts.
          </p>
        </div>

        <div>
          {!active ? (
            <button
              onClick={startCamera}
              disabled={loading}
              className='min-h-11 rounded-full bg-rose px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50'
            >
              {loading ? (status || 'Starting Camera...') : '💇 Start Live Haircut & Color Scan'}
            </button>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={() => setShowCutOverlay(!showCutOverlay)}
                className={
                  'min-h-10 rounded-full px-5 text-sm font-semibold transition ' +
                  (showCutOverlay ? 'bg-rose text-white shadow-xs' : 'border border-plum/20 bg-page text-plum')
                }
              >
                {showCutOverlay ? '✓ Haircut Overlay ON' : 'Haircut Overlay OFF'}
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

      {/* Camera Viewport & Controls Grid */}
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
                <span className='text-2xl'>💇</span>
              </div>
              <p className='mt-3 font-display text-lg font-semibold text-plum'>Camera is currently off</p>
              <p className='mt-1 max-w-sm text-xs text-plum/70'>
                Click "Start Live Haircut & Color Scan" to test realistic haircuts and tints live on your real face.
              </p>
            </div>
          )}

          {active && faceShape && (
            <div className='absolute bottom-3 left-3 rounded-full bg-plum/85 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur'>
              Detected: {faceShape.shape} Face · Cut: {activeCut}
            </div>
          )}
        </div>

        {/* Hair Color & Haircut Selector */}
        <div className='flex flex-col justify-between rounded-2xl border border-plum/10 bg-page p-5 md:col-span-5'>
          <div>
            <h3 className='font-display text-base font-bold text-plum'>1. Live Hair Colors</h3>
            <p className='text-xs text-plum/60'>Recolor your hair live in the camera stream:</p>
            <div className='mt-2.5 flex flex-wrap gap-2'>
              {Object.keys(HAIR_COLORS).map((name) => (
                <button
                  key={name}
                  onClick={() => pickHair(name)}
                  className={
                    'min-h-8 rounded-full px-3.5 text-xs font-semibold transition ' +
                    (hairName === name
                      ? 'bg-rose text-white shadow-xs'
                      : 'border border-plum/20 bg-white hover:border-rose')
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            <h3 className='mt-5 font-display text-base font-bold text-plum'>
              2. Haircuts for {faceShape?.shape || 'Balanced Facial Proportions'}
            </h3>
            <p className='text-xs text-plum/60'>Click any cut to preview live on your head:</p>
            <div className='mt-2.5 space-y-2'>
              {haircuts.map((cut) => (
                <div
                  key={cut.name}
                  onClick={() => {
                    setActiveCut(cut.name)
                    setShowCutOverlay(true)
                  }}
                  className={
                    'cursor-pointer rounded-xl border p-2.5 transition ' +
                    (activeCut === cut.name
                      ? 'border-rose bg-rose/10 shadow-xs ring-1 ring-rose/30'
                      : 'border-plum/10 bg-white hover:border-plum/30')
                  }
                >
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-bold text-plum'>{cut.name}</p>
                    <span className='rounded-full bg-lilac px-2 py-0.5 text-[10px] font-semibold text-plum'>
                      {activeCut === cut.name ? '★ Live on Camera' : 'Try Cut'}
                    </span>
                  </div>
                  <p className='mt-0.5 text-[11px] text-plum/70'>{cut.desc}</p>
                </div>
              ))}
            </div>

            {/* Precision Haircut Fit Controls */}
            {active && showCutOverlay && (
              <div className='mt-5 rounded-2xl border border-plum/10 bg-white p-3.5 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-plum'>Fine-Tune Haircut Fit:</span>
                  <button
                    onClick={() => {
                      setHairScale(1.0)
                      setHairHeight(0)
                    }}
                    className='text-[10px] font-semibold text-rose hover:underline'
                  >
                    Reset Fit
                  </button>
                </div>

                <div>
                  <div className='flex justify-between text-[11px] text-plum/70'>
                    <span>Hairline Height (Up/Down):</span>
                    <span>{hairHeight > 0 ? `+${hairHeight}` : hairHeight}px</span>
                  </div>
                  <input
                    type='range'
                    min='-35'
                    max='35'
                    value={hairHeight}
                    onChange={(e) => setHairHeight(parseInt(e.target.value))}
                    className='w-full accent-rose cursor-pointer'
                  />
                </div>

                <div>
                  <div className='flex justify-between text-[11px] text-plum/70'>
                    <span>Haircut Width / Scale:</span>
                    <span>{Math.round(hairScale * 100)}%</span>
                  </div>
                  <input
                    type='range'
                    min='0.85'
                    max='1.20'
                    step='0.01'
                    value={hairScale}
                    onChange={(e) => setHairScale(parseFloat(e.target.value))}
                    className='w-full accent-rose cursor-pointer'
                  />
                </div>
              </div>
            )}
          </div>

          <p className='mt-4 text-[11px] text-plum/60 leading-relaxed'>
            💡 Haircuts dynamically anchor to your facial contours and move with your head tilt.
          </p>
        </div>
      </div>
    </div>
  )
}
