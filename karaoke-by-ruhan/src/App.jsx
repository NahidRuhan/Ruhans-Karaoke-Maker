import { useState, useRef } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState(null)
  const [mode, setMode] = useState('2stems') // Default to Karaoke mode

  // Object to store references to all 4 audio elements
  const audioRefs = useRef({})

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setTracks(null) // Clear any previous tracks when a new file is chosen
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      // Ensure this URL matches your Express backend URL & port
      const response = await fetch('http://localhost:5000/api/separate', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Processing failed')
      
      const data = await response.json()
      setTracks(data.tracks)
    } catch (error) {
      console.error(error)
      alert('Error separating audio. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // Synchronized Play/Pause controls
  const playAll = () => {
    Object.values(audioRefs.current).forEach((audioEl) => {
      if (audioEl) audioEl.play()
    })
  }

  const pauseAll = () => {
    Object.values(audioRefs.current).forEach((audioEl) => {
      if (audioEl) audioEl.pause()
    })
  }

  // Programmatic download function to handle cross-origin URLs
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download the file.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-10 selection:bg-indigo-500/30">
      <div className="container mx-auto max-w-3xl p-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 drop-shadow-sm tracking-tight">Ruhan's Karaoke Maker</h1>
          <h2 className="text-sm font-bold text-slate-400 tracking-[0.2em] uppercase">Powered by Demucs</h2>
      </div>

        <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl mb-8 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleUpload} className="flex flex-col gap-6 items-center justify-center">
              <div className="flex flex-col gap-4 w-full items-center justify-center">
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full max-w-sm bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all"
                >
                  <option value="2stems">Karaoke Mode (Vocals + Instrumental)</option>
                  <option value="4stems">Full Mode (4 Stems)</option>
                </select>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="w-full max-w-sm text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full max-w-sm bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : (
                  'Upload & Separate'
                )}
              </button>
            </form>
          </div>
        </div>

        {loading && (
          <div className="bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 p-5 rounded-2xl flex items-center gap-4 shadow-lg mb-8">
            <svg className="animate-spin h-6 w-6 text-indigo-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <div>
              <h3 className="font-bold text-indigo-300">Separating Audio</h3>
              <div className="text-sm opacity-80 mt-1">This may take a few minutes depending on the file size.</div>
            </div>
          </div>
        )}

        {tracks && (
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                Separated Tracks
              </h2>

              <div className="flex gap-4 mb-8">
                <button onClick={playAll} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm shadow-sm">
                  ▶ Play All
                </button>
                <button onClick={pauseAll} className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm shadow-sm">
                  ⏸ Pause All
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {Object.entries(tracks).map(([instrument, url]) => (
                  <div key={instrument} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 transition-colors shadow-inner">
                    <span className={`w-36 text-center uppercase font-black tracking-wider text-xs py-2 px-3 rounded-lg border shadow-sm ${
                      instrument === 'vocals' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 
                      instrument === 'instrumental' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                      instrument === 'drums' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      instrument === 'bass' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {instrument}
                    </span>
                    <audio
                      ref={(el) => (audioRefs.current[instrument] = el)}
                      src={url}
                      controls
                      className="w-full grow h-11 outline-none"
                    />
                    <button 
                      onClick={() => handleDownload(url, `${file?.name.replace(/\.[^/.]+$/, "")}_${instrument}.wav`)} 
                      className="bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500 px-4 py-2.5 rounded-xl font-medium transition-all text-sm whitespace-nowrap shadow-sm"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App