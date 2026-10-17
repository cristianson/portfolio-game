import type { Metadata } from "next";
import PixelPortfolio from '@/components/game'

// The original 2D pixel version, kept reachable but unlisted
export const metadata: Metadata = {
  robots: { index: false },
};

export default function ClassicHome() {
  return (
    <main className="min-h-screen w-full bg-black">
      <PixelPortfolio />
    </main>
  )
}
