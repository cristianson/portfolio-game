# 🌸 Seasonal Theming Guide

This guide explains how to manage seasonal themes in your portfolio game.

## 🎯 Quick Start: Changing Seasons

To change the season, simply edit one line in `seasons.ts`:

```typescript
// Line 71 in seasons.ts
export const CURRENT_SEASON: SeasonId = "winter"; // Change this!
```

Available options:
- `"winter"` - Snowflakes ❄️
- `"spring"` - Flowers 🌸 (not yet implemented)
- `"summer"` - Sun rays ☀️ (not yet implemented)
- `"autumn"` - Falling leaves 🍂 (not yet implemented)

## 📋 Current Setup

### Winter (Active)
- ❄️ **Snowflakes**: Enabled and falling
- 🎅 **Santa Hat**: Removed (Christmas is over!)
- The snowflakes are winter-themed, not Christmas-specific, so they stay active

## 🏗️ How It Works

### 1. Season Configuration (`seasons.ts`)
This file is the **control center** for all seasonal theming:
- Defines all available seasons
- Specifies what visual elements each season has
- Controls player accessories and environmental effects

### 2. Player Accessories (`player.tsx`)
The player component reads the current season and conditionally shows accessories:
- Santa hat (only during Christmas/winter if enabled)
- Future: Flower crown, sunglasses, scarf, etc.

### 3. Environmental Effects (`index.tsx`)
The main game component conditionally renders seasonal effects:
- Snowflakes (winter)
- Future: Floating flowers (spring), sun rays (summer), falling leaves (autumn)

## ➕ Adding New Seasons

### Example: Adding Spring Flowers

1. **Update Season Config** (`seasons.ts`):
```typescript
spring: {
  id: "spring",
  name: "Spring",
  playerAccessory: "flower-crown",
  showSnowflakes: false,
  showFlowers: true, // Enable flowers
  showSunRays: false,
  showLeaves: false,
},
```

2. **Create Flower Component** (`components/game/flowers.tsx`):
```typescript
export function FloatingFlowers() {
  // Similar to snowflakes, but flowers that float upward
  return <div>...</div>;
}
```

3. **Add to Game** (`index.tsx`):
```typescript
{currentSeason.showFlowers && <FloatingFlowers />}
```

4. **Add Flower Crown to Player** (`player.tsx`):
```typescript
{showAccessory && currentSeason.playerAccessory === "flower-crown" && (
  <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-12 h-6 z-30">
    {/* Flower crown design here */}
  </div>
)}
```

## 🎨 Styling Seasonal Effects

All seasonal CSS is in `app/globals.css`:
- `.pixel-snowflake` - Snowflake styling
- `.animate-fall` - Falling animation
- Add more classes for other seasonal effects

## 💡 Best Practices

1. **Easy Toggling**: Keep season switching to one line change in `seasons.ts`
2. **Conditional Rendering**: Always check season config before rendering effects
3. **Performance**: Use CSS animations where possible (like snowflakes)
4. **Consistency**: Keep seasonal elements pixel-art styled to match your portfolio theme

## 🗓️ Seasonal Calendar (Suggestion)

You might want to switch seasons around these dates:
- **Winter**: December 21 - March 19
- **Spring**: March 20 - June 20
- **Summer**: June 21 - September 21
- **Autumn**: September 22 - December 20

## 🔧 Troubleshooting

**Snowflakes not showing?**
- Check that `CURRENT_SEASON` is set to `"winter"`
- Check that `showSnowflakes: true` in the winter config

**Player accessory not showing?**
- Check that `playerAccessory` is not set to `"none"`
- Make sure the conditional render in `player.tsx` includes your accessory type

## 📝 Notes

- The system is designed to be **easily extensible** - adding new seasons is straightforward
- All seasonal logic is **centralized** in `seasons.ts` for easy management
- Effects are **performance-optimized** using CSS animations
- The current season is **"winter"** with snowflakes but no Christmas hat
