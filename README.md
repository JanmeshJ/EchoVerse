# 🎧 EchoVerse: Real-Time Speech Intelligence

**Live Demo:** [https://echoverse-593998396101.us-central1.run.app](https://echoverse-593998396101.us-central1.run.app)

---

### 🧩 Overview
EchoVerse is a **production-grade Speech-to-Text web app** built using **FastAPI** and **OpenAI Whisper** (via Faster-Whisper).  
It enables users to record or upload audio, perform real-time transcription, and visualize results through a clean web UI.

---

### 🧱 Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend API** | FastAPI |
| **Model** | Faster-Whisper (OpenAI Whisper Tiny) |
| **Deployment** | Docker + Google Cloud Run |
| **CI/CD** | Google Cloud Build (cloudbuild.yaml) |

---

### 🚀 Key Features
- 🎤 **Record or upload audio**
- ⚙️ **Real-time Whisper inference** on CPU or GPU
- 🧠 **Automatic language detection**
- ☁️ **Dockerized & deployed on Google Cloud Run**
- 💡 **Fully serverless, scalable architecture**

---

### 📦 Run Locally
```bash
pip install fastapi uvicorn python-multipart faster-whisper jinja2
python main.py
