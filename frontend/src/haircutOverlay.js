/**
 * Dynamic Haircut Virtual Try-On Canvas Overlay
 * Renders realistic hair silhouettes, textured strands, bangs, and layers
 * adapted in real-time to MediaPipe 3D face landmarks (head tilt, scale, and position).
 */

const px = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h })
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const HAIR_PALETTES = {
  Natural:   { base: [45, 30, 25],   highlight: [85, 60, 50],   shadow: [25, 15, 12] },
  Chocolate: { base: [85, 48, 32],   highlight: [135, 82, 58],  shadow: [48, 25, 18] },
  Honey:     { base: [180, 130, 65], highlight: [225, 185, 115], shadow: [120, 80, 35] },
  Burgundy:  { base: [110, 25, 45],  highlight: [165, 48, 75],  shadow: [65, 12, 25] },
  Copper:    { base: [170, 75, 35],  highlight: [215, 120, 65], shadow: [105, 40, 18] },
  'Ash brown': { base: [95, 82, 75], highlight: [145, 130, 122], shadow: [55, 45, 40] },
  Caramel:   { base: [155, 95, 50],  highlight: [205, 145, 85], shadow: [95, 55, 28] },
}

export function drawHaircut(ctx, lm, w, h, cutName, colorName = 'Chocolate', opacity = 0.88) {
  if (!ctx || !lm || !cutName) return

  const palette = HAIR_PALETTES[colorName] || HAIR_PALETTES.Chocolate
  const [br, bg, bb] = palette.base
  const [hr, hg, hb] = palette.highlight
  const [sr, sg, sb] = palette.shadow

  const top = px(lm, 10, w, h)
  const chin = px(lm, 152, w, h)
  const leftCheek = px(lm, 234, w, h)
  const rightCheek = px(lm, 454, w, h)
  const leftJaw = px(lm, 172, w, h)
  const rightJaw = px(lm, 397, w, h)
  const nose = px(lm, 4, w, h)
  const browMid = px(lm, 151, w, h)

  const faceW = dist(leftCheek, rightCheek)
  const faceH = dist(top, chin)
  const midX = (leftCheek.x + rightCheek.x) / 2
  const angle = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x)

  ctx.save()
  ctx.globalAlpha = opacity

  // Base linear gradient for hair depth
  const grad = ctx.createLinearGradient(midX, top.y - faceH * 0.4, midX, chin.y + faceH * 0.6)
  grad.addColorStop(0, `rgb(${hr}, ${hg}, ${hb})`)
  grad.addColorStop(0.35, `rgb(${br}, ${bg}, ${bb})`)
  grad.addColorStop(1, `rgb(${sr}, ${sg}, ${sb})`)

  ctx.fillStyle = grad
  ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, 0.6)`
  ctx.lineWidth = 2

  if (cutName.includes('Bob') || cutName.includes('Lob')) {
    renderBob(ctx, top, chin, leftCheek, rightCheek, leftJaw, rightJaw, faceW, faceH, grad, palette)
  } else if (cutName.includes('Bangs') || cutName.includes('Fringe')) {
    renderCurtainBangs(ctx, top, browMid, leftCheek, rightCheek, faceW, faceH, grad, palette)
  } else if (cutName.includes('Waves') || cutName.includes('Layers')) {
    renderLongLayers(ctx, top, chin, leftCheek, rightCheek, leftJaw, rightJaw, faceW, faceH, grad, palette)
  } else if (cutName.includes('Pixie')) {
    renderPixie(ctx, top, browMid, leftCheek, rightCheek, faceW, faceH, grad, palette)
  } else {
    // Default flattering layers
    renderLongLayers(ctx, top, chin, leftCheek, rightCheek, leftJaw, rightJaw, faceW, faceH, grad, palette)
  }

  // Draw silky shine highlights
  renderShine(ctx, top, leftCheek, rightCheek, faceW, faceH, palette)

  ctx.restore()
}

function renderBob(ctx, top, chin, lCheek, rCheek, lJaw, rJaw, fW, fH, grad, palette) {
  // Left side volume & inward curl
  ctx.beginPath()
  ctx.moveTo(top.x - fW * 0.15, top.y - fH * 0.22)
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.45, top.y - fH * 0.15,
    lCheek.x - fW * 0.50, lJaw.y,
    lJaw.x + fW * 0.05, chin.y + fH * 0.08
  )
  ctx.bezierCurveTo(
    lJaw.x + fW * 0.18, chin.y + fH * 0.02,
    lCheek.x - fW * 0.15, lJaw.y - fH * 0.15,
    lCheek.x - fW * 0.05, top.y + fH * 0.1
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Right side volume & inward curl
  ctx.beginPath()
  ctx.moveTo(top.x + fW * 0.15, top.y - fH * 0.22)
  ctx.bezierCurveTo(
    rCheek.x + fW * 0.45, top.y - fH * 0.15,
    rCheek.x + fW * 0.50, rJaw.y,
    rJaw.x - fW * 0.05, chin.y + fH * 0.08
  )
  ctx.bezierCurveTo(
    rJaw.x - fW * 0.18, chin.y + fH * 0.02,
    rCheek.x + fW * 0.15, rJaw.y - fH * 0.15,
    rCheek.x + fW * 0.05, top.y + fH * 0.1
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Crown curve
  ctx.beginPath()
  ctx.moveTo(lCheek.x - fW * 0.35, top.y)
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.2, top.y - fH * 0.28,
    rCheek.x + fW * 0.2, top.y - fH * 0.28,
    rCheek.x + fW * 0.35, top.y
  )
  ctx.bezierCurveTo(
    rCheek.x, top.y - fH * 0.1,
    lCheek.x, top.y - fH * 0.1,
    lCheek.x - fW * 0.35, top.y
  )
  ctx.closePath()
  ctx.fill()
}

function renderCurtainBangs(ctx, top, brow, lCheek, rCheek, fW, fH, grad, palette) {
  // Left sweep curtain
  ctx.beginPath()
  ctx.moveTo(top.x - fW * 0.02, top.y - fH * 0.12)
  ctx.bezierCurveTo(
    top.x - fW * 0.12, brow.y - fH * 0.05,
    lCheek.x - fW * 0.15, brow.y + fH * 0.15,
    lCheek.x - fW * 0.25, lCheek.y + fH * 0.25
  )
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.10, lCheek.y + fH * 0.20,
    lCheek.x - fW * 0.02, brow.y + fH * 0.02,
    top.x - fW * 0.05, top.y
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Right sweep curtain
  ctx.beginPath()
  ctx.moveTo(top.x + fW * 0.02, top.y - fH * 0.12)
  ctx.bezierCurveTo(
    top.x + fW * 0.12, brow.y - fH * 0.05,
    rCheek.x + fW * 0.15, brow.y + fH * 0.15,
    rCheek.x + fW * 0.25, rCheek.y + fH * 0.25
  )
  ctx.bezierCurveTo(
    rCheek.x + fW * 0.10, rCheek.y + fH * 0.20,
    rCheek.x + fW * 0.02, brow.y + fH * 0.02,
    top.x + fW * 0.05, top.y
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Hairline roots
  ctx.beginPath()
  ctx.moveTo(lCheek.x - fW * 0.25, top.y)
  ctx.bezierCurveTo(top.x - fW * 0.1, top.y - fH * 0.2, top.x + fW * 0.1, top.y - fH * 0.2, rCheek.x + fW * 0.25, top.y)
  ctx.bezierCurveTo(rCheek.x, top.y - fH * 0.05, lCheek.x, top.y - fH * 0.05, lCheek.x - fW * 0.25, top.y)
  ctx.closePath()
  ctx.fill()
}

function renderLongLayers(ctx, top, chin, lCheek, rCheek, lJaw, rJaw, fW, fH, grad, palette) {
  // Cascading Left Side
  ctx.beginPath()
  ctx.moveTo(top.x - fW * 0.18, top.y - fH * 0.22)
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.48, top.y - fH * 0.05,
    lCheek.x - fW * 0.42, lJaw.y + fH * 0.2,
    lCheek.x - fW * 0.25, chin.y + fH * 0.55
  )
  ctx.bezierCurveTo(
    lJaw.x + fW * 0.05, chin.y + fH * 0.45,
    lJaw.x + fW * 0.12, chin.y + fH * 0.15,
    lCheek.x - fW * 0.08, top.y + fH * 0.15
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Cascading Right Side
  ctx.beginPath()
  ctx.moveTo(top.x + fW * 0.18, top.y - fH * 0.22)
  ctx.bezierCurveTo(
    rCheek.x + fW * 0.48, top.y - fH * 0.05,
    rCheek.x + fW * 0.42, rJaw.y + fH * 0.2,
    rCheek.x + fW * 0.25, chin.y + fH * 0.55
  )
  ctx.bezierCurveTo(
    rJaw.x - fW * 0.05, chin.y + fH * 0.45,
    rJaw.x - fW * 0.12, chin.y + fH * 0.15,
    rCheek.x + fW * 0.08, top.y + fH * 0.15
  )
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Full Crown Volume
  ctx.beginPath()
  ctx.moveTo(lCheek.x - fW * 0.38, top.y + fH * 0.05)
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.25, top.y - fH * 0.30,
    rCheek.x + fW * 0.25, top.y - fH * 0.30,
    rCheek.x + fW * 0.38, top.y + fH * 0.05
  )
  ctx.bezierCurveTo(
    rCheek.x + fW * 0.15, top.y - fH * 0.10,
    lCheek.x - fW * 0.15, top.y - fH * 0.10,
    lCheek.x - fW * 0.38, top.y + fH * 0.05
  )
  ctx.closePath()
  ctx.fill()
}

function renderPixie(ctx, top, brow, lCheek, rCheek, fW, fH, grad, palette) {
  // Textured Crown & Short Sides
  ctx.beginPath()
  ctx.moveTo(lCheek.x - fW * 0.22, top.y + fH * 0.1)
  ctx.bezierCurveTo(
    lCheek.x - fW * 0.25, top.y - fH * 0.25,
    rCheek.x + fW * 0.25, top.y - fH * 0.25,
    rCheek.x + fW * 0.22, top.y + fH * 0.1
  )
  ctx.bezierCurveTo(
    rCheek.x + fW * 0.05, brow.y - fH * 0.05,
    lCheek.x - fW * 0.05, brow.y - fH * 0.05,
    lCheek.x - fW * 0.22, top.y + fH * 0.1
  )
  ctx.closePath()
  ctx.fill()

  // Wispy textured fringe
  for (let i = -3; i <= 3; i++) {
    const ox = top.x + i * (fW * 0.06)
    ctx.beginPath()
    ctx.moveTo(ox, top.y - fH * 0.08)
    ctx.lineTo(ox + (i % 2 === 0 ? 8 : -6), brow.y + (i % 2 === 0 ? 5 : 2))
    ctx.strokeStyle = `rgba(${palette.shadow[0]}, ${palette.shadow[1]}, ${palette.shadow[2]}, 0.8)`
    ctx.lineWidth = 3
    ctx.stroke()
  }
}

function renderShine(ctx, top, lCheek, rCheek, fW, fH, palette) {
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = `rgba(${palette.highlight[0]}, ${palette.highlight[1]}, ${palette.highlight[2]}, 0.55)`
  ctx.filter = 'blur(6px)'

  ctx.beginPath()
  ctx.ellipse(top.x, top.y - fH * 0.12, fW * 0.28, fH * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
