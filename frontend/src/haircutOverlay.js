/**
 * FaceWise Realistic Hair Try-On Engine v3.0
 *
 * Strategy:
 *  1. Hair segmentation mask (MediaPipe ImageSegmenter) se real hair detect karo
 *  2. Real hair region ko background color se blur-fill karo (erase effect)
 *  3. Hairstyle PNG ko face ke BEHIND draw karo using destination-over composite
 *     so face is ALWAYS on top, hair wraps around naturally
 *  4. Face oval area ko protect karo — hair never covers face
 */

const px = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h })
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

export const HAIR_COLORS_RGB = {
  Natural: null,
  Chocolate: [101, 55, 35],
  Honey: [180, 128, 55],
  Burgundy: [105, 22, 42],
  Copper: [168, 78, 38],
  'Ash brown': [105, 90, 80],
  Caramel: [162, 100, 48],
  Black: [20, 15, 18],
  Auburn: [130, 48, 28],
}

// ── Hairstyle asset config ──────────────────────────────────────────────────
// For each style: what PNG to use, and HOW to position it relative to the face.
// hairlineY: fraction of PNG height where the HAIRLINE (top of forehead) sits in the PNG
// widthMultiplier: how wide to draw PNG relative to user's face width
// heightMultiplier: how tall (controls scaling but we keep 1:1 PNG aspect)
// yNudge: shift up/down as fraction of faceH
const STYLE_CONFIG = {
  'Layered Bob': {
    src: '/hairstyles/layered_bob.png',
    hairlineY: 0.25,
    widthMultiplier: 2.9,
    yNudge: -0.05,
  },
  'Curtain Bangs': {
    src: '/hairstyles/curtain_bangs.png',
    hairlineY: 0.20,
    widthMultiplier: 3.1,
    yNudge: -0.08,
  },
  'Long Waves': {
    src: '/hairstyles/long_waves.png',
    hairlineY: 0.20,
    widthMultiplier: 2.5,
    yNudge: -0.06,
  },
  'Pixie Cut': {
    src: '/hairstyles/pixie_cut.png',
    hairlineY: 0.43,
    widthMultiplier: 2.5,
    yNudge: 0.02,
  },
  'Angled Lob': {
    src: '/hairstyles/layered_bob.png',
    hairlineY: 0.25,
    widthMultiplier: 2.95,
    yNudge: -0.04,
  },
  'Side-Swept Fringe': {
    src: '/hairstyles/curtain_bangs.png',
    hairlineY: 0.20,
    widthMultiplier: 3.05,
    yNudge: -0.07,
  },
  'Chin-Length Bob': {
    src: '/hairstyles/layered_bob.png',
    hairlineY: 0.25,
    widthMultiplier: 2.85,
    yNudge: -0.03,
  },
  'Soft Waves': {
    src: '/hairstyles/long_waves.png',
    hairlineY: 0.20,
    widthMultiplier: 2.55,
    yNudge: -0.05,
  },
}

// ── Image cache ─────────────────────────────────────────────────────────────
const imageCache = {}
const tintCache = {}

function getLoadedImage(src) {
  if (imageCache[src]?.complete && imageCache[src].naturalWidth > 0) {
    return imageCache[src]
  }
  if (!imageCache[src]) {
    const img = new Image()
    img.src = src
    img.onload = () => {
      imageCache[src] = img
    }
    imageCache[src] = img
  }
  return null
}

