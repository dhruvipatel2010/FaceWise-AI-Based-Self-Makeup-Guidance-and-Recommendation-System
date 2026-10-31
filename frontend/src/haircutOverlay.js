/**
 * Photorealistic Haircut Virtual Try-On Engine
 * Uses calibrated transparent photographic hairstyle assets with dynamic landmark-anchored head tracking,
 * tilt angle rotation, scale compensation, and dynamic color tinting.
 */

const px = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h })
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const HAIR_COLORS_RGB = {
  Natural: null,
  Chocolate: [107, 65, 48],
  Honey: [184, 134, 63],
  Burgundy: [110, 28, 48],
  Copper: [170, 85, 45],
  'Ash brown': [110, 95, 85],
  Caramel: [165, 105, 55],
}

// Calibrated geometry for 1024x1024 transparent PNG hair assets
// scaleW = 1024 / faceOpeningWidth so the face aperture precisely frames the user's face
const STYLE_CONFIG = {
  'Layered Bob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.503,
    anchorY: 0.254,
    scaleW: 2.84,
    scaleH: 2.84,
    yOffset: 0.02, // slight nudge relative to face height
  },
  'Curtain Bangs': {
    src: '/hairstyles/curtain_bangs.png',
    anchorX: 0.500,
    anchorY: 0.195,
    scaleW: 3.10,
    scaleH: 3.10,
    yOffset: -0.02,
  },
  'Long Waves': {
    src: '/hairstyles/long_waves.png',
    anchorX: 0.500,
    anchorY: 0.195,
    scaleW: 2.42,
    scaleH: 2.42,
    yOffset: -0.01,
  },
  'Pixie Cut': {
    src: '/hairstyles/pixie_cut.png',
    anchorX: 0.500,
    anchorY: 0.435,
    scaleW: 2.42,
    scaleH: 2.42,
    yOffset: 0.05,
  },
  'Angled Lob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.503,
    anchorY: 0.254,
    scaleW: 2.90,
    scaleH: 2.90,
    yOffset: 0.02,
  },
  'Side-Swept Fringe': {
    src: '/hairstyles/curtain_bangs.png',
    anchorX: 0.500,
    anchorY: 0.195,
    scaleW: 3.05,
    scaleH: 3.05,
    yOffset: -0.01,
  },
  'Chin-Length Bob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.503,
    anchorY: 0.254,
    scaleW: 2.80,
    scaleH: 2.80,
    yOffset: 0.03,
  },
  'Soft Waves': {
    src: '/hairstyles/long_waves.png',
    anchorX: 0.500,
    anchorY: 0.195,
    scaleW: 2.45,
    scaleH: 2.45,
    yOffset: -0.01,
  },
}

// In-memory image & tinted cache
const imageCache = {}
const tintCache = {}

function getLoadedImage(src) {
  if (!imageCache[src]) {
    const img = new Image()
    img.src = src
    img.onload = () => {
      imageCache[src] = img
    }
    return null
  }
  return imageCache[src].complete ? imageCache[src] : null
}

function getTintedImage(img, src, colorName) {
  const rgb = HAIR_COLORS_RGB[colorName]
  if (!rgb) return img // Natural original hair color

  const key = `${src}_${colorName}`
  if (tintCache[key]) return tintCache[key]

  const off = document.createElement('canvas')
  off.width = img.width
  off.height = img.height
  const octx = off.getContext('2d')

  // Draw base photo hair image
  octx.drawImage(img, 0, 0)

  // Blend color tone onto hair strands
  octx.globalCompositeOperation = 'color'
  octx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  octx.fillRect(0, 0, off.width, off.height)

  // Add subtle soft highlight to preserve silk sheen
  octx.globalCompositeOperation = 'soft-light'
  octx.fillStyle = `rgb(${Math.min(255, rgb[0] + 40)}, ${Math.min(255, rgb[1] + 40)}, ${Math.min(255, rgb[2] + 40)})`
  octx.fillRect(0, 0, off.width, off.height)

  // Retain alpha transparency mask
  octx.globalCompositeOperation = 'destination-in'
  octx.drawImage(img, 0, 0)

  tintCache[key] = off
  return off
}

/**
 * Main drawHaircut function
 */
export function drawHaircut(ctx, lm, w, h, cutName, colorName = 'Chocolate', options = {}) {
  if (!ctx || !lm || !cutName) return

  const cfg = STYLE_CONFIG[cutName] || STYLE_CONFIG['Layered Bob']
  const top = px(lm, 10, w, h)
  const chin = px(lm, 152, w, h)
  const leftCheek = px(lm, 234, w, h)
  const rightCheek = px(lm, 454, w, h)
  const foreheadCenter = px(lm, 151, w, h)

  const faceW = dist(leftCheek, rightCheek)
  const faceH = dist(top, chin)
  const angle = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x)

  // Hairline anchor position: top of forehead
  const userNudgeY = options.nudgeY || 0 // from user slider
  const userScale = options.scaleMultiplier || 1.0 // from user slider

  const anchorX = (top.x * 0.7 + foreheadCenter.x * 0.3)
  const anchorY = top.y + (cfg.yOffset * faceH) + userNudgeY

  const targetW = faceW * cfg.scaleW * userScale
  const targetH = targetW // Keep 1:1 aspect ratio of high-res 1024x1024 asset!

  // Check if photographic transparent PNG is loaded
  const baseImg = getLoadedImage(cfg.src)

  ctx.save()
  ctx.globalAlpha = options.opacity || 0.96
  ctx.translate(anchorX, anchorY)
  ctx.rotate(angle)

  if (baseImg) {
    const hairImage = getTintedImage(baseImg, cfg.src, colorName)
    ctx.drawImage(
      hairImage,
      -targetW * cfg.anchorX,
      -targetH * cfg.anchorY,
      targetW,
      targetH
    )
  }

  ctx.restore()
}
