# Initial Setup Guide

This guide walks you through the initial setup for the portfolio project.

## For Developer 1 (Lead)

✅ **Already completed:**
- Next.js 16 project initialized
- Git repository created
- Core libraries and hooks built
- Components created
- Documentation written

**Next steps:**

1. **Set up Are.na**
   - Go to [are.na](https://www.are.na) and create account
   - Create channel: `studio_main`
   - Get API token from [are.na/settings/token](https://www.are.na/settings/token)
   - See [ARENA_SETUP.md](./ARENA_SETUP.md) for detailed content structure

2. **Update `.env.local`**
   ```bash
   ARENA_TOKEN=<your_token_from_are.na>
   ARENA_MAIN_CHANNEL=studio_main
   SITE_TITLE=<Your Studio Name>
   SITE_DOMAIN=<yourdomain.com>
   REVALIDATE_SECRET=<generate_with:_node_-e_"console.log(require('crypto').randomBytes(32).toString('base64'))">
   ```

3. **Share credentials securely**
   - Option A: Use 1Password (create vault, share access link)
   - Option B: Use Bitwarden (create team vault)
   - Option C: Use LastPass (share vault)
   - Store `.env.local` values in team vault
   - Share access with Developer 2

4. **Test locally**
   ```bash
   npm install
   npm run dev
   # Visit http://localhost:3000
   ```

5. **Create GitHub repository**
   - Create repo on GitHub (e.g., `ericfhchen/portfolio`)
   - Push existing code:
   ```bash
   git remote add origin https://github.com/org/repo.git
   git push -u origin main
   git push -u origin develop
   ```

6. **Set up GitHub branch protection**
   - Go to repo Settings → Branches
   - Add rule for `main`:
     - ✓ Require pull request reviews
     - ✓ Require status checks to pass
     - ✓ Require branches to be up to date

7. **Set up Vercel deployment**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Select `main` branch
   - Add environment variables (from team vault)
   - Set custom domain (if applicable)

---

## For Developer 2 (Partner)

**To get started:**

1. **Clone repository**
   ```bash
   git clone https://github.com/org/repo.git
   cd portfolio
   ```

2. **Get `.env.local` values**
   - Developer 1 will share vault access (1Password/Bitwarden/LastPass)
   - Copy environment variable values to local `.env.local` file:
   ```bash
   # Create .env.local with values from vault
   ARENA_TOKEN=<from_vault>
   ARENA_MAIN_CHANNEL=studio_main
   SITE_TITLE=<from_vault>
   SITE_DOMAIN=<from_vault>
   REVALIDATE_SECRET=<from_vault>
   ```

3. **Install and test**
   ```bash
   npm install
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Ready to develop!**
   - Create feature branch: `git checkout -b feature/your-feature`
   - See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines

---

## Environment Setup

The project is configured to work in:

- **Local development**: `npm run dev` on localhost:3000
- **Production build**: `npm run build` then `npm run start`
- **Vercel**: Auto-deploys from `main` branch

Key environment variables (see `.env.local`):

| Variable | Purpose | Example |
|----------|---------|---------|
| `ARENA_TOKEN` | Are.na API authentication | `abc123...` |
| `ARENA_MAIN_CHANNEL` | Are.na content channel | `studio_main` |
| `SITE_TITLE` | Site title in metadata | `My Studio` |
| `SITE_DOMAIN` | Site domain in metadata | `studio.com` |
| `REVALIDATE_SECRET` | Cache invalidation token | `xyz789...` |

---

## Project Structure

```
portfolio/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Hero.tsx      # Hero section with gyroscope
│   │   ├── IdleImage.tsx # Idle detection + image display
│   │   └── AnimatedText.tsx # Text animations
│   ├── hooks/            # Custom React hooks
│   │   ├── useGyroscope.ts
│   │   └── useIdleDetection.ts
│   └── lib/              # Utilities & API clients
│       ├── arena.ts      # Are.na API client
│       ├── content.ts    # Content fetching
│       └── site.ts       # Site configuration
├── public/               # Static assets
├── .env.local            # Local env vars (not committed)
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
├── README.md             # Project overview
├── CONTRIBUTING.md       # Dev guidelines
├── ARENA_SETUP.md        # Are.na content guide
└── SETUP.md              # This file
```

---

## Quick Reference

### Development Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat(component): add feature"

# Push to remote
git push -u origin feature/your-feature

# Create pull request on GitHub
# Request review from team
# Address feedback
# Merge to develop after approval

# Deploy to production
# Create PR: develop → main
# Get approval
# Merge (auto-deploys to Vercel)
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` and `npm run build` locally first |
| Dev server won't start | Check `.env.local` exists and `ARENA_TOKEN` is valid |
| Images not loading | Verify Are.na channel is public, check channel name in `.env.local` |
| TypeScript errors | Run `npm run lint` and fix type errors |
| Port 3000 in use | Kill process: `lsof -ti:3000 | xargs kill -9` |

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Are.na API](https://www.are.na/api/documentation)
- [TypeScript](https://www.typescriptlang.org)
- [Vercel Docs](https://vercel.com/docs)

---

## Questions?

Check these files:
- **Project overview**: [README.md](./README.md)
- **Dev guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Are.na setup**: [ARENA_SETUP.md](./ARENA_SETUP.md)
- **GitHub issues**: Create an issue for questions/blockers

Good luck! 🚀
