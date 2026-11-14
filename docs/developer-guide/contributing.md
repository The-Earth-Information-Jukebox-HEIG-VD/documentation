# Contributing Guide

Thank you for your interest in contributing to Earth Information Jukebox!

---

## Getting Started

### 1. Fork the Repository

Fork the repository you want to contribute to:

- [webapp](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/webapp)
- [sonification](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/sonification)
- [documentation](https://github.com/The-Earth-Information-Jukebox-HEIG-VD/documentation)

### 2. Clone Your Fork

```bash
git clone git@github.com:YOUR_USERNAME/webapp.git
cd webapp
```

### 3. Set Up Development Environment

Follow the [Development Setup Guide](../getting-started/development.md).

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Branch Naming

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

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:

```
feat(audio): add volume control slider

Adds a range input for controlling playback volume.
The volume state is persisted in localStorage.

Closes #42
```

```
fix(a11y): ensure focus visible on all buttons

Buttons were missing focus indicators after
CSS refactor. Added explicit :focus-visible styles.
```

---

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting
- Prefer functional components and hooks
- Export types alongside implementations

```typescript
// Good
export interface AudioPlayerProps {
  data: ClimateDataPoint[];
  onProgress?: (index: number) => void;
}

export const AudioPlayer: FC<AudioPlayerProps> = ({ data, onProgress }) => {
  // ...
};
```

### Python

- Follow PEP 8
- Use type hints
- Document public functions with docstrings
- Use async/await for I/O operations

```python
async def fetch_data(
    start_year: int,
    end_year: int,
    *,
    cache: bool = True
) -> list[DataPoint]:
    """
    Fetch climate data for the given year range.

    Args:
        start_year: First year to fetch
        end_year: Last year to fetch (inclusive)
        cache: Whether to use cached data

    Returns:
        List of data points

    Raises:
        ValueError: If start_year > end_year
    """
    ...
```

### CSS

- Use CSS Modules for component styles
- Use CSS custom properties for theming
- Mobile-first responsive design
- Ensure focus indicators on all interactive elements

```css
.button {
  /* Base styles */
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.button:focus-visible {
  outline: 3px solid var(--color-primary);
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

- Unit tests for utilities and hooks
- Component tests for UI components
- Accessibility tests for all components
- Aim for 80% coverage

```bash
npm run test
npm run test:a11y
npm run test -- --coverage
```

### Backend

- Unit tests for data processing
- Integration tests for API endpoints
- Aim for 80% coverage

```bash
pytest
pytest --cov
```

---

## Pull Request Process

### 1. Prepare Your Changes

```bash
# Update from main
git fetch origin
git rebase origin/main

# Run tests
npm run lint
npm run test

# Commit changes
git add .
git commit -m "feat: your feature"
```

### 2. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### 3. PR Template

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

1. Automated checks run (lint, tests, build)
2. Team member reviews code
3. Address feedback
4. PR is merged when approved

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
| `feature` | New feature request |
| `accessibility` | Accessibility improvement |
| `documentation` | Documentation update |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |

---

## Development Tips

### Running Locally

```bash
# Start both frontend and backend
cd deployment
docker compose up

# Or run separately
cd webapp && npm run dev
cd sonification/backend && uvicorn backend.app:app --reload
```

### Debugging

- Use React DevTools for component inspection
- Use browser DevTools for audio debugging
- Check `console.log` statements (remove before PR)

### Documentation

- Update docs alongside code changes
- Preview documentation locally:
  ```bash
  cd documentation
  mkdocs serve
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

- **Questions**: Open a discussion on GitHub
- **Bugs**: Open an issue with the `bug` label
- **Features**: Open an issue with the `feature` label

---

## Recognition

Contributors are recognized in:
- Repository contributors list
- Release notes
- Project documentation

Thank you for contributing to making climate data accessible!
