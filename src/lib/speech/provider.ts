export interface SpeechProvider {
  start(): void
  stop(): void
  onTranscript(cb: (text: string, speaker?: string) => void): void
  onInterim(cb: (text: string) => void): void
  isSupported(): boolean
}
