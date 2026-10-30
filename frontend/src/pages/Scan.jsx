import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { getFaceShape } from '../faceShape'
import { suggestionsFor } from '../suggestions'
import { drawMakeup } from '../makeupOverlay'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export default function Scan() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const rafRef = useRef(0)
  const lastShapeAt = useRef(0)
  const lookRef = useRef(false)
  const shapeRef = useRef('Oval')
  const [on, setOn] = useState(false)
  const [look, setLook] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [shape, setShape] = useState(null)

  async function loadModel() {
    if (landmarkerRef.current) return landmarkerRef.current
    setStatus('Loading face model...')
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
    landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: 'VIDEO',
      numFaces: 1,
    })
    return landmarkerRef.current
  }

  function loop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker) return
    if (video.readyState >= 2) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const result = landmarker.detectForVideo(video, performance.now())
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const lm = result.faceLandmarks[0]
        if (lookRef.current) {
          drawMakeup(ctx, lm, canvas.width, canvas.height, shapeRef.current)
        } else {
          const drawing = new DrawingUtils(ctx)
          drawing.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0457B', lineWidth: 3 })
          drawing.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#E0457B33', lineWidth: 1 })
        }
        setStatus('Face detected')
        const now = performance.now()
        if (now - lastShapeAt.current > 500) {
          lastShapeAt.current = now
          const s = getFaceShape(lm)
          shapeRef.current = s.shape
          setShape(s)
        }
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

  useEffect(() => {
    return () => {
      stop()
      if (landmarkerRef.current) {
        landmarkerRef.current.close()
        landmarkerRef.current = null
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
        <p className='mt-2 font-display text-2xl'>
          Face shape: {shape.shape} <span className='text-sm text-plum/60'>(ratio {shape.ratio})</span>
        </p>
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
