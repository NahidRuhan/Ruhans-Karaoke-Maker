import { useState, useRef } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState(null)

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

  return (
    <div className="container mx-auto max-w-3xl p-6 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-2">Ruhan's Karaoke Maker</h1>
        <h2 className="text-xl font-semibold opacity-75">Powered by Demucs</h2>
      </div>

      <div className="card bg-base-200 shadow-xl mb-8">
        <div className="card-body">
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="file-input file-input-bordered file-input-primary w-full max-w-sm"
            />
            <button
              type="submit"
              disabled={!file || loading}
              className="btn btn-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
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
        <div className="alert alert-info shadow-lg mb-8">
          <span className="loading loading-spinner"></span>
          <div>
            <h3 className="font-bold">Separating Audio</h3>
            <div className="text-xs">This may take a few minutes depending on the file size.</div>
          </div>
        </div>
      )}

      {tracks && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Separated Tracks</h2>

            <div className="flex gap-4 mb-6">
              <button onClick={playAll} className="btn btn-success btn-sm">▶ Play All</button>
              <button onClick={pauseAll} className="btn btn-warning btn-sm">⏸ Pause All</button>
            </div>

            <div className="flex flex-col gap-6">
              {Object.entries(tracks).map(([instrument, url]) => (
                <div key={instrument} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-base-200 p-4 rounded-box">
                  <span className="badge badge-primary badge-lg w-24 uppercase font-bold py-3">
                    {instrument}
                  </span>
                  <audio
                    ref={(el) => (audioRefs.current[instrument] = el)}
                    src={url}
                    controls
                    className="w-full grow"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App