function getTintedCanvas(img, colorName) {
  const rgb = HAIR_COLORS_RGB[colorName]
  if (!rgb) return img // Natural: return original image

  const key = `${img.src}_${colorName}`
  if (tintCache[key]) return tintCache[key]

  const off = document.createElement('canvas')
  off.width = img.naturalWidth || img.width
  off.height = img.naturalHeight || img.height
  const octx = off.getContext('2d')

  // 1. Draw original hair photo
  octx.drawImage(img, 0, 0)

  // 2. Apply color tint using 'color' blend (keeps luminance, changes hue/sat)
  octx.globalCompositeOperation = 'color'
  octx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
  octx.fillRect(0, 0, off.width, off.height)

  // 3. Soft-light to preserve highlights/depth
  octx.globalCompositeOperation = 'soft-light'
  octx.fillStyle = `rgba(${Math.min(255, rgb[0] + 30)},${Math.min(255, rgb[1] + 30)},${Math.min(255, rgb[2] + 30)}, 0.45)`
  octx.fillRect(0, 0, off.width, off.height)

  // 4. CRITICAL: restore alpha from original image (keeps transparency intact)
  octx.globalCompositeOperation = 'destination-in'
  octx.drawImage(img, 0, 0)

  tintCache[key] = off
  return off
}

/**
 * Erase real hair using segmentation mask (class 1 = hair in MediaPipe selfie multiclass)
 */
export function eraseRealHair(ctx, maskData, maskW, maskH, canvasW, canvasH) {
  if (!ctx || !maskData) return

  // Sample corner background color
  try {
    const imgData = ctx.getImageData(0, 0, canvasW, canvasH)
    const d = imgData.data
    const corners = [
      [10, 10], [canvasW - 10, 10],
      [10, canvasH - 20], [canvasW - 10, canvasH - 20]
    ]
    let rSum = 0, gSum = 0, bSum = 0, count = 0
    for (const [cx, cy] of corners) {
      const idx = (Math.floor(cy) * canvasW + Math.floor(cx)) * 4
      if (idx >= 0 && idx + 2 < d.length) {
        rSum += d[idx]
        gSum += d[idx + 1]
        bSum += d[idx + 2]
        count++
      }
    }
    const bgR = count ? Math.round(rSum / count) : 180
    const bgG = count ? Math.round(gSum / count) : 175
    const bgB = count ? Math.round(bSum / count) : 170

    const hairCanvas = document.createElement('canvas')
    hairCanvas.width = canvasW
    hairCanvas.height = canvasH
    const hctx = hairCanvas.getContext('2d')

    const scaleX = canvasW / maskW
    const scaleY = canvasH / maskH
    const hairImgData = hctx.createImageData(canvasW, canvasH)
    const hd = hairImgData.data

    for (let my = 0; my < maskH; my++) {
      for (let mx = 0; mx < maskW; mx++) {
        const maskIdx = my * maskW + mx
        if (maskData[maskIdx] === 1) { // 1 = hair
          const cx1 = Math.floor(mx * scaleX)
          const cy1 = Math.floor(my * scaleY)
          const cx2 = Math.ceil((mx + 1) * scaleX)
          const cy2 = Math.ceil((my + 1) * scaleY)

          for (let cy = cy1; cy < cy2 && cy < canvasH; cy++) {
            for (let cx = cx1; cx < cx2 && cx < canvasW; cx++) {
              const pidx = (cy * canvasW + cx) * 4
              hd[pidx] = bgR
              hd[pidx + 1] = bgG
              hd[pidx + 2] = bgB
              hd[pidx + 3] = 210
            }
          }
        }
      }
    }
    hctx.putImageData(hairImgData, 0, 0)
    ctx.filter = 'blur(6px)'
    ctx.drawImage(hairCanvas, 0, 0)
    ctx.filter = 'none'
  } catch (err) {
    // If getImageData is restricted or fails, skip silently
  }
}

/**
 * Main drawHaircut — draws hairstyle PNG with face-oval protection.
 *
 * KEY TECHNIQUE: "Face Hole" approach
 * 1. Draw hair PNG to offscreen canvas
 * 2. Punch an elliptical hole exactly where the face is (destination-out)
 * 3. Composite onto main canvas => Hair appears around face, face always visible
 *
 * This perfectly mimics how YourFaceApp / YouCam style apps work.
 */
