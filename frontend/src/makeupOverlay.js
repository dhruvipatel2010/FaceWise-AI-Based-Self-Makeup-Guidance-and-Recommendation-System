const UPPER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
const LOWER_LIP = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
const BROW_L = [70, 63, 105, 66, 107]
const BROW_R = [336, 296, 334, 293, 300]

const px = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h })
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

function soft(ctx, x, y, rx, ry, rgb, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  g.addColorStop(0, `rgba(${rgb},${alpha})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function brow(ctx, lm, ids, w, h, width, flat) {
  const pts = ids.map((i) => px(lm, i, w, h))
  ctx.strokeStyle = 'rgba(59,42,34,0.65)'
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  if (flat) {
    const y = pts.reduce((s, p) => s + p.y, 0) / pts.length
    ctx.moveTo(pts[0].x, y)
    ctx.lineTo(pts[pts.length - 1].x, y)
  } else {
    pts.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  }
  ctx.stroke()
}

export function drawMakeup(ctx, lm, w, h, shape) {
  const faceW = dist(px(lm, 234, w, h), px(lm, 454, w, h))
  const faceH = dist(px(lm, 10, w, h), px(lm, 152, w, h))
  const oblong = shape === 'Oblong'

  const top = px(lm, 10, w, h)
  const chin = px(lm, 152, w, h)
  soft(ctx, top.x, top.y + faceH * 0.04, faceW * 0.32, faceH * 0.08, '150,95,65', 0.35)
  soft(ctx, chin.x, chin.y - faceH * 0.03, faceW * 0.26, faceH * 0.07, '150,95,65', 0.35)

  const ry = oblong ? faceW * 0.07 : faceW * 0.11
  ;[205, 425].forEach((i) => {
    const c = px(lm, i, w, h)
    soft(ctx, c.x, c.y, faceW * 0.17, ry, '224,69,123', 0.5)
  })

  brow(ctx, lm, BROW_L, w, h, faceW * 0.028, oblong)
  brow(ctx, lm, BROW_R, w, h, faceW * 0.028, oblong)

  ctx.fillStyle = 'rgba(201,69,107,0.6)'
  ctx.beginPath()
  UPPER_LIP.forEach((i, k) => {
    const p = px(lm, i, w, h)
    k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  })
  LOWER_LIP.forEach((i) => {
    const p = px(lm, i, w, h)
    ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
  ctx.fill()
}
