const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

// Define necessary directories
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'public', 'separated');

// Clear directories on server startup to delete orphaned files (if server was closed early)
const cleanOnStartup = (dirPath) => {
  if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
};
console.log("Wiping old audio files from previous sessions...");
cleanOnStartup(uploadDir);
cleanOnStartup(outputDir);

// Serve the Demucs output files statically so the frontend can play them
app.use('/separated', express.static(outputDir));

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Sanitize filename to prevent OS path issues
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});
const upload = multer({ storage });

app.post('/api/separate', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const originalFilePath = req.file.path;
  // Demucs creates a folder with the exact name of the file (minus the extension)
  const fileNameNoExt = path.parse(req.file.filename).name;
  const wavFilePath = path.join(uploadDir, `${fileNameNoExt}.wav`);

  console.log(`Converting ${req.file.originalname} to WAV to bypass Python DLL issues...`);
  
  // Convert to WAV first using Node's access to FFmpeg
  const ffmpeg = spawn('ffmpeg', ['-y', '-i', originalFilePath, wavFilePath]);

  ffmpeg.on('close', (ffmpegCode) => {
    if (ffmpegCode !== 0) {
      console.error(`FFmpeg conversion failed with code ${ffmpegCode}`);
      return res.status(500).json({ error: 'Audio conversion failed.' });
    }

    console.log(`Starting Demucs separation for: ${fileNameNoExt}.wav`);

    // Run Demucs via inline script to explicitly bypass Python's strict Windows DLL security
    const pyScript = "import os; os.add_dll_directory(r'C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl-shared\\bin'); from demucs.separate import main; main()";
    const demucs = spawn('python', ['-c', pyScript, '-n', 'htdemucs', '-o', outputDir, wavFilePath]);

    demucs.stdout.on('data', (data) => console.log(`Demucs: ${data.toString()}`));
    demucs.stderr.on('data', (data) => console.log(`Demucs (Progress): ${data.toString()}`));

    demucs.on('close', (code) => {
      if (code !== 0) {
        console.error(`Demucs process failed with code ${code}`);
        return res.status(500).json({ error: 'Audio processing failed.' });
      }

      // The htdemucs model outputs files inside an 'htdemucs' subfolder
      const baseUrl = `http://localhost:5000/separated/htdemucs/${fileNameNoExt}`;
      
      console.log('Separation complete.');
      res.json({ tracks: { vocals: `${baseUrl}/vocals.wav`, drums: `${baseUrl}/drums.wav`, bass: `${baseUrl}/bass.wav`, other: `${baseUrl}/other.wav` } });

      // --- CLEANUP TIMER ---
      // Delete the files 30 minutes (1800000 ms) after they are generated
      const CLEANUP_DELAY = 30 * 60 * 1000; 
      setTimeout(() => {
        try {
          console.log(`Running cleanup for: ${fileNameNoExt}`);
          if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);
          if (fs.existsSync(wavFilePath)) fs.unlinkSync(wavFilePath);
          
          const separatedFolder = path.join(outputDir, 'htdemucs', fileNameNoExt);
          if (fs.existsSync(separatedFolder)) fs.rmSync(separatedFolder, { recursive: true, force: true });
        } catch (err) {
          console.error(`Cleanup failed for ${fileNameNoExt}:`, err);
        }
      }, CLEANUP_DELAY);
    });
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
server.setTimeout(0); // Disable Node.js automatic timeout for long-running AI tasks