export function drawHaircut(ctx, lm, w, h, cutName, colorName = 'Natural', options = {}) {
  if (!ctx || !lm || !cutName) return

  const cfg = STYLE_CONFIG[cutName] || STYLE_CONFIG['Layered Bob']

  // ── Facial landmark positions ──────────────────────────────────────────
  const topHead    = px(lm, 10,  w, h)   // Top of forehead/hairline
  const chin       = px(lm, 152, w, h)   // Chin bottom
  const leftCheek  = px(lm, 234, w, h)   // Left cheek outer
  const rightCheek = px(lm, 454, w, h)   // Right cheek outer
  const forehead   = px(lm, 151, w, h)   // Glabella / forehead
  const noseBridge = px(lm, 168, w, h)   // Midpoint between eyes
  const noseTip    = px(lm, 1,   w, h)   // Nose tip

  const faceW = dist(leftCheek, rightCheek)
  const faceH = dist(topHead, chin)

  // Natural face center (mid-eye to nose bridge)
  const faceCX = (leftCheek.x + rightCheek.x) / 2
  const faceCY = noseBridge.y * 0.4 + noseTip.y * 0.3 + ((topHead.y + chin.y) / 2) * 0.3

  // Head tilt angle
  const angle = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x)

  // ── Hairline position (where PNG's hairline aligns) ──────────────────
  const hairlineY = topHead.y + cfg.yNudge * faceH + (options.nudgeY || 0)
  const hairlineX = (topHead.x * 0.55 + forehead.x * 0.45)

  // ── PNG sizing ─────────────────────────────────────────────────────────
  const userScale = options.scaleMultiplier || 1.0
  const targetW = faceW * cfg.widthMultiplier * userScale
  const targetH = targetW // keep 1:1 aspect ratio of 1024x1024 PNG

  // ── Face ellipse radii for protecting facial features ────────────────
  // Horizontal protection: cheeks + eyes
  const ellRX = faceW * 0.50
  // Vertical protection: from just above eyebrows down to chin
  const ellRY = faceH * 0.50

  // ── Load image ─────────────────────────────────────────────────────────
  const baseImg = getLoadedImage(cfg.src)
  if (!baseImg) return // Still loading

  const hairSource = getTintedCanvas(baseImg, colorName)

  // ── Build offscreen canvas: hair PNG with face hole punched out ────────
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')

  // Step 1: Draw the hairstyle PNG, positioned by hairline anchor
  octx.save()
  octx.translate(hairlineX, hairlineY)
  octx.rotate(angle)

  // PNG is drawn so its hairlineY fraction aligns with user's hairline
  const drawX = -targetW * 0.50  // centered on face horizontally
  const drawY = -targetH * cfg.hairlineY  // hairline of PNG at origin

  octx.drawImage(hairSource, drawX, drawY, targetW, targetH)
  octx.restore()

  // Step 2: Punch face ellipse hole — erase hair where face will show
  octx.save()
  // Move to face center, rotated with head tilt
  octx.translate(faceCX, faceCY)
  octx.rotate(angle)
  octx.scale(1, ellRY / ellRX) // make circle into ellipse by scaling Y

  // Feathered gradient eraser: full erase inside, soft edge at boundary
  octx.globalCompositeOperation = 'destination-out'
  const grad = octx.createRadialGradient(0, 0, ellRX * 0.62, 0, 0, ellRX)
  grad.addColorStop(0,    'rgba(0,0,0,1)')     // hard erase center
  grad.addColorStop(0.78, 'rgba(0,0,0,0.97)')  // still erasing
  grad.addColorStop(0.90, 'rgba(0,0,0,0.75)')  // softening
  grad.addColorStop(1,    'rgba(0,0,0,0)')      // transparent edge (hair blends in)

  octx.beginPath()
  octx.arc(0, 0, ellRX, 0, Math.PI * 2)
  octx.fillStyle = grad
  octx.fill()
  octx.restore()

  // Step 3: Composite hair-with-hole onto main canvas
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 0.95
  ctx.drawImage(off, 0, 0)
  ctx.restore()
}
