import uvicorn
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Starting DataLens AI Backend server on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
