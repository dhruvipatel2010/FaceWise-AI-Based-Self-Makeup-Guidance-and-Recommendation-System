/**
 * Photorealistic Haircut Virtual Try-On Engine
 * Uses photographic hairstyle assets with dynamic landmark-anchored head tracking,
 * real-time tilt angle rotation, scale compensation, and dynamic color tinting.
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

// Hairstyle configuration & image cache
const STYLE_CONFIG = {
  'Layered Bob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.50,
    anchorY: 0.20,
    scaleW: 2.30,
    scaleH: 1.55,
  },
  'Curtain Bangs': {
    src: '/hairstyles/curtain_bangs.png',
    anchorX: 0.50,
    anchorY: 0.18,
    scaleW: 2.35,
    scaleH: 1.65,
  },
  'Long Waves': {
    src: '/hairstyles/long_waves.png',
    anchorX: 0.50,
    anchorY: 0.16,
    scaleW: 2.45,
    scaleH: 2.15,
  },
  'Pixie Cut': {
    src: '/hairstyles/pixie_cut.png',
    anchorX: 0.50,
    anchorY: 0.25,
    scaleW: 2.10,
    scaleH: 1.35,
  },
  'Angled Lob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.50,
    anchorY: 0.20,
    scaleW: 2.35,
    scaleH: 1.68,
  },
  'Side-Swept Fringe': {
    src: '/hairstyles/curtain_bangs.png',
    anchorX: 0.50,
    anchorY: 0.19,
    scaleW: 2.30,
    scaleH: 1.60,
  },
  'Chin-Length Bob': {
    src: '/hairstyles/layered_bob.png',
    anchorX: 0.50,
    anchorY: 0.22,
    scaleW: 2.25,
    scaleH: 1.50,
  },
  'Soft Waves': {
    src: '/hairstyles/long_waves.png',
    anchorX: 0.50,
    anchorY: 0.16,
    scaleW: 2.45,
    scaleH: 2.10,
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
    // Return null while loading
    return null
  }
  return imageCache[src].complete ? imageCache[src] : null
}

function getTintedImage(img, src, colorName) {
  const rgb = HAIR_COLORS_RGB[colorName]
  if (!rgb) return img // Natural

  const key = `${src}_${colorName}`
  if (tintCache[key]) return tintCache[key]

  const off = document.createElement('canvas')
  off.width = img.width
  off.height = img.height
  const octx = off.getContext('2d')

  // Draw base hair image
  octx.drawImage(img, 0, 0)

  // Blend color tone
  octx.globalCompositeOperation = 'color'
  octx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  octx.fillRect(0, 0, off.width, off.height)

  // Add soft luster highlight
  octx.globalCompositeOperation = 'soft-light'
  octx.fillStyle = `rgb(${Math.min(255, rgb[0] + 50)}, ${Math.min(255, rgb[1] + 50)}, ${Math.min(255, rgb[2] + 50)})`
  octx.fillRect(0, 0, off.width, off.height)

  // Keep original transparency mask
  octx.globalCompositeOperation = 'destination-in'
  octx.drawImage(img, 0, 0)

  tintCache[key] = off
  return off
}

/**
 * Main drawHaircut function
 */
export function drawHaircut(ctx, lm, w, h, cutName, colorName = 'Chocolate', opacity = 0.95) {
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

  // Head anchor position: top of forehead / hairline
  const anchorPos = {
    x: (top.x * 0.7 + foreheadCenter.x * 0.3),
    y: top.y,
  }

  const targetW = faceW * cfg.scaleW
  const targetH = faceH * cfg.scaleH

  // Check if photographic transparent PNG is loaded
  const baseImg = getLoadedImage(cfg.src)

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.translate(anchorPos.x, anchorPos.y)
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
  } else {
    // If photographic image is still downloading or fallback:
    // Render realistic procedural hair strands with natural texture (NEVER flat cartoon curves!)
    renderRealisticStrandHair(ctx, targetW, targetH, cfg, colorName)
  }

  ctx.restore()
}

/**
 * Realistic procedural multi-strand hair synthesis fallback
 * Draws feathered, dimensional hair strands with organic flow and specular highlights
 */
function renderRealisticStrandHair(ctx, w, h, cfg, colorName) {
  const rgb = HAIR_COLORS_RGB[colorName] || [95, 55, 38]
  const baseColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  const darkColor = `rgb(${Math.max(0, rgb[0] - 40)}, ${Math.max(0, rgb[1] - 30)}, ${Math.max(0, rgb[2] - 25)})`
  const lightColor = `rgb(${Math.min(255, rgb[0] + 60)}, ${Math.min(255, rgb[1] + 50)}, ${Math.min(255, rgb[2] + 40)})`

  // 1. Soft volumetric shadow base behind head
  ctx.save()
  ctx.filter = 'blur(12px)'
  ctx.fillStyle = darkColor
  ctx.beginPath()
  ctx.ellipse(0, h * 0.2, w * 0.44, h * 0.40, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 2. Realistic multi-layered hair flow strands
  const strandsCount = 180
  ctx.lineCap = 'round'

  for (let i = 0; i < strandsCount; i++) {
    const t = (i / strandsCount) - 0.5 // -0.5 to 0.5 across head
    const startX = t * (w * 0.65)
    const startY = -h * 0.15 + Math.abs(t) * 18

    // Flattering natural curve
    const cp1X = startX * 1.35
    const cp1Y = h * 0.25
    const endX = startX * (1.1 + Math.sin(i * 0.3) * 0.15)
    const endY = h * (0.65 + Math.cos(i * 0.4) * 0.12)

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(cp1X, cp1Y, cp1X * 0.95, cp1Y + 30, endX, endY)

    // Strand color variations (depth + highlights)
    if (i % 7 === 0) {
      ctx.strokeStyle = lightColor
      ctx.lineWidth = 1.8
      ctx.globalAlpha = 0.65
    } else if (i % 3 === 0) {
      ctx.strokeStyle = darkColor
      ctx.lineWidth = 2.2
      ctx.globalAlpha = 0.75
    } else {
      ctx.strokeStyle = baseColor
      ctx.lineWidth = 2.0
      ctx.globalAlpha = 0.85
    }

    ctx.stroke()
  }

  // 3. Silky crown sheen (specular lighting)
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  const sheen = ctx.createLinearGradient(0, -h * 0.15, 0, h * 0.1)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.7)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.filter = 'blur(6px)'
  ctx.beginPath()
  ctx.ellipse(0, 0, w * 0.35, h * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
