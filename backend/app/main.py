from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routes import router

app = FastAPI(
    title="LungGuide AI",
    description="Evidence-grounded RAG assistant for lung cancer screening",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Serve built frontend in production if dist/ exists
frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = Path(__file__).resolve().parents[1] / "static"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target = frontend_dist / full_path
        if target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root() -> dict:
        return {
            "name": "LungGuide AI",
            "tagline": "Evidence-Grounded Lung Cancer Screening Assistant",
            "docs": "/docs",
        }

