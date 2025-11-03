FROM python:3.10-slim

WORKDIR /app

# 1. Install dependencies (including ffmpeg)
RUN apt-get update && apt-get install -y ffmpeg && \
    pip install --no-cache-dir fastapi uvicorn python-multipart faster-whisper jinja2

# 2. *** CRITICAL FIX: Pre-download the 'tiny' Whisper model weights ***
# This downloads the model during the *build* so the container startup is fast.
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu')"

# 3. Copy application code
COPY . /app

EXPOSE 8080
CMD ["python", "main.py"]