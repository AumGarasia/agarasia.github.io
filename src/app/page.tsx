import Introduction from "@/components/sections/Introduction";
import PortfolioScroller from "@/components/sections/PortfolioScroller";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <Introduction />
      <PortfolioScroller />
    </main>
  );
}
