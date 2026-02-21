import { SpeechProvider } from './provider'

export class DeepgramProvider implements SpeechProvider {
  private ws: WebSocket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private transcriptCb: ((text: string, speaker?: string) => void) | null = null
  private interimCb: ((text: string) => void) | null = null
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  }

  onTranscript(cb: (text: string, speaker?: string) => void): void {
    this.transcriptCb = cb
  }

  onInterim(cb: (text: string) => void): void {
    this.interimCb = cb
  }

  async start(): Promise<void> {
    if (!this.isSupported()) return

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const url = `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&diarize=true&encoding=linear16&sample_rate=16000`
    this.ws = new WebSocket(url, ['token', this.apiKey])

    this.ws.onopen = () => {
      this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType: 'audio/webm' })
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(event.data)
        }
      }
      this.mediaRecorder.start(250) // Send chunks every 250ms
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const alternative = data.channel?.alternatives?.[0]
      if (!alternative) return

      const text = alternative.transcript
      if (!text) return

      const speaker = alternative.words?.[0]?.speaker !== undefined
        ? `Speaker ${alternative.words[0].speaker + 1}`
        : undefined

      if (data.is_final) {
        this.transcriptCb?.(text, speaker)
      } else {
        this.interimCb?.(text)
      }
    }

    this.ws.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error)
    }
  }

  stop(): void {
    this.mediaRecorder?.stop()
    this.ws?.close()
    this.stream?.getTracks().forEach(track => track.stop())
    this.mediaRecorder = null
    this.ws = null
    this.stream = null
  }
}
