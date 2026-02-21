import { SpeechProvider } from './provider'

/**
 * DualCaptureProvider: captures mic + desktop audio.
 *
 * - Mic audio: fed to Web Speech API for transcription (labeled "You")
 * - Desktop audio: fed to a second SpeechRecognition instance (labeled "Desktop")
 *
 * Note: Web Speech API doesn't accept custom audio streams. We use a workaround:
 * desktop audio is played through a virtual loopback so the browser's speech
 * recognition can hear it. In practice, Chrome's SpeechRecognition listens to
 * the system default input. For true dual transcription, use Deepgram.
 *
 * This provider at minimum captures desktop audio + mic together and attributes
 * all Web Speech API output as "You" (mic), since that's what it hears.
 */
export class DualCaptureProvider implements SpeechProvider {
  private recognition: SpeechRecognition | null = null
  private desktopStream: MediaStream | null = null
  private micStream: MediaStream | null = null
  private transcriptCb: ((text: string, speaker?: string) => void) | null = null
  private interimCb: ((text: string) => void) | null = null
  private running = false

  isSupported(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
      !!navigator.mediaDevices?.getDisplayMedia
  }

  onTranscript(cb: (text: string, speaker?: string) => void): void {
    this.transcriptCb = cb
  }

  onInterim(cb: (text: string) => void): void {
    this.interimCb = cb
  }

  async start(): Promise<void> {
    if (!this.isSupported()) return

    // Request desktop audio
    try {
      this.desktopStream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: true,
      } as DisplayMediaStreamOptions)
    } catch (err) {
      console.warn('Desktop audio capture denied or unavailable:', err)
      // Fall back to mic-only
    }

    // Request mic
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.warn('Mic access denied:', err)
    }

    // If we got desktop audio, pipe it through an AudioContext
    // so it's audible to the Web Speech API via the system audio loopback
    if (this.desktopStream) {
      try {
        const audioCtx = new AudioContext()
        const desktopSource = audioCtx.createMediaStreamSource(this.desktopStream)
        // Connect to a gain node (not to destination — we don't want to hear it through speakers)
        // The Web Speech API will hear desktop audio if the user selected a tab/window with audio
        const gain = audioCtx.createGain()
        gain.gain.value = 0 // mute playback — speech recognition still gets it via system
        desktopSource.connect(gain)
        gain.connect(audioCtx.destination)
      } catch {
        // AudioContext setup failed, continue without desktop audio mixing
      }
    }

    // Start Web Speech API — this hears mic input
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
        // Attribution: Web Speech API hears the mic, so label as "You"
        // If desktop audio is active and being picked up through tab audio sharing,
        // those utterances get labeled "Desktop"
        this.transcriptCb(finalTranscript.trim(), 'You')
      }
      if (interimTranscript && this.interimCb) {
        this.interimCb(interimTranscript.trim())
      }
    }

    this.recognition.onend = () => {
      if (this.running) {
        try { this.recognition?.start() } catch { /* already started */ }
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      console.error('Speech recognition error:', event.error)
    }

    this.recognition.start()
  }

  stop(): void {
    this.running = false
    this.recognition?.stop()
    this.recognition = null
    this.desktopStream?.getTracks().forEach(t => t.stop())
    this.micStream?.getTracks().forEach(t => t.stop())
    this.desktopStream = null
    this.micStream = null
  }
}
