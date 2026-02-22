'use client'
export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="retro-window" style={{ width: 440, maxWidth: '90vw', boxShadow: '5px 5px 0px rgba(0,0,0,0.25)' }}>
        <div className="retro-title-bar">
          <span>About YapSesh</span>
          <div className="win-ctrl" onClick={onClose} style={{ background: '#A07060' }} />
        </div>
        <div className="p-5 space-y-4" style={{ background: '#F5F0E8' }}>
          <div className="text-center mb-4">
            <h2 className="text-lg font-serif" style={{ color: '#2C3E2C', fontStyle: 'italic' }}>YapSesh</h2>
            <p className="text-[10px] font-mono-display uppercase" style={{ color: '#8B9B85' }}>Version 1.0 — Field Station Edition</p>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: '#4A5A4A' }}>YapSesh listens while you talk, identifies topics and connections, and grows a visual map of your conversation in real time.</p>
          <div className="p-3" style={{ background: '#E8F0E4', border: '2px inset #C4B8A4' }}>
            <p className="text-[11px] font-mono-display font-bold uppercase mb-1" style={{ color: '#5B7553' }}>&#127793; Privacy</p>
            <p className="text-[11px]" style={{ color: '#4A5A4A' }}>Everything stays in your browser. Only transcript snippets are sent to your chosen AI provider.</p>
          </div>
          <div>
            <p className="text-[10px] font-mono-display font-bold uppercase mb-1" style={{ color: '#6B7F6B' }}>Supported Providers:</p>
            <p className="text-[11px]" style={{ color: '#4A5A4A' }}>Claude (Anthropic) / OpenAI / DeepSeek / Ollama</p>
          </div>
          <div className="flex gap-2">
            <a href="https://github.com/nomppy/yapsesh" target="_blank" rel="noopener noreferrer" className="retro-btn retro-btn-accent text-[10px]">GITHUB</a>
            <a href="mailto:feedback@sunken.site?subject=YapSesh%20Feedback" className="retro-btn text-[10px]">FEEDBACK</a>
          </div>
        </div>
        <div className="px-4 py-2" style={{ background: '#E8E0D4', borderTop: '2px groove #C4B8A4' }}>
          <button onClick={onClose} className="retro-btn retro-btn-accent text-[10px] float-right">OK</button>
          <div className="clear-both" />
        </div>
      </div>
    </div>)
}
