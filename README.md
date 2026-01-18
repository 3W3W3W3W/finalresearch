# Studio Portfolio

Modern landing page built with Next.js 16, React 19, TypeScript, and Are.na CMS.

## Features

- **Interactive Gyroscope**: iPhone tilt detection for 3D hero image effects
- **Idle Detection**: Displays random images after 10 seconds of user inactivity
- **Text Animations**: Smooth fade-in animations on scroll
- **Are.na CMS**: All content and images managed through Are.na API
- **ISR Caching**: Incremental Static Regeneration for optimal performance
- **Mobile Responsive**: Fully responsive design for all devices
- **TypeScript**: Full type safety throughout the codebase

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.x with latest features
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Image Optimization**: Sharp 33.x
- **CMS**: Are.na (API-based)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` with values from your team vault:

```bash
ARENA_TOKEN=your_arena_token
ARENA_MAIN_CHANNEL=studio_main
SITE_TITLE=Your Studio Name
SITE_DOMAIN=yourdomain.com
REVALIDATE_SECRET=your_revalidate_secret
```

4. Start development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx   # Root layout with metadata
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles & animations
├── components/       # React components
│   ├── Hero.tsx     # Hero section with gyroscope
│   ├── IdleImage.tsx # Idle image display
│   └── AnimatedText.tsx # Animated text component
├── hooks/           # Custom React hooks
│   ├── useGyroscope.ts # Device orientation
│   └── useIdleDetection.ts # Idle timeout
└── lib/             # Utilities & API clients
    ├── arena.ts     # Are.na API client
    ├── content.ts   # Content fetching
    └── site.ts      # Site configuration
```

## Environment Variables

See `.env.local` (not committed). Template in `env.example`:

- `ARENA_TOKEN`: Are.na API token ([get here](https://www.are.na/settings/token))
- `ARENA_MAIN_CHANNEL`: Are.na channel slug for content
- `SITE_TITLE`: Site title for metadata
- `SITE_DOMAIN`: Site domain for metadata
- `REVALIDATE_SECRET`: Secret for manual cache invalidation

## Development

### Build for production:

```bash
npm run build
```

### Run production build locally:

```bash
npm run start
```

### Lint code:

```bash
npm run lint
```

## Are.na Setup

See [ARENA_SETUP.md](./ARENA_SETUP.md) for detailed Are.na content structure.

## Team Collaboration

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, and PR process.

## Deployment

This project auto-deploys to Vercel on pushes to `main` branch. See Vercel project settings for:

- Environment variables
- Custom domain configuration
- Deployment logs

## Performance

- ISR cache revalidation: 300 seconds
- Image formats: WebP, AVIF with fallback
- Lazy loading enabled for all images
- Server-side rendering for initial load

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `.env.local` not found | Get values from team vault (1Password/Bitwarden) |
| Are.na API 401 | Verify `ARENA_TOKEN` in `.env.local` |
| Gyroscope not working | Ensure HTTPS (or localhost), iOS 13+, permissions granted |
| Images not loading | Check Are.na channel is public, verify URL patterns in `next.config.ts` |
| Build fails | Run `npm install` and `npm run build` locally first |

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Are.na API](https://www.are.na/api/documentation)
- [Vercel Docs](https://vercel.com/docs)

## License

Private project. All rights reserved.
