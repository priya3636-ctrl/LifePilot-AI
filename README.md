# LifePilot

A local-first personal productivity workspace with a FastAPI backend and Ollama-powered AI assistant.

## Requirements
- Python 3.10+
- Ollama installed and running
- Qwen model: `ollama pull qwen2.5:0.5b`

## Start the backend (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Open `index.html` in a browser. Keep Ollama and the backend running while using local AI chat.

## Notes
- Tasks and notes currently use browser local storage.
- AI chat is local to your computer; the backend calls Ollama at `http://localhost:11434`.
- This is a development setup, not a public deployment configuration.
