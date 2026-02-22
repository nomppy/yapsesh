// Rotating topic color palette — warm, lively, sticky-note feel
export const TOPIC_COLORS = [
  { bg: '#FFF7ED', border: '#FB923C', text: '#C2410C', dot: '#FB923C' },  // coral/orange
  { bg: '#F0F9FF', border: '#38BDF8', text: '#0369A1', dot: '#38BDF8' },  // sky
  { bg: '#F5F3FF', border: '#A78BFA', text: '#6D28D9', dot: '#A78BFA' },  // lavender
  { bg: '#ECFDF5', border: '#34D399', text: '#047857', dot: '#34D399' },  // mint
  { bg: '#FFF1F2', border: '#FB7185', text: '#BE123C', dot: '#FB7185' },  // rose
] as const

export function getTopicColor(colorIndex: number) {
  return TOPIC_COLORS[colorIndex % TOPIC_COLORS.length]
}
