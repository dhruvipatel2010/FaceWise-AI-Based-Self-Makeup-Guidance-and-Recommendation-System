import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, ImageSegmenter, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { suggestionsFor } from '../suggestions'
import { drawMakeup, sampleTone } from '../makeupOverlay'

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
}

const chip = (active) =>
  'min-h-10 rounded-full border-2 px-5 text-sm font-semibold ' +
  (active ? 'border-rose bg-rose text-white' : 'border-plum/30 hover:border-rose')

export default function Scan() {
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
  const lookRef = useRef(false)
  const hairRef = useRef(null)
  const shapeRef = useRef('Oval')
  const toneRef = useRef('Medium')
  const [on, setOn] = useState(false)
  const [look, setLook] = useState(false)
  const [hairName, setHairName] = useState('Natural')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [shape, setShape] = useState(null)
  const [tone, setTone] = useState('')

  async function loadModel() {
    if (landmarkerRef.current) return
    setStatus('Loading face model...')
    filesetRef.current = await FilesetResolver.forVisionTasks(WASM_URL)
    landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetRef.current, {
      baseOptions: { modelAssetPath: FACE_MODEL },
      runningMode: 'VIDEO',
      numFaces: 1,
    })
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
    ctx.globalAlpha = 0.7
    ctx.drawImage(mask, 0, 0, w, h)
    ctx.globalCompositeOperation = 'soft-light'
    ctx.globalAlpha = 0.45
    ctx.drawImage(mask, 0, 0, w, h)
    ctx.restore()
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
      const hasFace = result.faceLandmarks && result.faceLandmarks.length > 0

      if (hasFace) {
        const lm = result.faceLandmarks[0]
        const now = performance.now()
        if (now - lastShapeAt.current > 500) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          shapeRef.current = s.shape
          toneRef.current = sampleTone(ctx, lm, w, h)
          setShape(s)
          setTone(toneRef.current)
        }
        if (hairRef.current && segmenterRef.current) {
          frameRef.current++
          if (frameRef.current % 2 === 0) {
            segmenterRef.current.segmentForVideo(video, performance.now(), updateMask)
          }
          paintHair(ctx, w, h)
        }
        if (lookRef.current) {
          drawMakeup(ctx, lm, w, h, shapeRef.current, toneRef.current)
        } else if (!hairRef.current) {
          const drawing = new DrawingUtils(ctx)
          drawing.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0457B', lineWidth: 3 })
          drawing.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#E0457B33', lineWidth: 1 })
        }
        setStatus('Face detected')
      } else {
        setStatus('No face found. Face the camera in good light.')
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  async function start() {
    setError('')
    try {
      await loadModel()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setOn(true)
      setError('')
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      console.error(err)
      setStatus('')
      setError('Could not start. Allow camera permission, close other apps using the camera, and check your internet (the face model downloads once).')
    }
  }

  function stop() {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setStatus('')
    setOn(false)
  }

  function toggleLook() {
    lookRef.current = !lookRef.current
    setLook(lookRef.current)
  }

  async function pickHair(name) {
    setHairName(name)
    hairRef.current = HAIR_COLORS[name]
    if (!HAIR_COLORS[name]) {
      hairMaskRef.current = null
      return
    }
    if (!segmenterRef.current) {
      try {
        setStatus('Loading hair model...')
        segmenterRef.current = await ImageSegmenter.createFromOptions(filesetRef.current, {
          baseOptions: { modelAssetPath: HAIR_MODEL },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        })
      } catch (err) {
        console.error(err)
        hairRef.current = null
        setHairName('Natural')
        setError('Hair model could not load. Check your internet and try again.')
      }
    }
  }

  useEffect(() => {
    return () => {
      stop()
      if (landmarkerRef.current) {
        landmarkerRef.current.close()
        landmarkerRef.current = null
      }
      if (segmenterRef.current) {
        segmenterRef.current.close()
        segmenterRef.current = null
      }
    }
  }, [])

  return (
    <main className='mx-auto max-w-3xl px-6 py-10 md:px-12'>
      <h1 className='font-display text-4xl'>Live face scan</h1>
      <p className='mt-2 text-plum/70'>
        Your camera video stays in your browser. Nothing is uploaded or saved.
      </p>

      <div className='relative mt-6 overflow-hidden rounded-3xl border border-plum/10 bg-lilac'>
        <video ref={videoRef} playsInline muted className='aspect-video w-full -scale-x-100 object-cover' />
        <canvas ref={canvasRef} className='pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover' />
      </div>

      {status && <p role='status' className='mt-4 text-plum/70'>{status}</p>}
      {shape && on && (
        <>
          <p className='mt-2 font-display text-2xl'>
            Face shape: {shape.shape} <span className='text-sm text-plum/60'>(ratio {shape.ratio})</span>
          </p>
          <p className='text-sm text-plum/60'>Skin tone estimate: {tone} (depends on lighting)</p>
        </>
      )}
      {error && <p role='alert' className='mt-4 font-semibold text-rose'>{error}</p>}

      <div className='mt-6 flex flex-wrap gap-3'>
        {!on ? (
          <button onClick={start} className='min-h-12 rounded-full bg-rose px-8 font-semibold text-white hover:opacity-90'>
            Start camera
          </button>
        ) : (
          <>
            <button onClick={stop} className='min-h-12 rounded-full border-2 border-plum px-8 font-semibold hover:bg-plum hover:text-white'>
              Stop camera
            </button>
            <button onClick={toggleLook} className='min-h-12 rounded-full bg-rose px-8 font-semibold text-white hover:opacity-90'>
              {look ? 'Hide makeup look' : 'Try makeup look'}
            </button>
          </>
        )}
      </div>

      {on && (
        <section className='mt-6 rounded-3xl border border-plum/10 bg-white p-6'>
          <h3 className='font-semibold'>Try a hair color</h3>
          <div className='mt-3 flex flex-wrap gap-2'>
            {Object.keys(HAIR_COLORS).map((name) => (
              <button key={name} onClick={() => pickHair(name)} className={chip(hairName === name)}>
                {name}
              </button>
            ))}
          </div>
          <p className='mt-3 text-xs text-plum/60'>
            The color is applied on your real hair. Haircut shapes cannot be previewed yet, see the suggestions below.
          </p>
        </section>
      )}

      {shape && on && (
        <section className='mt-6 rounded-3xl border border-plum/10 bg-white p-6'>
          {[['Haircuts', 'haircuts'], ['Makeup', 'makeup'], ['Hair color', 'color']].map(([title, key]) => (
            <div key={key} className='mt-4 first:mt-0'>
              <h3 className='font-semibold'>{title}</h3>
              <ul className='mt-1 list-disc pl-5 text-sm text-plum/80'>
                {suggestionsFor(shape.shape)[key].map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
