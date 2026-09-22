import { Header } from "./Header";
import { Hero } from "./Hero";
import { Footer } from "./Footer";

export const LandingPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gray-950 text-white flex flex-col">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
};
