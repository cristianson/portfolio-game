"use client";

import dynamic from "next/dynamic";

// three.js needs the browser, so the whole game is client-only
const DesignDistrict = dynamic(() => import("@/components/city"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />,
});

export default function CityPage() {
  return <DesignDistrict />;
}
