import { SpeechProvider } from './provider'

export class WebSpeechProvider implements SpeechProvider {
  private recognition: SpeechRecognition | null = null
  private transcriptCb: ((text: string, speaker?: string) => void) | null = null
  private interimCb: ((text: string) => void) | null = null
  private running = false

  isSupported(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }

  onTranscript(cb: (text: string, speaker?: string) => void): void {
    this.transcriptCb = cb
  }

  onInterim(cb: (text: string) => void): void {
    this.interimCb = cb
  }

  start(): void {
    if (!this.isSupported()) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.running = true

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript && this.transcriptCb) {
        this.transcriptCb(finalTranscript.trim())
      }
      if (interimTranscript && this.interimCb) {
        this.interimCb(interimTranscript.trim())
      }
    }

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be running (Web Speech API stops on silence)
      if (this.running) {
        try {
          this.recognition?.start()
        } catch {
          // May throw if already started
        }
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Expected errors, auto-restart handles these
        return
      }
      console.error('Speech recognition error:', event.error)
    }

    this.recognition.start()
  }

  stop(): void {
    this.running = false
    this.recognition?.stop()
    this.recognition = null
  }
}
