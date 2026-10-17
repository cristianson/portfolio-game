# Product Design Portfolio Game

A playful and interactive product design portfolio presented as a **3D open-world game inspired by GTA 3**. Walk the streets of Design District to explore projects, case studies, and design work in a fun and delightful way.

[![Live Site](https://img.shields.io/badge/Live%20Site-cristianiordan.design-4CAF50?style=for-the-badge)](https://cristianiordan.design)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

## 🎮 Overview

This portfolio breaks away from traditional static portfolios by presenting design work through an engaging game-like experience. Users can explore different zones, interact with content, and discover projects in a way that's both memorable and enjoyable.

**The main goal:** Make portfolio exploration fun and delightful for users, turning the typical portfolio browsing experience into an interactive adventure.

## ✨ Features

- **Early-2000s 3D Look**: A low-poly city street with a GTA 3 style HUD, radar and mission markers
- **Interactive Navigation**: Move your character using keyboard controls (WASD/Arrow keys) or touch joystick on mobile
- **Zone-Based Exploration**: Discover different sections like About Me, Projects, and Case Studies by exploring the game world
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Smooth Animations**: Delightful interactions and transitions throughout the experience

## 🏙️ Design District (3D)

The homepage (**`/`**) is a GTA 3 inspired 3D game. Walk down a small daytime street as a low-poly version of me, find the glowing markers in front of each building and step in to open a section.

- **Desktop**: `WASD` / arrow keys to move, `Shift` to sprint, drag to look around, `Enter` / `Space` near a marker, `Esc` for the pause menu
- **Mobile (portrait)**: on-screen joystick to move, drag the street to look around, tap `ENTER` near a marker
- HUD with rotating radar, clock, cash and stars that track visited sections; progress is saved locally
- Built with **three.js** + **@react-three/fiber**; every texture is drawn on a canvas at runtime, so there are no 3D assets to download
- Code lives in `components/city/`; the street layout (buildings, markers, cars, pedestrians) is defined in `components/city/world.ts`, the character look in `components/city/character.tsx` (`PLAYER_LOOK`)
- Section copy and links live in `components/game/content.ts`, shared with the 2D version
- The original 2D pixel version is still available, unlisted, at **`/classic`** (`/3d` redirects to `/`)

## 🎯 How to Play (classic 2D version)

- **Desktop**: Use `WASD` or arrow keys to move, `SPACE` to interact with zones, `ESC` to close modals
- **Mobile**: Use the on-screen joystick to move and tap the interact button when near zones

## 🚀 Live Site

**[https://cristianiordan.design](https://cristianiordan.design)**

## 🛠️ Tech Stack

- **Next.js 15** - React framework deployed on Vercel
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling with custom pixel art borders and animations
- **Radix UI** - Accessible UI primitives (dialogs, tooltips, etc.)
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

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── game/               # Game components
│       ├── index.tsx       # Main game component
│       ├── player.tsx      # Player character
│       ├── zone.tsx        # Interactive zones
│       ├── modal.tsx       # Content modals
│       ├── joystick.tsx    # Mobile controls
│       ├── pixel-tooltip.tsx # Custom tooltips
│       ├── data.tsx        # Portfolio content
│       └── constants.ts    # Game constants
└── public/                 # Static assets
```

## 📄 License

MIT
