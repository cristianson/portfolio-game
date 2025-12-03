# Product Design Portfolio Game

A playful and interactive product design portfolio presented as a **2D pixel art styled game**. Navigate through a retro-inspired world to explore projects, case studies, and design work in a fun and delightful way.

[![Live Site](https://img.shields.io/badge/Live%20Site-cristianiordan.design-4CAF50?style=for-the-badge)](https://cristianiordan.design)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-222?style=for-the-badge&logo=github)](https://github.com/cristianson/portfolio-game)

## 🎮 Overview

This portfolio breaks away from traditional static portfolios by presenting design work through an engaging game-like experience. Users can explore different zones, interact with content, and discover projects in a way that's both memorable and enjoyable.

**The main goal:** Make portfolio exploration fun and delightful for users, turning the typical portfolio browsing experience into an interactive adventure.

## ✨ Features

- **2D Pixel Art Aesthetic**: Retro-inspired visuals with pixel-perfect styling
- **Interactive Navigation**: Move your character using keyboard controls (WASD/Arrow keys) or touch joystick on mobile
- **Zone-Based Exploration**: Discover different sections like About Me, Projects, and Case Studies by exploring the game world
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Smooth Animations**: Delightful interactions and transitions throughout the experience
- **Pixel Tooltips**: Custom-styled tooltips that match the retro aesthetic

## 🎯 How to Play

- **Desktop**: Use `WASD` or arrow keys to move, `SPACE` to interact with zones, `ESC` to close modals
- **Mobile**: Use the on-screen joystick to move and tap the interact button when near zones

## 🚀 Live Site

**[https://cristianiordan.design](https://cristianiordan.design)**

## 🛠️ Tech Stack

- **Next.js 16** - React framework with static export for GitHub Pages
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
