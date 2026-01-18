# Contributing Guidelines

## Branch Strategy

We use a Git flow strategy:

- **main**: Production-ready code. Deploys automatically to Vercel.
- **develop**: Integration branch for team development
- **feature/\***: Individual feature branches

### Creating a Branch

```bash
# Update develop branch first
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Push to remote
git push -u origin feature/your-feature-name
```

### Branch Naming Convention

- `feature/add-gyroscope-support` - New features
- `bugfix/fix-idle-detection` - Bug fixes
- `docs/update-setup-guide` - Documentation
- `perf/optimize-images` - Performance improvements
- `refactor/improve-hooks` - Code refactoring

## Commit Messages

Use Conventional Commits for clear, structured commit history:

```
<type>(<scope>): <subject>

<body>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Tests
- **chore**: Build/tooling changes

### Scope

- **component**: Hero, IdleImage, AnimatedText, etc.
- **hook**: useGyroscope, useIdleDetection
- **lib**: arena.ts, content.ts, site.ts
- **app**: Layout, page structure
- **config**: Next.js or environment configuration

### Examples

```bash
git commit -m "feat(component): add gyroscope tilt effect to hero"
git commit -m "fix(hook): handle missing DeviceOrientationEvent"
git commit -m "docs(readme): update quick start guide"
git commit -m "perf(images): optimize image loading with ISR"
git commit -m "refactor(lib): extract image URL logic"
```

## Pull Request Process

1. **Create PR to develop** (not main)

```bash
# After pushing your feature branch
# Open PR on GitHub to merge into develop
```

2. **PR Description**

Include:
- What changes were made
- Why the changes were needed
- Testing performed
- Any breaking changes

3. **Code Review**

- Request review from at least one team member
- Address feedback and push new commits
- Maintain branch history (no force pushes)

4. **Merge**

- Rebase and merge to keep history clean
- Delete branch after merging
- Verify tests pass before merging

5. **Deploy to Production**

When ready for production:

```bash
# Create PR: develop → main
# Get approval from team lead
# Merge to main (auto-deploys to Vercel)
```

## Code Style

### TypeScript

- Use strict mode (enabled in `tsconfig.json`)
- Type all function parameters and returns
- Avoid `any` type
- Use interfaces for object shapes

### React

- Use functional components
- Use `'use client'` for client-side components
- Use `'use server'` for server-side utilities
- Prefer hooks over class components

### Tailwind CSS

- Use Tailwind utilities for styling
- Keep component styles scoped
- Avoid inline styles where possible

### File Organization

```
src/
├── components/  # React components
├── hooks/       # Custom hooks
├── lib/         # Utilities, API clients
└── app/         # Next.js pages & layout
```

## Before Submitting PR

1. Run linter:

```bash
npm run lint
```

2. Test locally:

```bash
npm run dev
# Test features in browser
```

3. Build locally:

```bash
npm run build
```

4. Check for:
   - Broken links or imports
   - Console errors/warnings
   - TypeScript errors
   - Responsive design on mobile

## Secrets & Environment Variables

- **Never commit `.env.local`** - Already in `.gitignore`
- **Never commit credentials** - Use vault for team sharing
- Store Are.na tokens and secrets in 1Password/Bitwarden

## Questions?

Check documentation:

- [README.md](./README.md) - Project overview
- [ARENA_SETUP.md](./ARENA_SETUP.md) - Are.na content setup
- Existing code and comments

## Team Responsibilities

### Developer 1 (Lead)
- Code review partner's PRs
- Approve production deployments
- Maintain documentation

### Developer 2 (Partner)
- Request code reviews
- Communicate blockers
- Suggest improvements

---

**Good luck! Let's build something great together!** 🚀
