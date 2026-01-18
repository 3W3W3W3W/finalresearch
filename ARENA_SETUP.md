# Are.na Content Setup Guide

This guide explains how to set up and manage content in Are.na for the studio portfolio.

## Overview

The portfolio pulls all content from a single Are.na channel: **studio_main**

Content is organized by **block titles**, which the app uses to identify and display content in specific locations.

## Getting Started with Are.na

1. Go to [are.na](https://www.are.na)
2. Sign up or log in
3. Create a new channel named `studio_main`
4. Get your API token from [are.na/settings/token](https://www.are.na/settings/token)
5. Add token to `.env.local` as `ARENA_TOKEN`

## Channel Structure: studio_main

Create these blocks in your `studio_main` channel:

### Text Blocks

#### hero_text

**Title**: `hero_text`
**Type**: Text block
**Purpose**: Main landing page headline

**Content example**:
```
Welcome to Our Studio

We create beautiful digital experiences
```

**Usage**: Displays in hero section as main heading

---

#### contact

**Title**: `contact`
**Type**: Text block
**Purpose**: Contact information

**Content example**:
```
Get in Touch

Email: hello@studio.com
Instagram: @our_studio
Website: studio.com
```

**Usage**: Displayed below hero with fade-in animation

### Image Blocks

#### hero_image

**Title**: `hero_image`
**Type**: Image block
**Purpose**: Hero section background image

**Recommended specs**:
- Size: 1920x1080 or larger
- Format: JPG, PNG, or WebP
- Aspect ratio: 16:9 (landscape)

**Features**:
- Responds to iPhone gyroscope tilt effect
- Optimized with WebP/AVIF formats
- Lazy loaded

---

#### idle_images (Multiple blocks)

**Title**: `idle_images` (create multiple blocks with same title)
**Type**: Image block
**Purpose**: Random images shown after 10s of user inactivity

**Recommended specs**:
- Size: 512x512 or 1024x1024
- Format: JPG, PNG, or WebP
- Aspect ratio: Square (1:1)

**How it works**:
- Portfolio picks random image from all blocks titled `idle_images`
- Appears in bottom-right corner after 10 seconds of inactivity
- Fades in with animation
- Disappears on user interaction

**Example setup**:
Create 3-5 image blocks, all titled `idle_images`:
1. Studio photo
2. Project screenshot
3. Team photo
4. Product shot
5. Behind-the-scenes image

## Managing Content

### Adding Blocks to Channel

1. Go to your `studio_main` channel
2. Click "Add blocks"
3. Choose content type (Text or Image)
4. Fill in content
5. **Important**: Add the correct **title** (hero_text, hero_image, idle_images, contact)
6. Click "Add to channel"

### Editing Content

1. Find block in channel
2. Click edit (pencil icon)
3. Update content or image
4. Save changes
5. Changes appear on site within 5 minutes (ISR cache)

### Deleting Content

1. Find block in channel
2. Click menu (three dots)
3. Select "Remove from channel"
4. Site updates automatically

### Reordering Blocks

The portfolio doesn't display blocks in order, so you can organize your channel however you like for management purposes.

## Caching & Updates

### Incremental Static Regeneration (ISR)

- Cache revalidates every 5 minutes
- Changes appear automatically within 5 minutes
- No manual deployment needed

### Manual Revalidation

To trigger immediate update (if you have access to revalidation API):

```bash
# Contact team lead for revalidation URL
# Typically: your-domain.com/api/revalidate?secret=REVALIDATE_SECRET
```

## Content Best Practices

### Text Content

- Keep hero_text short and impactful (1-3 lines)
- Use contact block for all contact information
- HTML formatting supported in text blocks

### Image Content

- Use consistent styling/color palette
- Optimize images before uploading (use TinyPNG, Squoosh, etc.)
- Maintain consistent aspect ratios
- Test on mobile to ensure visibility

### Block Titles

- Use exact titles: `hero_text`, `hero_image`, `idle_images`, `contact`
- Titles are case-sensitive
- No spaces before/after title

## Troubleshooting

### Images Not Showing

1. **Check Are.na channel is public**
   - Channel settings → Make public

2. **Verify image URLs work**
   - Copy image URL from Are.na
   - Paste in browser to test

3. **Check title spelling**
   - `hero_image` not `hero-image` or `Hero Image`
   - Must be exact match

### Content Not Updating

1. **Check ARENA_TOKEN in `.env.local`**
   - Regenerate token at [are.na/settings/token](https://www.are.na/settings/token)

2. **Check ARENA_MAIN_CHANNEL variable**
   - Should be `studio_main`

3. **Wait for ISR cache**
   - Changes appear within 5 minutes
   - Hard refresh browser (Cmd+Shift+R)

4. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for API errors in console

### Are.na API Errors

**401 Unauthorized**:
- Token expired or invalid
- Generate new token at [are.na/settings/token](https://www.are.na/settings/token)

**404 Not Found**:
- Channel name incorrect
- Make sure channel is `studio_main`

## Content Backup

Before making major changes:

1. Screenshot important content
2. Export text content to Google Docs
3. Save important image URLs

## References

- [Are.na API Docs](https://www.are.na/api/documentation)
- [Are.na Help](https://www.are.na/help)
- [Portfolio README](./README.md)

## Questions?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for team collaboration guidelines or check the main [README.md](./README.md).
