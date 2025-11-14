import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function Hero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#0f1130] to-[#0b0f24] text-white">
      <div className="absolute inset-0 opacity-70 pointer-events-none" aria-hidden>
        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,rgba(150,100,255,0.25),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,120,70,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,rgba(90,200,255,0.15),transparent_60%)]" />
      </div>
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/80 backdrop-blur">
          New • AI media studio
        </span>
        <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-6xl">
          Generate images and videos with a single prompt
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">
          Type what you imagine. Get stylized images or short video clips in seconds. Built for speed, creativity, and sharing.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#studio" className="rounded-full bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition">Open Studio</a>
          <a href="#how" className="rounded-full border border-white/20 px-6 py-3 font-medium text-white/80 hover:bg-white/10 transition">How it works</a>
        </div>
      </div>
    </section>
  )
}

function Studio() {
  const [mode, setMode] = useState('image')
  const [prompt, setPrompt] = useState('a neon cyberpunk cityscape at dusk, cinematic, high detail')
  const [images, setImages] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const submit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setImages([])
    setVideoUrl('')
    setNote('')
    try {
      const endpoint = mode === 'image' ? '/api/generate/image' : '/api/generate/video'
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'image' ? { prompt, width: 768, height: 768, model: 'auto' } : { prompt, seconds: 5, model: 'auto' }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      if (mode === 'image') {
        setImages(data.urls || [])
      } else {
        setVideoUrl(data.url)
      }
      if (data.note) setNote(data.note)
    } catch (err) {
      setNote('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // warm up backend
    fetch(`${BACKEND_URL}/api/hello`).catch(()=>{})
  }, [])

  return (
    <section id="studio" className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 pb-24">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('image')} className={`rounded-full px-4 py-2 text-sm ${mode==='image' ? 'bg-white text-black' : 'text-white/80 border border-white/20'}`}>Image</button>
          <button onClick={() => setMode('video')} className={`rounded-full px-4 py-2 text-sm ${mode==='video' ? 'bg-white text-black' : 'text-white/80 border border-white/20'}`}>Video</button>
        </div>
        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe your vision…" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none ring-1 ring-white/10" />
          <button disabled={loading} className="rounded-xl bg-white px-6 py-3 font-medium text-black hover:bg-white/90 disabled:opacity-60">{loading ? 'Generating…' : 'Generate'}</button>
        </form>
        {note && <p className="mt-3 text-sm text-white/70">{note}</p>}

        {mode==='image' && images.length>0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {images.map((src, i) => (
              <img key={i} src={src} alt="generated" className="aspect-square w-full rounded-xl object-cover ring-1 ring-white/10" />
            ))}
          </div>
        )}

        {mode==='video' && videoUrl && (
          <div className="mt-6">
            <video src={videoUrl} controls className="w-full rounded-xl ring-1 ring-white/10" />
          </div>
        )}
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="border-t border-white/10 bg-[#0b0f24] py-10 text-center text-white/60">
      <p>Built with an AI-first workflow. Add your REPLICATE_API_TOKEN to unlock real generation.</p>
    </footer>
  )
}

export default function App(){
  return (
    <div className="min-h-screen w-full bg-[#0b0f24]">
      <Hero />
      <Studio />
      <Footer />
    </div>
  )
}
