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

# Create a non-root user (compatible with Hugging Face Spaces UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, guideline documents, and scripts
COPY backend/ ./backend/

# Copy built frontend into container
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure permissions for non-root user
RUN chown -R user:user /app

USER user

# Configure environment variables (7860 is default for Hugging Face Spaces)
ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=7860
ENV PORT=7860
EXPOSE 7860

# Ingest initial guideline documents and start server
CMD python backend/scripts/ingest.py && uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-7860}
