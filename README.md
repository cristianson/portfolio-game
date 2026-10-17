# Product Design Portfolio Game

A playful and interactive product design portfolio presented as a **3D open-world game inspired by GTA 3**. Walk the streets of Design District to explore projects, case studies, and design work in a fun and delightful way.

[![Live Site](https://img.shields.io/badge/Live%20Site-cristianiordan.design-4CAF50?style=for-the-badge)](https://cristianiordan.design)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

## 🎮 Overview

This portfolio breaks away from traditional static portfolios by presenting design work through an engaging game-like experience. You walk down a small daytime street as a low-poly version of me, find the glowing markers in front of each building and step in to open a section: About Me, Case Studies, Built Projects and Socials.

**The main goal:** Make portfolio exploration fun and delightful for users, turning the typical portfolio browsing experience into an interactive adventure.

## ✨ Features

- **Early-2000s 3D Look**: A low-poly city street with parked cars, pedestrians, fire escapes and shop signs
- **GTA 3 style HUD**: Rotating radar with section blips, clock, cash and stars that track visited sections (progress is saved locally)
- **Mission markers**: Each section has a building and a glowing marker; visiting one for the first time pays out a "Mission Passed!"
- **Pause menu**: Jump straight to any section without walking there
- **Mobile first**: Portrait layout with an on-screen joystick and an ENTER button near markers
- **No 3D assets to download**: Every model is built from primitives and every texture is painted on a canvas at runtime

## 🎯 How to Play

- **Desktop**: `WASD` / arrow keys to move, `Shift` to sprint, drag to look around, `Enter` / `Space` near a marker, `Esc` for the pause menu
- **Mobile (portrait)**: on-screen joystick to move, drag the street to look around, tap `ENTER` near a marker

## 🚀 Live Site

**[https://cristianiordan.design](https://cristianiordan.design)**

## 🛠️ Tech Stack

- **Next.js 16** - React framework deployed on Vercel
- **React 19** - UI library
- **three.js + @react-three/fiber** - 3D rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling for the HUD and section pages
- **Lucide React** - Icon library

## 🏃 Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Add `?debug` to the URL to expose the game store as `window.__dd` in the console.

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout (metadata, analytics)
│   ├── globals.css         # Global styles
│   └── (city)/             # Homepage: the 3D game
│       ├── layout.tsx      # Game fonts + avatar preload
│       ├── page.tsx        # Client-only entry
│       └── city.css        # HUD text styles + colour grade
├── components/city/
│   ├── index.tsx           # Game shell: input, UI state, HUD layout
│   ├── content.ts          # Section copy and links (edit text here)
│   ├── sections.tsx        # Section pages (About, Case Studies, ...)
│   ├── world.ts            # Street layout: buildings, markers, cars, pedestrians
│   ├── scene.tsx           # Canvas, lights, fog
│   ├── buildings.tsx       # Buildings, signs, fire escapes
│   ├── props.tsx           # Street furniture and parked cars
│   ├── character.tsx       # Characters (PLAYER_LOOK is me)
│   ├── player.tsx          # Movement, collisions, chase camera
│   ├── hud.tsx / radar.tsx # HUD
│   └── panel.tsx           # Section panel + pause menu
└── public/                 # Favicon and avatar images
```

`/3d` (the old preview address) and `/classic` (the retired 2D version) redirect to `/`.

## 📄 License

MIT
