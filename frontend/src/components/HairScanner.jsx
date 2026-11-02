import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { drawHaircut, eraseRealHair } from '../haircutOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const SEG_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'

// ── Female hairstyles ────────────────────────────────────────────────────────
const HAIRSTYLES_FEMALE = [
  {
    id: 'none',
    name: 'Original',
    isNone: true,
    color: 'Natural',
    cutStyle: null,
  },
  {
    id: 'long-wavy',
    name: 'Long Wavy',
    color: 'Honey',
    cutStyle: 'Long Waves',
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
    desc: 'Voluminous cascading waves past shoulders',
  },
  {
    id: 'long-straight',
    name: 'Long Straight',
    color: 'Chocolate',
    cutStyle: 'Soft Waves',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    desc: 'Sleek silky straight hair',
  },
  {
    id: 'bobcut',
    name: 'Bobcut',
    color: 'Honey',
    cutStyle: 'Layered Bob',
    img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=200&q=80',
    desc: 'Classic rounded bobcut',
  },
  {
    id: 'curtain-red',
    name: 'Curtain Wavy',
    color: 'Copper',
    cutStyle: 'Curtain Bangs',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    desc: 'Curtain bangs with wavy layers',
  },
  {
    id: 'pixie-pink',
    name: 'Pixie Cut',
    color: 'Burgundy',
    cutStyle: 'Pixie Cut',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    desc: 'Chic textured pixie cut',
  },
  {
    id: 'angled-lob',
    name: 'Angled Lob',
    color: 'Caramel',
    cutStyle: 'Angled Lob',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    desc: 'Shoulder-length angled lob',
  },
]

