# Contributing Guide

Thank you for your interest in contributing to Earth Information Jukebox!

---

## Getting Started

### 1. Get Access to the Repository

The project is split into several repositories in the
[organization](https://github.com/The-Earth-Information-Jukebox-HEIG-VD):

| Repository | Content | Visibility |
|------------|---------|------------|
| [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp) | React frontend | public |
| [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification) | FastAPI backend + music engine | public |
| [datasets](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/datasets) | Pre-processed monthly maps | public |
| [data_processing](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/data_processing) | Dataset extraction scripts | public |
| [deployment](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/deployment) | Docker Compose orchestration | public |
| [documentation](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/documentation) | This site | public |

Team members push to the organization's repositories directly. External contributors can fork any of the
repositories and open a pull request.

### 2. Clone the Repository

```bash
git clone git@github.com:The-Earth-Information-Jukebox-HEIG-VD/webapp.git
cd webapp
```

Clone the repositories side by side: the webapp, the backend and the Docker setup reference their siblings
(`../datasets/data`, `../webapp`, `../sonification`).

### 3. Set Up Development Environment

Follow the [Development Setup Guide](../getting-started/development.md).

### 4. Create a Branch (for larger changes)

```bash
git checkout -b feature/your-feature-name
```

Small changes are committed directly to `main`; larger ones go through a short-lived branch and a pull request
(squash-merged, with the PR number in the subject, e.g. `(#10)`).

---

## Development Workflow

### Branch Naming

Suggested prefixes (the branches on the remotes so far use `feat/`, `fix/` and `docs/`, and some have no prefix):

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Test additions |
| `chore/` | Maintenance tasks |

Examples:
- `feature/add-volume-control`
- `fix/audio-playback-issue`
- `docs/update-api-reference`

### Commit Messages

The convention used in the code repositories: a short subject in the imperative saying what the change does,
and an optional body explaining why. Older commits start with a capital letter and have no type prefix; recent
ones mostly use one (`feat:`, `fix:`, `docs:`, `ci:`).

```
<Imperative summary of the change>

[optional body: why, and anything a reviewer should know]

[optional footer, e.g. Closes #42]
```

Examples from the history:

```
Add Docker support for containerized deployment
Connect webapp to the sonification backend and draw dataset dots on the globe
Split precipitation into rain and snow (monthly, 2000-2026)
Play each variable from its own dataset, lined up by date
```

The `documentation` repository uses a `docs:` prefix (e.g. `docs: update team page with roles and alphabetical ordering`).
Avoid catch-all commits such as `wip: ...`: one change per commit.

---

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`; `typescript-eslint`, `react-hooks`, `jsx-a11y`, zero warnings allowed)
- No formatter is configured in the repository; keep the style of the surrounding code
- Prefer function components and hooks; keep playback state outside React (see `audio/ChunkPlayer.ts`)
- API types live in `services/sonificationApi.ts` and mirror `sonification/backend/FRONTEND_API.md`

```typescript
// Good
// Illustrative: typed props, a function component, one CSS file next to it
import './StyleSelector.css';

interface StyleSelectorProps {
  value: string | undefined;
  onChange: (genre: string) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  // ...
}
```

### Python

- Follow PEP 8
- Use type hints (`from __future__ import annotations` is used throughout)
- Document modules and public functions with docstrings (the modules start with a usage docstring)
- Configuration comes from `JUKEBOX_*` environment variables; document new ones in `backend/API.md`
- Keep the frontend contract (`backend/FRONTEND_API.md`) and `webapp/src/services/sonificationApi.ts` in sync

```python
# Illustrative, after backend/app.py
def pick_dataset(variables: list[str] | None = None, start: str | None = None) -> str | None:
    """The dataset for a request that names none.

    It must have every requested variable; among those, prefer one whose dates cover `start`.
    """
    ...
```

### CSS

- One plain `.css` file per component (e.g. `TrackPanel.css`), no CSS Modules
- Use the CSS custom properties from `src/styles/variables.css` for theming (brand colours come from the logo; see "Visual identity" in `webapp/CLAUDE.md`)
- Text on a `--color-primary` (yellow) fill uses `--color-on-primary`; separate areas with surface tone and spacing rather than borders
- Mobile-first responsive design
- Ensure focus indicators on all interactive elements

```css
.button {
  /* Base styles */
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .button {
    /* Desktop styles */
  }
}
```

---

## Accessibility Requirements

All contributions must maintain WCAG 2.1 AA compliance.

### Checklist

Before submitting:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets requirements (4.5:1 for text)
- [ ] ARIA labels on icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Dynamic content uses aria-live regions
- [ ] Animations respect prefers-reduced-motion
- [ ] Screen reader testing performed

### Testing

```bash
# Run accessibility tests
npm run test:a11y

# Check in development (console warnings)
npm run dev
```

See [Accessibility Documentation](../user-guide/accessibility.md) for details.

---

## Testing Requirements

### Frontend

- Unit tests for utilities and hooks (Vitest, files next to the code: `*.test.ts(x)`)
- Component tests for UI components (Testing Library)
- Accessibility tests (`jest-axe`) for components; name them so they match "accessibility" (`npm run test:a11y`)

```bash
npm run test -- --run
npm run test:a11y
```

### Backend

- Unit tests for data processing (`backend/test_prepare_data.py`, `simulation/test_build_monthly_dataset.py`)
- Integration tests for API endpoints (`backend/test_api.py`, FastAPI `TestClient`)

```bash
python -m pytest backend simulation -q
```

!!! note
    There is no coverage target. The webapp has `@vitest/coverage-v8` (`npx vitest run --coverage`); the backend
    has no `pytest-cov`.

---

## Pull Request Process

### 1. Prepare Your Changes

```bash
# Update from main
git fetch origin
git rebase origin/main

# Run checks (webapp)
npm run lint
npx tsc --noEmit
npm run test -- --run

# Commit changes
git add .
git commit -m "feat: your feature"
```

### 2. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### 3. Suggested PR Description

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Fixed Y
- Updated Z

## Testing
- [ ] Unit tests added/updated
- [ ] Accessibility tests pass
- [ ] Manual testing performed

## Screenshots
(if applicable)

## Related Issues
Closes #123
```

### 4. Review Process

Run the checks locally before opening the PR: there is no CI test workflow (see [CI/CD](../deployment/ci-cd.md)).

---

## Issue Guidelines

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS version
- Screenshots if applicable

### Feature Requests

Include:
- Use case / problem being solved
- Proposed solution
- Alternatives considered

### Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `accessibility` | Barrier affecting people with disabilities |
| `documentation` | Improvements or additions to documentation |
| `question` | Further information is requested |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |

GitHub's other default labels (`duplicate`, `invalid`, `wontfix`) are also available.

---

## Development Tips

### Running Locally

```bash
# Start everything in Docker (webapp on http://localhost)
cd deployment
./scripts/run-local.sh

# Or run separately (two terminals)
cd sonification && JUKEBOX_MERGE_DATASETS=1 uvicorn backend.app:app --reload --port 8000
cd webapp && npm run dev
```

See [Development Setup](../getting-started/development.md) for the data preparation step.

### Debugging

- Use React DevTools for component inspection
- Use browser DevTools for audio debugging
- Check `console.log` statements (remove before PR)

### Documentation

- Update docs alongside code changes
- Preview documentation locally:
  ```bash
  cd documentation
  mkdocs serve      # http://127.0.0.1:8001
  ```

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

Positive behaviors:
- Using welcoming language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

Unacceptable behaviors:
- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement

Project maintainers will take appropriate action for any unacceptable behavior.

---

## Getting Help

- **Questions**: Open an issue with the `question` label (GitHub Discussions are not enabled)
- **Bugs**: Open an issue with the `bug` label
- **Features**: Open an issue with the `enhancement` label
