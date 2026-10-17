import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./city.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gta",
});

export const metadata: Metadata = {
  title: "Cristian Iordan — Design District",
  description: "Walk the streets of Design District: a 3D, early-2000s open-world take on my product design portfolio.",
};

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <div className={anton.variable}>{children}</div>;
}
