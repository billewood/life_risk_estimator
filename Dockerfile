# Dockerfile for Railway - Python backend only
FROM python:3.12-slim

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Expose port
EXPOSE 5001

# Start the Flask app
CMD ["python", "api/mortality_api.py"]
