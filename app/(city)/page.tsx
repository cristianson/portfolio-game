import { GameLoader } from "@/components/city/game-loader";
import { StaticPortfolio } from "@/components/city/static-portfolio";

// Without JavaScript there is no game: show the text version instead of a black screen
const NO_JS_STYLES = `<style>
  .game-root { display: none !important; }
  .static-portfolio { position: fixed; inset: 0; width: auto; height: auto; margin: 0; overflow-y: auto; clip-path: none; white-space: normal; }
  .fallback-only { display: none !important; }
</style>`;

export default function CityPage() {
  return (
    <>
      <noscript dangerouslySetInnerHTML={{ __html: NO_JS_STYLES }} />
      <StaticPortfolio />
      <GameLoader />
    </>
  );
}
