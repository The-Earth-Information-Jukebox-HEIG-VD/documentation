# CI/CD Setup

Continuous Integration and Deployment with GitHub Actions.

---

## Overview

Each repository of the [organization](https://github.com/The-Earth-Information-Jukebox-HEIG-VD) carries its own
workflows. There is no test workflow and no automatic deployment of the application: images are published on
version tags, and the documentation is published on every push to `main`.

| Repository | Workflow | Trigger | Does |
|------------|----------|---------|------|
| `webapp` | `.github/workflows/docker-publish.yml` | tag `v*`, push to branch `fb-docker-support` | Build + push `ghcr.io/the-earth-information-jukebox-heig-vd/webapp` |
| `sonification` | `.github/workflows/docker-publish.yml` | tag `v*`, push to branch `fb-docker-support` | Build + push `ghcr.io/the-earth-information-jukebox-heig-vd/sonification` |
| `datasets` | `.github/workflows/docker-publish.yml` | tag `v*` | Build + push `ghcr.io/the-earth-information-jukebox-heig-vd/datasets` |
| `documentation` | `.github/workflows/deploy-pages.yml` | push to `main`, manual | Build MkDocs, deploy to GitHub Pages |
| `deployment`, `data_processing` | none | | |

```
git tag v* ──▶ docker-publish.yml ──▶ ghcr.io/.../<repo>:<version>, :<major.minor>, :latest
                                              │
                                              ▼
                     deployment: docker compose pull (*_VERSION in .env)

push main (documentation) ──▶ deploy-pages.yml ──▶ GitHub Pages
```

!!! info "Current state"
    Releases are tagged: the latest is `v1.4.0` in `webapp`, `sonification` and `datasets` (earlier:
    `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.3.0` in all three, plus `v1.0.1` in `webapp` and `v1.3.1` to `v1.3.3` in `sonification`).
    `documentation`, `deployment` and `data_processing` are tagged from `v1.0.0`, so their
    images are on GHCR. The `fb-docker-support` branches named in the
    webapp and sonification triggers no longer exist, so in practice only tags publish.

---

## Docker Image Workflows

`webapp`, `sonification` and `datasets` share the same structure (`docker-publish.yml`):

```yaml
name: Docker Build & Push

on:
  push:
    tags:
      - 'v*'
    branches:
      - 'fb-docker-support'   # webapp and sonification only, for testing the workflow

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}   # e.g. The-Earth-Information-Jukebox-HEIG-VD/webapp

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4                 # datasets: plain checkout, see below
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3              # GITHUB_TOKEN, no extra secret
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}         # v1.0.0 → 1.0.0
            type=semver,pattern={{major}}.{{minor}} # v1.0.0 → 1.0
            type=raw,value=latest,enable=${{ startsWith(github.ref, 'refs/tags/') }}
            type=ref,event=branch                   # webapp / sonification: branch name
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha                      # webapp / sonification
          cache-to: type=gha,mode=max
          build-args: |
            VITE_API_URL=/api                       # webapp only
```

Differences between the three:

- **webapp**: build arg `VITE_API_URL=/api`, GitHub Actions layer cache, branch tag.
- **sonification**: GitHub Actions layer cache, branch tag; builds without `WITH_VSCO` (SoundFont only, no orchestral samples).
- **datasets**: tag-only trigger, always tags `latest`, no layer cache, and two extra steps because `data/` is ~9.1 GB:
  a **Free disk space** step before the checkout (removes preinstalled SDKs the image never uses, prunes Docker images,
  drops the swap file: ~25 GB freed) and, after a plain `actions/checkout@v4` (no LFS: the data is plain Git), a
  **Remove git metadata** step (`rm -rf .git`, a ~1.3 GB pack that `.dockerignore` excludes anyway).

Image names are lowercased by `docker/metadata-action`, which gives the
`ghcr.io/the-earth-information-jukebox-heig-vd/<repo>` names used in `deployment/docker-compose.yml`.

---

## Releasing Images

Push a semver tag in **each** repository whose image you want to publish:

```bash
# in webapp/, sonification/ and datasets/
git tag v1.5.0
git push origin v1.5.0
```

Each push produces `:1.5.0`, `:1.5` and `:latest` (the version variables in `.env` take the tag without the `v`, e.g. `1.5.0`). Then, on the server, set `WEBAPP_VERSION`, `SONIFICATION_VERSION` and
`DATASETS_VERSION` in `deployment/.env` and pull (see [Production](production.md#updating)). Each image has its own
version, so the webapp, the backend and the data can be released independently.

!!! note
    The `datasets` image contains all of `datasets/data` (~9.1 GB at the moment); expect a long build and push.
    Packages created from private repositories are private: deployment hosts need `docker login ghcr.io`.

Watch the runs:

```bash
gh run list -R The-Earth-Information-Jukebox-HEIG-VD/webapp
gh run view --log -R The-Earth-Information-Jukebox-HEIG-VD/webapp
```

---

## Documentation Deployment

Auto-deploys these docs on every push to `main` (or by hand from the Actions tab).

```yaml
# documentation/.github/workflows/deploy-pages.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install mkdocs-material

      - name: Build documentation
        run: mkdocs build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: site/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Published at <https://the-earth-information-jukebox-heig-vd.github.io/documentation>. The repository's Pages source
must be set to **GitHub Actions** (Settings → Pages).

---

## Tests and Linting

There is **no CI test workflow** on GitHub. Run the checks locally before pushing:

```bash
# webapp
npm run lint
npx tsc --noEmit
npm run test -- --run

# sonification
python -m pytest backend simulation -q
```

!!! note "GitLab CI leftover"
    `webapp/.gitlab-ci.yml` defines lint / typecheck / test / build stages and a GitLab Pages deploy on tags.
    The repository is hosted on GitHub, so this pipeline does not run.

---

## Secrets Configuration

None needed: the image workflows authenticate to GHCR with the built-in `GITHUB_TOKEN` (`packages: write`), and
the Pages workflow uses OIDC (`id-token: write`).

---

## Troubleshooting

### Workflow did not start

- Check the tag matches `v*` and was pushed (`git push origin <tag>`, not only `git push`).
- `gh run list -R The-Earth-Information-Jukebox-HEIG-VD/<repo>`

### Build Failures

Reproduce locally:

```bash
docker build -t test-webapp ../webapp
docker build -t test-sonification ../sonification
docker build --check ../webapp          # Dockerfile lint (BuildKit)
```

### Push denied to GHCR

The workflow needs `packages: write` (set in the file). If the package already exists and is linked to another
repository, grant this repository write access in the package settings.

---

## Next Steps

- [Docker Deployment](docker.md)
- [Production Deployment](production.md)
