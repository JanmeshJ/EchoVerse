const uploadBtn = document.getElementById("uploadBtn");
const micBtn = document.getElementById("micBtn");
const transcribeBtn = document.getElementById("transcribeBtn");
const fileInput = document.getElementById("audioFile");
const statusEl = document.getElementById("status");
const resultDiv = document.getElementById("result");
const textEl = document.getElementById("transcribedText");
const languageEl = document.getElementById("language");
const timeEl = document.getElementById("time");
const visualizer = document.getElementById("visualizer");

let recordedBlob = null;
let mediaRecorder;
let chunks = [];
let visualizerInterval = null;

// File Upload Handler
uploadBtn.onclick = () => {
  fileInput.click();
  // Add click animation
  uploadBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    uploadBtn.style.transform = '';
  }, 150);
};

fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    statusEl.textContent = `Selected: ${fileName}`;
    transcribeBtn.disabled = false;
    recordedBlob = null;
    
    // Success animation
    uploadBtn.style.background = '#10b981';
    setTimeout(() => {
      uploadBtn.style.background = '';
    }, 300);
  }
};

// Microphone Recording Handler
micBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    // Stop recording
    mediaRecorder.stop();
    micBtn.classList.remove('recording');
    micBtn.textContent = "Record";
    statusEl.textContent = "Recording stopped";
    transcribeBtn.disabled = false;
    stopVisualizer();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(chunks, { type: "audio/wav" });
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    micBtn.classList.add('recording');
    micBtn.innerHTML = '<span class="recording-indicator"></span>Recording';
    statusEl.textContent = "Recording in progress...";
    transcribeBtn.disabled = true;
    
    // Start visualizer animation
    startVisualizer();
    
  } catch (err) {
    statusEl.textContent = "Microphone permission denied";
    console.error('Microphone error:', err);
  }
};

// Transcribe Handler
transcribeBtn.onclick = async () => {
  let blob = recordedBlob || fileInput.files[0];
  if (!blob) {
    statusEl.textContent = "No audio file or recording found";
    shakeButtom(transcribeBtn);
    return;
  }

  // Add processing state
  transcribeBtn.classList.add('processing');
  transcribeBtn.textContent = 'Processing...';
  transcribeBtn.disabled = true;
  
  statusEl.textContent = "Transcribing audio...";
  resultDiv.classList.add("hidden");
  
  // Subtle visualizer during processing
  startProcessingVisualizer();

  const formData = new FormData();
  formData.append("file", blob);

  try {
    const res = await fetch("/transcribe", { method: "POST", body: formData });
    const data = await res.json();

    // Populate results
    textEl.textContent = data.text;
    languageEl.textContent = `Language: ${data.language.toUpperCase()}`;
    timeEl.textContent = `Processing time: ${data.time}s`;

    statusEl.textContent = "Transcription complete";
    
    // Stop processing animation
    stopVisualizer();
    transcribeBtn.classList.remove('processing');
    transcribeBtn.textContent = 'Transcribe';
    transcribeBtn.disabled = false;
    
    // Show results with animation
    resultDiv.classList.remove("hidden");
    
    // Success feedback
    transcribeBtn.style.background = '#10b981';
    setTimeout(() => {
      transcribeBtn.style.background = '';
    }, 500);
    
  } catch (err) {
    statusEl.textContent = "Transcription failed. Please try again.";
    transcribeBtn.classList.remove('processing');
    transcribeBtn.textContent = 'Transcribe';
    transcribeBtn.disabled = false;
    stopVisualizer();
    shakeButtom(transcribeBtn);
    console.error('Transcription error:', err);
  }
};

// Audio Visualizer Animation
function startVisualizer() {
  visualizer.classList.add('active');
  const bars = visualizer.querySelectorAll('.visualizer-bar');
  
  visualizerInterval = setInterval(() => {
    bars.forEach(bar => {
      const height = Math.random() * 60 + 20;
      bar.style.height = `${height}px`;
    });
  }, 100);
}

function startProcessingVisualizer() {
  visualizer.classList.add('active');
  const bars = visualizer.querySelectorAll('.visualizer-bar');
  
  visualizerInterval = setInterval(() => {
    bars.forEach((bar, index) => {
      const height = Math.sin(Date.now() / 200 + index) * 20 + 35;
      bar.style.height = `${height}px`;
    });
  }, 50);
}

function stopVisualizer() {
  if (visualizerInterval) {
    clearInterval(visualizerInterval);
    visualizerInterval = null;
  }
  
  setTimeout(() => {
    visualizer.classList.remove('active');
    const bars = visualizer.querySelectorAll('.visualizer-bar');
    bars.forEach((bar, index) => {
      bar.style.height = `${25 + index * 2}px`;
    });
  }, 300);
}

// Shake animation for errors
function shakeButtom(button) {
  button.style.animation = 'shake 0.5s';
  setTimeout(() => {
    button.style.animation = '';
  }, 500);
}

// Add shake keyframe if not in CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space to toggle recording
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    micBtn.click();
  }
  // Enter to transcribe
  if (e.code === 'Enter' && !transcribeBtn.disabled) {
    e.preventDefault();
    transcribeBtn.click();
  }
});
