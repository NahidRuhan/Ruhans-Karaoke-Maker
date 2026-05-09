# Ruhan's Karaoke Maker 🎤

**Powered by Demucs AI**

At a random 3 am, you just want to sing karaoke to your favourite song. But when you search the song, the karaoke version isn't available. So what do you do? Go to a AI karaoke maker. But then after making one sample, it asks for money. So what do you do? 

Now introducing:

Ruhan's Karaoke Maker : A full-stack web application that allows users to upload any song and automatically separate it into four distinct audio tracks (stems): **Vocals, Drums, Bass, and Other**. It utilizes Facebook's state-of-the-art [Demucs](https://github.com/facebookresearch/demucs) AI model for high-quality audio source separation. 

Once processed, users can listen to the tracks in a synchronized multi-track audio player—perfect for creating instrumental karaoke tracks, practicing drum covers, or remixing!

## ✨ Features

- **AI Audio Separation**: Uses the `htdemucs` AI model to precisely split audio into 4 stems.
- **Synchronized Playback**: Custom React audio player that allows you to play and pause all 4 tracks perfectly in sync.
- **Format Conversion**: Automatically converts uploaded MP3s to WAVs on the backend for maximum compatibility with the AI engine.
- **Auto-Cleanup System**: 
  - **30-Minute Timer**: Automatically deletes heavy `.wav` files 30 minutes after generation to save disk space.
  - **Boot Wiper**: Clears out any orphaned files in the `uploads/` and `separated/` folders every time the server starts.
- **Modern UI**: Clean, responsive interface built with React, Tailwind CSS, and DaisyUI.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- DaisyUI components

**Backend:**
- Node.js & Express
- Multer (for handling file uploads)
- `child_process` (for executing FFmpeg and Python scripts)

**AI & Audio Processing:**
- Python 3
- PyTorch (`torchcodec`)
- Demucs
- FFmpeg (GPL Shared Build)

---

## 🚀 Prerequisites

Because this app relies heavily on local CPU/GPU AI processing, you must have the following installed on your machine:

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **FFmpeg (Full Shared Build)**
   - Must be the "shared" version that includes `.dll` files (e.g., from BtbN Windows 64 GPL Shared).
   - The `bin` folder containing `ffmpeg.exe` and the `.dll` files must be located at `C:\ffmpeg\ffmpeg-master-latest-win64-gpl-shared\bin` (or update the path in `index.js`).
   - This directory *must* be added to your system's `PATH` environment variable.
4. **Python Dependencies**:
   ```bash
   python -m pip install -U demucs torchcodec soundfile
   ```

---

## 📦 Installation & Setup

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd karaoke-by-ruhan-server
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node index.js
   ```
   *The backend will run on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd karaoke-by-ruhan
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 💡 Usage

1. Open your browser and go to `http://localhost:5173`.
2. Click **Choose File** and upload an audio file (e.g., an `.mp3` or `.wav`).
3. Click **Upload & Separate**. 
   - *Note: The very first time you run the app, Demucs will pause to download the `htdemucs` AI model weights. Subsequent runs will process immediately.*
   - *Processing a full 3-minute song on a CPU typically takes 5–10 minutes.*
4. Once complete, the UI will display the 4 separated tracks.
5. Use the **Play All** and **Pause All** buttons to control the tracks simultaneously, and use the individual volume/mute controls to isolate the instruments you want to hear!

---

## ⚠️ Technical Notes & Workarounds

- **Python DLL Security on Windows:** Modern versions of Python 3.8+ ignore the system `PATH` for `.dll` files. To prevent PyTorch (`torchcodec`) from crashing when trying to save audio via FFmpeg, the Node.js backend automatically converts the uploaded file to a `.wav` file first. It then uses an inline Python script to explicitly inject the FFmpeg DLL directory (`os.add_dll_directory()`) into the Python runtime before calling the Demucs module.
- **File Lifespans:** To ensure the host server doesn't run out of storage space, all uploaded and generated files are automatically purged after 30 minutes. Users must download any stems they wish to keep before the timer expires.

---

### License
MIT License