from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from faster_whisper import WhisperModel
import time
import tempfile
import os

app = FastAPI(title="EchoVerse: Real-Time Speech Intelligence")

# Mount static assets and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Load model once at startup
model = WhisperModel("tiny", device="cpu")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    start = time.time()
    segments, info = model.transcribe(tmp_path, beam_size=1, without_timestamps=True)
    text = " ".join([seg.text for seg in segments])
    duration = time.time() - start

    os.remove(tmp_path)

    return JSONResponse({
        "text": text,
        "language": info.language,
        "time": round(duration, 2)
    })


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

