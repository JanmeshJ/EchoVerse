const uploadBtn = document.getElementById("uploadBtn");
const micBtn = document.getElementById("micBtn");
const transcribeBtn = document.getElementById("transcribeBtn");
const fileInput = document.getElementById("audioFile");
const statusEl = document.getElementById("status");
const resultDiv = document.getElementById("result");
const textEl = document.getElementById("transcribedText");
const detailsEl = document.getElementById("details");

let recordedBlob = null;
let mediaRecorder;
let chunks = [];

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    statusEl.textContent = `Selected: ${fileInput.files[0].name}`;
    transcribeBtn.disabled = false;
    recordedBlob = null;
  }
};

micBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    micBtn.textContent = "🎤 Record";
    statusEl.textContent = "Recording stopped.";
    transcribeBtn.disabled = false;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(chunks, { type: "audio/wav" });
    };

    mediaRecorder.start();
    micBtn.textContent = "⏹ Stop";
    statusEl.textContent = "Recording...";
    transcribeBtn.disabled = true;
  } catch (err) {
    alert("Microphone permission denied.");
  }
};

transcribeBtn.onclick = async () => {
  let blob = recordedBlob || fileInput.files[0];
  if (!blob) return alert("No audio file or recording found.");

  statusEl.textContent = "⏳ Processing...";
  transcribeBtn.disabled = true;
  resultDiv.classList.add("hidden");

  const formData = new FormData();
  formData.append("file", blob);

  const res = await fetch("/transcribe", { method: "POST", body: formData });
  const data = await res.json();

  textEl.textContent = data.text;
  detailsEl.textContent = `Language: ${data.language.toUpperCase()} | Time: ${data.time}s`;

  statusEl.textContent = "";
  transcribeBtn.disabled = false;
  resultDiv.classList.remove("hidden");
};
