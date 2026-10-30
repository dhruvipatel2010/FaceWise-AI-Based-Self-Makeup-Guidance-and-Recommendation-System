const TIPS = {
  Oval: {
    haircuts: ['Layered bob', 'Long layers', 'Side-swept fringe'],
    makeup: ['Soft blush on the cheekbones', 'Natural, defined brows', 'Any lip shade works'],
    color: ['Warm brown', 'Honey highlights', 'Soft balayage'],
  },
  Round: {
    haircuts: ['Long layers past the shoulders', 'Side part with volume at the crown', 'Angled lob'],
    makeup: ['Blush swept up toward the temples', 'Contour along the sides of the face', 'Angled brows'],
    color: ['Dark roots with lighter ends', 'Chocolate brown', 'Face-framing highlights'],
  },
  Square: {
    haircuts: ['Soft waves', 'Side-swept layers', 'Long layers with a wispy fringe'],
    makeup: ['Soft blush on the apple of the cheeks', 'Light contour on the jaw corners', 'Rounded brows'],
    color: ['Caramel highlights', 'Soft ombre', 'Warm chestnut'],
  },
  Heart: {
    haircuts: ['Chin-length bob', 'Side-parted layers', 'Long layers with curtain bangs'],
    makeup: ['Blush on the apples of the cheeks', 'Light contour on the temples', 'Soft, rounded brows'],
    color: ['Golden brown', 'Honey tones near the jaw', 'Soft balayage'],
  },
  Oblong: {
    haircuts: ['Chin-length bob with volume', 'Full fringe', 'Soft waves at the sides'],
    makeup: ['Blush across the cheeks, not up', 'Straight, flat brows', 'Light contour under the chin'],
    color: ['Rich brown', 'Subtle highlights', 'All-over warm tone'],
  },
}

export function suggestionsFor(shape) {
  return TIPS[shape] || TIPS.Oval
}
