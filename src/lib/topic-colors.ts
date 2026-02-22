// Retro nature pastel topic colors — like old field guide illustrations
export const TOPIC_COLORS = [
  { bg: '#E8F0E4', border: '#5B7553', text: '#3A5A32', dot: '#5B7553' },  // sage/forest
  { bg: '#F5EDE0', border: '#C4956A', text: '#8B6A42', dot: '#C4956A' },  // amber/bark
  { bg: '#E0ECE4', border: '#7BA56E', text: '#4A6B42', dot: '#7BA56E' },  // fern
  { bg: '#EDE4F0', border: '#8B7BA5', text: '#5A4A7B', dot: '#8B7BA5' },  // lavender wildflower
  { bg: '#E4EBF0', border: '#6B8BA5', text: '#3A5A7B', dot: '#6B8BA5' },  // sky through trees
  { bg: '#F0EBE0', border: '#A59B6B', text: '#6B6242', dot: '#A59B6B' },  // golden hour
] as const

export function getTopicColor(colorIndex: number) {
  return TOPIC_COLORS[colorIndex % TOPIC_COLORS.length]
}
