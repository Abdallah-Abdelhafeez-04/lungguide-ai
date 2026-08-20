# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend runtime
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, guideline documents, and scripts
COPY backend/ ./backend/

# Copy built frontend into container
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Configure environment variables
ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=8000
ENV PORT=8000
EXPOSE 8000

# Ingest initial guideline documents and start server
CMD python backend/scripts/ingest.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}
