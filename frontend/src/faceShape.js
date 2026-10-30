const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// MediaPipe landmark points: 10 forehead top, 152 chin, 234 and 454 cheekbones,
// 54 and 284 forehead sides, 172 and 397 jaw corners
export function getFaceShape(lm) {
  const height = dist(lm[10], lm[152])
  const cheek = dist(lm[234], lm[454])
  const forehead = dist(lm[54], lm[284])
  const jaw = dist(lm[172], lm[397])

  const ratio = height / cheek
  const jawToCheek = jaw / cheek
  const foreheadToJaw = forehead / jaw

  let shape = 'Oval'
  if (ratio > 1.45) shape = 'Oblong'
  else if (ratio < 1.15 && jawToCheek > 0.8) shape = 'Square'
  else if (ratio < 1.15) shape = 'Round'
  else if (foreheadToJaw > 1.2) shape = 'Heart'

  return { shape, ratio: Number(ratio.toFixed(2)) }
}
