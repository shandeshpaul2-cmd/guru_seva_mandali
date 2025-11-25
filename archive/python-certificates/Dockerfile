# Certificate Generator Service Dockerfile

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for WeasyPrint and Playwright
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser
RUN python -m playwright install chromium
RUN python -m playwright install-deps chromium

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p output templates test_downloads

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV CERTIFICATE_PORT=5001

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Run the application
CMD ["python", "app.py"]