# Prerequisites

Required tools and versions for developing Earth Information Jukebox.

---

## Required Software

### Node.js

**Version**: 18.x or higher (LTS recommended)

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
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

=== "nvm (any platform)"

    ```bash
    nvm install 20
    nvm use 20
    ```

Verify installation:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

---

### Python

**Version**: 3.10 or higher

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
python3 --version  # Should be 3.10+
pip3 --version
```

---

### Docker (Optional but Recommended)

Docker simplifies running all services together.

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

## Optional Tools

### FFmpeg

Required for some audio processing features.

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

### IDE Recommendations

#### VS Code

Recommended extensions:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Python** - Python language support
- **Pylance** - Python IntelliSense
- **GitLens** - Git integration
- **Docker** - Docker support

```bash
# Install extensions via command line
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
```

#### PyCharm / WebStorm

JetBrains IDEs work well with both Python and TypeScript projects.

---

## Version Summary

| Tool | Minimum Version | Recommended |
|------|-----------------|-------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Python | 3.10 | 3.12 |
| Docker | 24.x | Latest |
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