// ── Male hairstyles ──────────────────────────────────────────────────────────
const HAIRSTYLES_MALE = [
  {
    id: 'none',
    name: 'Original',
    isNone: true,
    color: 'Natural',
    cutStyle: null,
  },
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    color: 'Natural',
    cutStyle: 'Pixie Cut',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    desc: 'Modern textured crop fade',
  },
  {
    id: 'pompadour',
    name: 'Pompadour',
    color: 'Chocolate',
    cutStyle: 'Long Waves',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    desc: 'High-volume swept back',
  },
  {
    id: 'wavy-quiff',
    name: 'Wavy Quiff',
    color: 'Caramel',
    cutStyle: 'Curtain Bangs',
    img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    desc: 'Natural flow quiff',
  },
  {
    id: 'side-part',
    name: 'Side Part',
    color: 'Auburn',
    cutStyle: 'Layered Bob',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    desc: 'Classic side part slick',
  },
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
  const segMaskRef = useRef(null) // last segmentation mask

  const [gender, setGender] = useState('FEMALE')
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [faceShape, setFaceShape] = useState(null)
  const [eraseHair, setEraseHair] = useState(true)

  const [selectedStyle, setSelectedStyle] = useState(HAIRSTYLES_FEMALE[3])
  const [hairScale, setHairScale] = useState(1.0)
  const [hairHeight, setHairHeight] = useState(0)
  const [capturedPhoto, setCapturedPhoto] = useState(null)

  const activeCutRef = useRef(HAIRSTYLES_FEMALE[3].cutStyle)
  const hairColorRef = useRef(HAIRSTYLES_FEMALE[3].color)
  const fitOptionsRef = useRef({ scaleMultiplier: 1.0, nudgeY: 0 })
  const eraseHairRef = useRef(true)

  useEffect(() => {
    activeCutRef.current = selectedStyle.cutStyle
    hairColorRef.current = selectedStyle.color
  }, [selectedStyle])

  useEffect(() => {
    fitOptionsRef.current = { scaleMultiplier: hairScale, nudgeY: hairHeight }
  }, [hairScale, hairHeight])

  useEffect(() => {
    eraseHairRef.current = eraseHair
  }, [eraseHair])

  const currentStyles = gender === 'FEMALE' ? HAIRSTYLES_FEMALE : HAIRSTYLES_MALE

  function selectHairstyle(item) {
    setSelectedStyle(item)
    activeCutRef.current = item.cutStyle
    hairColorRef.current = item.color
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCapturedPhoto(ev.target.result)
      stopCamera()
    }
    reader.readAsDataURL(file)
  }

  async function startCamera() {
    setError('')
    setLoading(true)
    setStatus('Loading AI vision models...')
    setCapturedPhoto(null)

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
      // Load segmenter for hair erasure (optional — gracefully skip if fails)
      if (!segmenterRef.current) {
        setStatus('Loading hair segmentation model...')
        try {
          segmenterRef.current = await ImageSegmenter.createFromOptions(filesetRef.current, {
            baseOptions: { modelAssetPath: SEG_MODEL },
            runningMode: 'VIDEO',
            outputCategoryMask: true,
            outputConfidenceMasks: false,
          })
        } catch (segErr) {
          console.warn('Hair segmenter load failed (optional):', segErr)
          segmenterRef.current = null
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
      setError('Camera access denied. Please allow camera permissions.')
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

      // Draw raw video feed
      ctx.drawImage(video, 0, 0, w, h)

      // Run segmentation every ~200ms to reduce load
      const seg = segmenterRef.current
      if (seg && eraseHairRef.current && activeCutRef.current && now - lastSegAt.current > 180) {
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
          // Silently ignore segmentation errors
        }
      }

      // Erase real hair using last good mask
      if (segMaskRef.current && eraseHairRef.current && activeCutRef.current) {
        const { data, width, height } = segMaskRef.current
        eraseRealHair(ctx, data, width, height, w, h)
      }

      // Detect face landmarks
      const result = landmarker.detectForVideo(video, now)
      if (result.faceLandmarks?.length > 0) {
        const lm = result.faceLandmarks[0]

        if (now - lastShapeAt.current > 400) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          setFaceShape(s)
          if (onFaceShapeDetected) onFaceShapeDetected(s)
        }

        // Draw hairstyle with face-hole protection
        if (activeCutRef.current) {
          drawHaircut(ctx, lm, w, h, activeCutRef.current, hairColorRef.current, fitOptionsRef.current)
        }
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className='mx-auto max-w-lg overflow-hidden rounded-[36px] border border-plum/10 bg-white p-6 shadow-2xl'>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className='flex items-center justify-between border-b border-plum/10 pb-4'>
        <button
          onClick={stopCamera}
          className='text-xs font-semibold text-plum/60 hover:text-plum transition'
        >
          {active ? 'Close' : 'FaceWise'}
        </button>
        <h2 className='font-display text-2xl font-bold tracking-tight text-plum'>Hairstyle</h2>
        <label className='cursor-pointer rounded-full bg-lilac/70 px-3 py-1 text-xs font-bold text-plum hover:bg-lilac transition'>
          Upload 📁
          <input type='file' accept='image/*' onChange={handlePhotoUpload} className='hidden' />
        </label>
      </div>

      {status && (
        <p className='mt-2 text-center text-xs font-medium text-plum/70 animate-pulse'>{status}</p>
      )}
      {error && (
        <p role='alert' className='mt-2 text-center text-xs font-semibold text-rose'>{error}</p>
      )}

      {/* ── Portrait Camera Viewport ────────────────────────────────── */}
      <div className='relative mt-4 aspect-3/4 w-full overflow-hidden rounded-3xl bg-slate-900 shadow-inner'>
        {capturedPhoto ? (
          <img src={capturedPhoto} alt='Hairstyle Try-On' className='h-full w-full object-cover' />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={'h-full w-full -scale-x-100 object-cover ' + (!active ? 'hidden' : 'block')}
            />
            <canvas
              ref={canvasRef}
              className={
                'pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover ' +
                (!active ? 'hidden' : 'block')
              }
            />
          </>
        )}

        {/* Camera Off Placeholder */}
        {!active && !capturedPhoto && (
          <div className='flex h-full w-full flex-col items-center justify-center p-8 text-center text-white'>
            <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20'>
              <span className='text-3xl'>💇‍♀️</span>
            </div>
            <h3 className='mt-4 font-display text-xl font-bold text-white'>Live Hair Studio</h3>
            <p className='mt-1 max-w-xs text-xs text-white/60 leading-relaxed'>
              Open camera to try hairstyles live on your face, or upload a portrait photo.
            </p>
            <div className='mt-6 flex gap-3'>
              <button
                onClick={startCamera}
                disabled={loading}
                className='rounded-full bg-rose px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose/95 disabled:opacity-50 transition'
              >
                {loading ? 'Starting...' : '📸 Open Camera'}
              </button>
            </div>
          </div>
        )}

        {/* Face Shape + Style Pill */}
        {active && faceShape && (
          <div className='absolute top-4 left-4 rounded-full bg-plum/85 px-3.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10 shadow-sm'>
            {faceShape.shape} · {selectedStyle.name}
          </div>
        )}

        {/* Erase Hair Toggle */}
        {active && activeCutRef.current && segmenterRef.current && (
          <button
            onClick={() => setEraseHair((v) => !v)}
            className={
              'absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-bold shadow backdrop-blur-md border transition ' +
              (eraseHair
                ? 'bg-rose/90 text-white border-rose/40'
                : 'bg-white/80 text-plum border-white/40')
            }
          >
            {eraseHair ? '✂ Hair Erased' : '✂ Erase Off'}
          </button>
        )}

        {capturedPhoto && (
          <button
            onClick={() => { setCapturedPhoto(null); startCamera() }}
            className='absolute bottom-4 right-4 rounded-full bg-plum/90 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-md'
          >
            Switch to Camera
          </button>
        )}
      </div>

      {/* ── Gender Switch ───────────────────────────────────────────── */}
      <div className='mt-6 flex items-center justify-center gap-8 border-b border-plum/10 pb-3'>
        {['FEMALE', 'MALE'].map((g) => (
          <button
            key={g}
            onClick={() => {
              setGender(g)
              const list = g === 'FEMALE' ? HAIRSTYLES_FEMALE : HAIRSTYLES_MALE
              setSelectedStyle(list[1])
            }}
            className={
              'relative pb-2 text-xs font-extrabold tracking-wider transition-all ' +
              (gender === g ? 'text-rose' : 'text-plum/40 hover:text-plum')
            }
          >
            {g}
            {gender === g && (
              <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-rose' />
            )}
          </button>
        ))}
      </div>

      {/* ── Hairstyle Thumbnail Carousel ────────────────────────────── */}
      <div className='mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none'>
        {currentStyles.map((item) => {
          const isSelected = selectedStyle.id === item.id
          return (
            <div
              key={item.id}
              onClick={() => selectHairstyle(item)}
              className='flex flex-col items-center shrink-0 cursor-pointer'
              style={{ width: 80 }}
            >
              <div
                className={
                  'relative aspect-3/4 w-full overflow-hidden rounded-2xl border-2 transition-all duration-200 ' +
                  (isSelected
                    ? 'border-rose ring-2 ring-rose/40 shadow-lg scale-[1.04]'
                    : 'border-plum/15 bg-white hover:border-rose/50')
                }
              >
                {item.isNone ? (
                  <div className='flex h-full w-full items-center justify-center bg-page text-plum/40'>
                    <span className='text-2xl'>⊘</span>
                  </div>
                ) : (
                  <img
                    src={item.img}
                    alt={item.name}
                    className='h-full w-full object-cover'
                    loading='lazy'
                  />
                )}
                {isSelected && !item.isNone && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white border border-white/50 shadow-md'>
                      <span className='text-xs'>🔄</span>
                    </div>
                  </div>
                )}
              </div>
              <span
                className={
                  'mt-1.5 text-center text-[10px] font-bold transition-colors line-clamp-1 ' +
                  (isSelected ? 'text-rose' : 'text-plum/80')
                }
              >
                {item.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Fit Sliders ─────────────────────────────────────────────── */}
      {active && !selectedStyle.isNone && (
        <div className='mt-4 flex items-center justify-between gap-4 rounded-2xl bg-page p-3 text-xs'>
          <div className='flex-1'>
            <span className='text-[10px] font-bold text-plum/70 block'>Hairline Position</span>
            <input
              type='range'
              min='-40'
              max='40'
              value={hairHeight}
              onChange={(e) => setHairHeight(parseInt(e.target.value))}
              className='w-full accent-rose cursor-pointer'
            />
          </div>
          <div className='flex-1'>
            <span className='text-[10px] font-bold text-plum/70 block'>Hair Volume</span>
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
          <button
            onClick={() => { setHairScale(1.0); setHairHeight(0) }}
            className='text-[10px] font-bold text-rose hover:underline self-end pb-1'
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
