# Product Design Portfolio Game

A playful and interactive product design portfolio presented as a **3D open-world game inspired by GTA 3**. Walk the streets of Design District to explore projects, case studies, and design work in a fun and delightful way.

[![Live Site](https://img.shields.io/badge/Live%20Site-cristianiordan.design-4CAF50?style=for-the-badge)](https://cristianiordan.design)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

## 🎮 Overview

This portfolio breaks away from traditional static portfolios by presenting design work through an engaging game-like experience. You walk down a small city street as a low-poly version of me, step into the glowing markers in front of the buildings to open About Me, Case Studies and Built Projects, and grab the spinning pickups on the street to find my socials.

**The main goal:** Make portfolio exploration fun and delightful for users, turning the typical portfolio browsing experience into an interactive adventure.

## ✨ Features

- **Early-2000s 3D Look**: A low-poly city street with parked cars, pedestrians, fire escapes and shop signs
- **Day and night**: The street follows the visitor's local time: daylight, dusk, then a night street with lit windows, shop fronts and lamp light (no location permission; just the device clock). Sunrise and sunset move with the time of year
- **Seasons**: Blossom and flowers in spring; Hawaiian shirts, shorts, café parasols and a gelato cart in summer; yellow trees and falling leaves in autumn; snow on the ground, roofs and cars and in the air in winter. From 1 December to 6 January there's a Christmas tree in the park, fairy lights, wreaths, gifts and a Santa hat
- **GTA 3 style HUD**: Rotating radar with section blips, the visitor's local time, cash and stars that track visited sections (progress is saved locally)
- **Mission markers**: About Me, Case Studies and Built Projects each have a building and a glowing marker; visiting one for the first time pays out a "Mission Passed!"
- **Projects Gallery**: Walk into the Built Projects marker and you fade into a classic museum hall. Each project hangs as a painting (its `cover` image from `content.ts`, or a title card until it has one); stop at one and the camera frames it with a card linking to the project. A guard greets you, visitors wander, there's a guestbook (LinkedIn) and an empty frame for the next project. Walk into the marker by the door to leave
- **Social pickups**: LinkedIn, X and GitHub spin on the street like GTA 3 health/cash pickups; walk into one for a card with a "Go to …" link (or press Enter)
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

# Build for production (also type-checks)
pnpm build

# Lint
pnpm lint
```

Add `?debug` to the URL to expose the game store as `window.__dd` in the console, `?time=22:30` to preview any time of day and `?date=2026-12-24` to preview any season (they combine).

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
│   ├── content.ts          # Section copy, links and project covers (edit text here)
│   ├── sections.tsx        # Section pages (About, Case Studies, ...)
│   ├── world.ts            # Street layout: buildings, markers, cars, pedestrians
│   ├── scene.tsx           # Canvas, lights, fog
│   ├── daylight.ts         # Local time → day/dusk/night palettes and night glow
│   ├── season.ts           # Date → season and Christmas
│   ├── seasonal.tsx        # Snow, leaves, flowers, Christmas and summer props
│   ├── buildings.tsx       # Buildings, signs, fire escapes
│   ├── pedestrians.tsx     # Locals who step around you
│   ├── props.tsx           # Street furniture and parked cars
│   ├── character.tsx       # Characters (PLAYER_LOOK is me)
│   ├── player.tsx          # Movement, collisions, chase camera
│   ├── pickups.tsx         # Spinning social pickups on the street
│   ├── museum.ts           # Gallery layout: paintings, spots, colliders
│   ├── gallery.tsx         # The Built Projects gallery interior
│   ├── hud.tsx / radar.tsx # HUD (incl. the pickup card)
│   └── panel.tsx           # Section panel + pause menu
└── public/                 # Favicon and avatar images
```

`/3d` (the old preview address) and `/classic` (the retired 2D version) redirect to `/`.

## 📄 License

MIT
