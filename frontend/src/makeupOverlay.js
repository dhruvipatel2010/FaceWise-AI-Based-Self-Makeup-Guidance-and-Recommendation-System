const px = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h })
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const PALETTES = {
  Light: { blush: '232,125,135', lip: '190,65,85', shadow: '150,100,95' },
  Medium: { blush: '214,100,105', lip: '165,45,65', shadow: '125,78,65' },
  Deep: { blush: '185,75,85', lip: '135,30,55', shadow: '90,52,45' },
}

const BLUSH_ANGLE = { Oblong: 0, Round: 0.45, Square: 0.2, Heart: 0.15, Oval: 0.25 }

const CONTOUR = {
  Oblong: [[10, 0.3, 0.07], [152, 0.22, 0.06]],
  Round: [[172, 0.12, 0.12], [397, 0.12, 0.12]],
  Square: [[172, 0.11, 0.1], [397, 0.11, 0.1]],
  Heart: [[54, 0.12, 0.08], [284, 0.12, 0.08], [152, 0.18, 0.05]],
  Oval: [[10, 0.22, 0.05], [152, 0.16, 0.04]],
}

const LIP_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
const LIP_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
const BROW_L = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
const BROW_R = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
const LID_L = [33, 246, 161, 160, 159, 158, 157, 173, 133]
const LID_R = [263, 466, 388, 387, 386, 385, 384, 398, 362]

export function sampleTone(ctx, lm, w, h) {
  let sum = 0
  let n = 0
  ;[205, 425].forEach((i) => {
    const c = px(lm, i, w, h)
    const x = Math.max(0, Math.round(c.x - 6))
    const y = Math.max(0, Math.round(c.y - 6))
    const d = ctx.getImageData(x, y, 12, 12).data
    for (let k = 0; k < d.length; k += 4) {
      sum += 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]
      n++
    }
  })
  const l = sum / n
  return l > 165 ? 'Light' : l > 110 ? 'Medium' : 'Deep'
}

function trace(ctx, lm, ids, w, h) {
  ids.forEach((i, k) => {
    const p = px(lm, i, w, h)
    k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  })
  ctx.closePath()
}

function layer(ctx, blend, alpha, blur, fn) {
  ctx.save()
  ctx.globalCompositeOperation = blend
  ctx.globalAlpha = alpha
  ctx.filter = 'blur(' + blur + 'px)'
  fn()
  ctx.restore()
}

function spot(ctx, x, y, rx, ry, angle, rgb) {
  ctx.fillStyle = 'rgb(' + rgb + ')'
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2)
  ctx.fill()
}

export function drawMakeup(ctx, lm, w, h, shape, tone) {
  const pal = PALETTES[tone] || PALETTES.Medium
  const top = px(lm, 10, w, h)
  const chin = px(lm, 152, w, h)
  const W = dist(px(lm, 234, w, h), px(lm, 454, w, h))
  const H = dist(top, chin)
  const mid = { x: (top.x + chin.x) / 2, y: (top.y + chin.y) / 2 }

  layer(ctx, 'multiply', 0.22, W * 0.05, () => {
    ;(CONTOUR[shape] || CONTOUR.Oval).forEach(([i, rx, ry]) => {
      const c = px(lm, i, w, h)
      const x = c.x + (mid.x - c.x) * 0.15
      const y = c.y + (mid.y - c.y) * 0.15
      spot(ctx, x, y, W * rx, H * ry, 0, '140,95,75')
    })
  })

  const a = BLUSH_ANGLE[shape] ?? 0.25
  const bry = shape === 'Oblong' ? H * 0.035 : H * 0.055
  layer(ctx, 'multiply', 0.38, W * 0.04, () => {
    const l = px(lm, 205, w, h)
    const r = px(lm, 425, w, h)
    spot(ctx, l.x, l.y, W * 0.13, bry, a, pal.blush)
    spot(ctx, r.x, r.y, W * 0.13, bry, -a, pal.blush)
  })

  ;[LID_L, LID_R].forEach((lid) => {
    const pts = lid.map((i) => px(lm, i, w, h))
    const eyeW = dist(pts[0], pts[pts.length - 1])
    layer(ctx, 'multiply', 0.32, eyeW * 0.12, () => {
      ctx.fillStyle = 'rgb(' + pal.shadow + ')'
      ctx.beginPath()
      pts.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ;[...pts].reverse().forEach((p) => ctx.lineTo(p.x, p.y - eyeW * 0.3))
      ctx.closePath()
      ctx.fill()
    })
    layer(ctx, 'source-over', 0.55, 0.6, () => {
      ctx.strokeStyle = 'rgb(40,28,25)'
      ctx.lineWidth = Math.max(1, eyeW * 0.05)
      ctx.lineCap = 'round'
      ctx.beginPath()
      pts.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.stroke()
    })
  })

  layer(ctx, 'multiply', 0.3, 1.2, () => {
    ctx.fillStyle = 'rgb(60,40,30)'
    ;[BROW_L, BROW_R].forEach((ids) => {
      ctx.beginPath()
      trace(ctx, lm, ids, w, h)
      ctx.fill()
    })
  })

  layer(ctx, 'multiply', 0.6, 1, () => {
    ctx.fillStyle = 'rgb(' + pal.lip + ')'
    ctx.beginPath()
    trace(ctx, lm, LIP_OUTER, w, h)
    trace(ctx, lm, LIP_INNER, w, h)
    ctx.fill('evenodd')
  })

  const mouthW = dist(px(lm, 61, w, h), px(lm, 291, w, h))
  const a14 = px(lm, 14, w, h)
  const a17 = px(lm, 17, w, h)
  layer(ctx, 'soft-light', 0.4, 2, () => {
    spot(ctx, (a14.x + a17.x) / 2, (a14.y + a17.y) / 2, mouthW * 0.14, mouthW * 0.035, 0, '255,255,255')
  })
}
