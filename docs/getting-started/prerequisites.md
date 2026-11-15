# Prerequisites

Required tools and versions for developing Earth Information Jukebox.

---

## Required Software

### Node.js

**Version**: 20.x or higher; 22 LTS recommended (the webapp Docker image builds with `node:22-alpine`)

=== "macOS (Homebrew)"

    ```bash
    brew install node
    ```

=== "Windows (Chocolatey)"

    ```bash
    choco install nodejs-lts
    ```

=== "Ubuntu/Debian"

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

=== "nvm (any platform)"

    ```bash
    nvm install 22
    nvm use 22
    ```

Verify installation:
```bash
node --version  # Should be v20.x or higher
npm --version
```

---

### Python

**Version**: 3.12 recommended (the backend Docker image uses `python:3.12-slim`)

!!! note
    The Docker image is the only tested setup. Other versions may lack pre-built wheels for some packages
    (e.g. `tinysoundfont`), which then need a C compiler.

=== "macOS (Homebrew)"

    ```bash
    brew install python@3.12
    ```

=== "Windows"

    Download from [python.org](https://www.python.org/downloads/)

=== "Ubuntu/Debian"

    ```bash
    sudo apt-get install python3.12 python3.12-venv python3-pip
    ```

Verify installation:
```bash
python3 --version  # 3.12 recommended
pip3 --version
```

---

### Docker (Optional but Recommended)

Docker runs the whole stack (webapp + backend + data) with one command, see [Quick Start](quickstart.md).
You need the Compose v2 plugin (`docker compose`).

=== "macOS"

    Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

=== "Windows"

    Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

=== "Linux"

    ```bash
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    # Log out and back in
    ```

Verify installation:
```bash
docker --version
docker compose version
```

---

### Git

=== "macOS"

    ```bash
    # Usually pre-installed, or:
    brew install git
    ```

=== "Windows"

    Download from [git-scm.com](https://git-scm.com/download/win)

=== "Linux"

    ```bash
    sudo apt-get install git
    ```

Verify installation:
```bash
git --version
```

---

### FFmpeg (backend, outside Docker)

The backend encodes the audio chunks to MP3 with `ffmpeg`; without it on the `PATH` it falls back to WAV
(`GET /api/health` reports `mp3_encoding: false`). Not needed with Docker: the backend image includes it.

=== "macOS"

    ```bash
    brew install ffmpeg
    ```

=== "Windows"

    ```bash
    choco install ffmpeg
    ```

=== "Linux"

    ```bash
    sudo apt-get install ffmpeg
    ```

---

### Disk Space

The `datasets` repository holds ~9.1 GB of monthly maps (`datasets/data`), and the backend writes the converted
datasets to its cache. Plan for at least 12 GB free; the Docker images add ~1 GB.

---

## Optional Tools

### MkDocs (documentation)

```bash
pip install mkdocs-material
cd documentation && mkdocs serve      # http://127.0.0.1:8001 (port 8000 is the API)
```

---

### IDE Recommendations

#### VS Code

Recommended extensions:

- **ESLint** - JavaScript/TypeScript linting (the webapp uses ESLint 9 with `jsx-a11y`)
- **Python** - Python language support
- **Pylance** - Python IntelliSense
- **GitLens** - Git integration
- **Docker** - Docker support

```bash
# Install extensions via command line
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
```

#### PyCharm / WebStorm

JetBrains IDEs work well with both Python and TypeScript projects.

---

## Version Summary

| Tool | Minimum Version | Recommended |
|------|-----------------|-------------|
| Node.js | 20.x | 22.x LTS |
| Python | 3.12 (tested) | 3.12 |
| FFmpeg | any | Latest |
| Docker + Compose v2 | Compose 2.x | Latest |
| Git | 2.x | Latest |

---

## Checking All Prerequisites

Run this script to verify your environment:

```bash
#!/bin/bash

echo "Checking prerequisites..."

# Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js: $(node --version)"
else
    echo "✗ Node.js: Not installed"
fi

# npm
if command -v npm &> /dev/null; then
    echo "✓ npm: $(npm --version)"
else
    echo "✗ npm: Not installed"
fi

# Python
if command -v python3 &> /dev/null; then
    echo "✓ Python: $(python3 --version)"
else
    echo "✗ Python: Not installed"
fi

# pip
if command -v pip3 &> /dev/null; then
    echo "✓ pip: $(pip3 --version | cut -d' ' -f2)"
else
    echo "✗ pip: Not installed"
fi

# FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✓ FFmpeg: $(ffmpeg -version | head -1 | cut -d' ' -f3)"
else
    echo "○ FFmpeg: Not installed (needed for MP3 outside Docker)"
fi

# Docker
if command -v docker &> /dev/null; then
    echo "✓ Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    echo "○ Docker: Not installed (optional)"
fi

# Git
if command -v git &> /dev/null; then
    echo "✓ Git: $(git --version | cut -d' ' -f3)"
else
    echo "✗ Git: Not installed"
fi

echo "Done!"
```

---

## Next Steps

- [Quick Start](quickstart.md) - Get running quickly
- [Development Setup](development.md) - Full development environment
