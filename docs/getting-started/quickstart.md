# Quick Start

Get Earth Information Jukebox running locally in 5 minutes.

---

## Option 1: Docker (Recommended)

The fastest way to get everything running:

```bash
# Clone the deployment repository
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment.git
cd deployment

# Start all services
docker compose up -d

# Open the application
open http://localhost:5173
```

That's it! The application is now running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Option 2: Manual Setup

### Backend

```bash
# Clone the sonification repository
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification.git
cd sonification/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn backend.app:app --reload --port 8000
```

### Frontend

In a new terminal:

```bash
# Clone the webapp repository
git clone https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp.git
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Verify Installation

### 1. Check the Backend

Visit http://localhost:8000/docs to see the interactive API documentation.

Test the health endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "datasets": 1,
  "audio_available": true
}
```

### 2. Check the Frontend

Visit http://localhost:5173. You should see:

- The Earth Information Jukebox interface
- A map or data selector
- Audio playback controls

### 3. Test Sonification

1. Select a region (or use the default)
2. Click the **Play** button
3. You should hear the climate data as music!

---

## Troubleshooting

### Port already in use

If port 8000 or 5173 is in use:

```bash
# Backend: use a different port
uvicorn backend.app:app --reload --port 8001

# Frontend: Vite will automatically use next available port
```

### CORS errors

The backend allows all origins by default (`JUKEBOX_CORS=*`). If you still see CORS errors, ensure the backend is running.

### No audio

- Check that your browser isn't blocking autoplay
- Click somewhere on the page first (browsers require user interaction before audio)
- Check your system volume

### Dependencies fail to install

=== "Python"

    ```bash
    # Upgrade pip
    pip install --upgrade pip

    # Install build tools (macOS)
    xcode-select --install

    # Install build tools (Ubuntu)
    sudo apt-get install python3-dev build-essential
    ```

=== "Node.js"

    ```bash
    # Clear npm cache
    npm cache clean --force

    # Delete node_modules and reinstall
    rm -rf node_modules package-lock.json
    npm install
    ```

---

## Next Steps

- [Prerequisites](prerequisites.md) - Required tools and versions
- [Development Setup](development.md) - Full development environment
- [Architecture Overview](../architecture/overview.md) - Understand the system
