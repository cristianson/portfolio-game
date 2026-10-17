import type { Metadata } from "next";
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
  title: "Cristian Iordan — Design District",
  description: "Walk the streets of Design District: a 3D, early-2000s open-world take on my product design portfolio.",
};

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${anton.variable} ${hud.variable}`}>{children}</div>;
}
