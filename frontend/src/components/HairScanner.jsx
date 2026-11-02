import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { sampleTone } from '../makeupOverlay'
import {
  drawHaircut,
  tintRealHair,
  HAIR_COLORS_RGB,
  HAIRCUT_RECOMMENDATIONS,
  HAIR_COLOR_RECOMMENDATIONS,
} from '../haircutOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const SEG_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'

const HAIRSTYLE_OPTIONS = [
  { id: 'layered-bob', name: 'Layered Bob', desc: 'Shortens face length and widens cheek area' },
  { id: 'curtain-bangs', name: 'Curtain Bangs', desc: 'Frames forehead and softens angles' },
  { id: 'long-waves', name: 'Long Waves', desc: 'Elongating flow past shoulders' },
  { id: 'pixie-cut', name: 'Pixie Cut', desc: 'Chic textured crown volume' },
  { id: 'angled-lob', name: 'Angled Lob', desc: 'Sharp modern chin-to-collarbone slant' },
  { id: 'soft-waves', name: 'Soft Waves', desc: 'Gentle bouncy layers with natural movement' },
]

export default function HairScanner({ onFaceShapeDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const segmenterRef = useRef(null)
  const filesetRef = useRef(null)
  const rafRef = useRef(0)
  const lastShapeAt = useRef(0)
  const lastSegAt = useRef(0)
  const segMaskRef = useRef(null)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  // AI Face & Skin detection results
  const [faceShape, setFaceShape] = useState(null)
  const [skinTone, setSkinTone] = useState('')

  // Modes
  const [tryOnCut, setTryOnCut] = useState(false) // Whether to overlay hairstyle cut
  const [recolorHair, setRecolorHair] = useState(true) // Recolor real hair directly
  const [selectedCut, setSelectedCut] = useState('Layered Bob')
  const [selectedColor, setSelectedColor] = useState('Chocolate')

  // Live adjustments
  const [hairScale, setHairScale] = useState(1.0)
  const [hairHeight, setHairHeight] = useState(0)

  // Refs for requestAnimationFrame loop
  const tryOnCutRef = useRef(false)
  const recolorHairRef = useRef(true)
  const selectedCutRef = useRef('Layered Bob')
  const selectedColorRef = useRef('Chocolate')
  const fitOptionsRef = useRef({ scaleMultiplier: 1.0, nudgeY: 0 })

  useEffect(() => {
    tryOnCutRef.current = tryOnCut
  }, [tryOnCut])

  useEffect(() => {
    recolorHairRef.current = recolorHair
  }, [recolorHair])

  useEffect(() => {
    selectedCutRef.current = selectedCut
  }, [selectedCut])

  useEffect(() => {
    selectedColorRef.current = selectedColor
  }, [selectedColor])

  useEffect(() => {
    fitOptionsRef.current = { scaleMultiplier: hairScale, nudgeY: hairHeight }
  }, [hairScale, hairHeight])

  // Recommended cuts for current shape
  const currentShapeKey = faceShape?.shape || 'Oval'
  const shapeRec = HAIRCUT_RECOMMENDATIONS[currentShapeKey] || HAIRCUT_RECOMMENDATIONS.Oval
  const currentToneKey = skinTone || 'Medium'
  const colorRec = HAIR_COLOR_RECOMMENDATIONS[currentToneKey] || HAIR_COLOR_RECOMMENDATIONS.Medium

  async function startCamera() {
    setError('')
    setLoading(true)
    setStatus('Loading AI facial models...')

    try {
      if (!filesetRef.current) {
        filesetRef.current = await FilesetResolver.forVisionTasks(WASM_URL)
      }
      if (!landmarkerRef.current) {
        setStatus('Loading face landmark model...')
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetRef.current, {
          baseOptions: { modelAssetPath: FACE_MODEL },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      }
      if (!segmenterRef.current) {
        setStatus('Loading hair segmentation model...')
        try {
          segmenterRef.current = await ImageSegmenter.createFromOptions(filesetRef.current, {
            baseOptions: { modelAssetPath: SEG_MODEL },
            runningMode: 'VIDEO',
            outputCategoryMask: true,
            outputConfidenceMasks: false,
          })
        } catch (e) {
          console.warn('Hair segmenter optional fallback:', e)
        }
      }

      setStatus('Accessing camera...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
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
      setError('Could not access camera. Please allow camera permissions.')
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
    segMaskRef.current = null
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
      const now = performance.now()

      // 1. Draw live camera feed
      ctx.drawImage(video, 0, 0, w, h)

      // 2. Segment real hair for natural recoloring (every ~160ms)
      const seg = segmenterRef.current
      if (seg && now - lastSegAt.current > 160) {
        lastSegAt.current = now
        try {
          const segResult = seg.segmentForVideo(video, now)
          if (segResult?.categoryMask) {
            const mask = segResult.categoryMask
            segMaskRef.current = {
              data: mask.getAsUint8Array(),
              width: mask.width,
              height: mask.height,
            }
            mask.close()
          }
        } catch (e) {
          // ignore transient segmenter errors
        }
      }

      // 3. Real Hair Recolor directly onto live hair strands (NO WIG, 100% natural!)
      if (recolorHairRef.current && segMaskRef.current && selectedColorRef.current !== 'Natural') {
        const { data, width, height } = segMaskRef.current
        tintRealHair(ctx, data, width, height, w, h, selectedColorRef.current)
      }

      // 4. Face Landmark Detection for Face Shape & Skin Tone analysis
      const result = landmarker.detectForVideo(video, now)
      if (result.faceLandmarks?.length > 0) {
        const lm = result.faceLandmarks[0]

        if (now - lastShapeAt.current > 400) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          const t = sampleTone(ctx, lm, w, h)
          setFaceShape(s)
          setSkinTone(t)
          if (onFaceShapeDetected) onFaceShapeDetected({ shape: s.shape, tone: t })
        }

        // 5. Draw Hairstyle Cut Overlay (with face-hole protection so face is NEVER covered)
        if (tryOnCutRef.current && selectedCutRef.current) {
          drawHaircut(
            ctx,
            lm,
            w,
            h,
            selectedCutRef.current,
            selectedColorRef.current,
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

  return (
    <div className='overflow-hidden rounded-3xl border border-plum/10 bg-white p-6 shadow-sm'>
      {/* ── Header (Identical design to Skincare & Makeup) ────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <span className='rounded-full bg-rose/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose'>
            AI Camera Haircut & Color Studio
          </span>
          <h2 className='mt-2 font-display text-2xl font-bold text-plum'>
            Live Facial Structure Haircut & Color AI Guidance
          </h2>
          <p className='text-sm text-plum/70'>
            Real-time camera analysis of your face shape & skin tone. Recolor your actual hair naturally or preview AI-recommended haircuts.
          </p>
        </div>

        <div>
          {!active ? (
            <button
              onClick={startCamera}
              disabled={loading}
              className='min-h-11 rounded-full bg-rose px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50'
            >
              {loading ? (status || 'Starting Camera...') : '📸 Start Live Hair Scan'}
            </button>
          ) : (
            <div className='flex flex-wrap items-center gap-2'>
              <button
                onClick={() => setRecolorHair(!recolorHair)}
                className={
                  'min-h-10 rounded-full px-4 text-xs font-semibold transition ' +
                  (recolorHair ? 'bg-rose text-white shadow-xs' : 'border border-plum/20 bg-page text-plum')
                }
              >
                {recolorHair ? '✓ Hair Color ON' : 'Hair Color OFF'}
              </button>
              <button
                onClick={() => setTryOnCut(!tryOnCut)}
                className={
                  'min-h-10 rounded-full px-4 text-xs font-semibold transition ' +
                  (tryOnCut ? 'bg-plum text-white shadow-xs' : 'border border-plum/20 bg-page text-plum')
                }
              >
                {tryOnCut ? '✓ Haircut Cut ON' : '+ Hairstyle Cut'}
              </button>
              <button
                onClick={stopCamera}
                className='min-h-10 rounded-full border border-plum/30 px-4 text-xs font-semibold hover:bg-plum hover:text-white transition'
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {status && <p className='mt-3 text-xs font-medium text-plum/70 animate-pulse'>{status}</p>}
      {error && <p role='alert' className='mt-3 text-sm font-semibold text-rose'>{error}</p>}

      {/* ── Camera Viewport & AI Guidance Grid ──────────────────────── */}
      <div className='mt-6 grid gap-6 md:grid-cols-12'>
        {/* Left: Camera Viewport (md:col-span-7) */}
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

          {/* Camera Off Placeholder */}
          {!active && (
            <div className='flex h-full w-full flex-col items-center justify-center p-6 text-center text-plum/60'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm'>
                <span className='text-2xl'>💇‍♀️</span>
              </div>
              <p className='mt-3 font-display text-lg font-semibold text-plum'>Camera is currently off</p>
              <p className='mt-1 max-w-sm text-xs text-plum/70'>
                Click "Start Live Hair Scan" above to scan your facial proportions and test personalized haircut & hair color recommendations live.
              </p>
            </div>
          )}

          {/* Live Detected Info Pill */}
          {active && faceShape && (
            <div className='absolute bottom-3 left-3 rounded-full bg-plum/85 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur shadow-sm'>
              Detected: {faceShape.shape} Face ({faceShape.ratio}) · {skinTone || 'Medium'} Tone
            </div>
          )}

          {/* Active Mode Tag */}
          {active && (
            <div className='absolute top-3 right-3 flex gap-1.5'>
              {recolorHair && (
                <span className='rounded-full bg-rose/90 px-3 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur'>
                  Color: {selectedColor}
                </span>
              )}
              {tryOnCut && (
                <span className='rounded-full bg-plum/90 px-3 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur'>
                  Cut: {selectedCut}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: AI Guidance & Controls Panel (md:col-span-5) */}
        <div className='flex flex-col justify-between rounded-2xl border border-plum/10 bg-page p-5 md:col-span-5'>
          <div>
            <h3 className='font-display text-base font-bold text-plum'>Facial Structure & Tone Diagnostics</h3>

            {/* Metric summary boxes */}
            <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
              <div className='rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/60 block text-[11px]'>Face Structure:</span>
                <span className='font-bold text-rose text-sm'>{faceShape?.shape || (active ? 'Analyzing...' : 'Ready to scan')}</span>
              </div>
              <div className='rounded-xl bg-white p-2.5 shadow-xs'>
                <span className='text-plum/60 block text-[11px]'>Complexion Tone:</span>
                <span className='font-bold text-plum text-sm'>{skinTone || (active ? 'Detecting...' : 'Ready to scan')}</span>
              </div>
            </div>

            {/* AI Haircut Recommendations for this Face Shape */}
            <div className='mt-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-display text-xs font-bold text-plum'>
                  AI Recommended Haircuts for {currentShapeKey}:
                </h4>
                <span className='text-[10px] font-bold text-rose bg-rose/10 px-2 py-0.5 rounded-full'>
                  Face Flattering
                </span>
              </div>
              <p className='text-[11px] text-plum/70 mt-1 leading-snug'>{shapeRec.advice}</p>

              {/* Hairstyle Selection Chips */}
              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                {HAIRSTYLE_OPTIONS.map((style) => {
                  const isRecommended = shapeRec.bestCuts.includes(style.name)
                  const isSelected = selectedCut === style.name

                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedCut(style.name)
                        setTryOnCut(true)
                      }}
                      className={
                        'rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ' +
                        (isSelected
                          ? 'bg-plum text-white shadow-xs'
                          : isRecommended
                          ? 'border-2 border-rose/60 bg-rose/5 text-rose hover:bg-rose/10'
                          : 'border border-plum/20 bg-white hover:border-plum text-plum/80')
                      }
                    >
                      {isRecommended && <span className='text-[10px]'>⭐</span>}
                      {style.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* AI Hair Color Recommendations for this Skin Tone */}
            <div className='mt-5'>
              <div className='flex items-center justify-between'>
                <h4 className='font-display text-xs font-bold text-plum'>
                  Recolor Real Hair ({currentToneKey} Tone):
                </h4>
                <span className='text-[10px] font-bold text-plum/60'>Natural Hair Tint</span>
              </div>
              <p className='text-[11px] text-plum/70 mt-1 leading-snug'>{colorRec.advice}</p>

              {/* Hair Color Swatches */}
              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                {Object.keys(HAIR_COLORS_RGB).map((cName) => {
                  const isRec = colorRec.bestColors.includes(cName)
                  const isSelected = selectedColor === cName

                  return (
                    <button
                      key={cName}
                      onClick={() => {
                        setSelectedColor(cName)
                        setRecolorHair(true)
                      }}
                      className={
                        'rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ' +
                        (isSelected
                          ? 'bg-rose text-white shadow-xs'
                          : isRec
                          ? 'border border-rose bg-white text-rose font-bold'
                          : 'border border-plum/20 bg-white hover:border-rose text-plum/80')
                      }
                    >
                      {isRec && <span className='text-[9px]'>✦</span>}
                      {cName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fine-Tuning Sliders (when Hairstyle Cut is active) */}
            {tryOnCut && (
              <div className='mt-4 rounded-xl bg-white p-3 border border-plum/10 text-xs'>
                <span className='font-bold text-plum block mb-2 text-[11px]'>Hairstyle Framing Adjustments:</span>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <span className='text-[10px] text-plum/60 block'>Hairline Position</span>
                    <input
                      type='range'
                      min='-40'
                      max='40'
                      value={hairHeight}
                      onChange={(e) => setHairHeight(parseInt(e.target.value))}
                      className='w-full accent-rose cursor-pointer'
                    />
                  </div>
                  <div>
                    <span className='text-[10px] text-plum/60 block'>Hair Volume</span>
                    <input
                      type='range'
                      min='0.80'
                      max='1.30'
                      step='0.01'
                      value={hairScale}
                      onChange={(e) => setHairScale(parseFloat(e.target.value))}
                      className='w-full accent-rose cursor-pointer'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Prescription Advice Card */}
          <div className='mt-4 rounded-xl border border-rose/20 bg-rose/5 p-3.5 text-xs'>
            <p className='font-bold text-rose'>💡 AI Facial Styling Prescription:</p>
            <p className='mt-1 text-plum/80 leading-relaxed text-[11px]'>
              {faceShape
                ? `${shapeRec.headline} — ${shapeRec.advice} Pro-tip: ${shapeRec.tip}`
                : 'Click "Start Live Hair Scan" to scan your face structure and unlock custom haircut & shade recommendations.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
