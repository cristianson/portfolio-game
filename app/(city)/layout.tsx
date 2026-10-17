import type { Metadata } from "next";
import { preload } from "react-dom";
import { Anton, Bowlby_One_SC } from "next/font/google";
import "./city.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gta",
});

// Wide, heavy digits for the HUD numbers
const hud = Bowlby_One_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hud",
});

export const metadata: Metadata = {
  title: "Cristian Iordan's Portfolio",
  description:
    "Product designer portfolio as a 3D open-world game: walk the streets of Design District to explore my case studies, projects and more.",
};

export default function CityLayout({ children }: { children: React.ReactNode }) {
  // Fetch the avatars while the title screen is up so About Me and the HUD show them instantly
  preload("/avatar-560.webp", { as: "image", type: "image/webp" });
  preload("/avatar-128.webp", { as: "image", type: "image/webp" });
  return <div className={`${anton.variable} ${hud.variable}`}>{children}</div>;
}
