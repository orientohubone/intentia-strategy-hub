import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ForceDarkMode } from "@/components/ForceDarkMode";
import TiaHero from "@/components/tia/TiaHero";
import TiaOrigin from "@/components/tia/TiaOrigin";
import TiaZeroUI from "@/components/tia/TiaZeroUI";
import TiaComparison from "@/components/tia/TiaComparison";
import TiaVoice from "@/components/tia/TiaVoice";
import TiaRoadmap from "@/components/tia/TiaRoadmap";
import TiaCTA from "@/components/tia/TiaCTA";

const Tia = () => (
  <ForceDarkMode>
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <TiaHero />
        <TiaOrigin />
        <TiaZeroUI />
        <TiaComparison />
        <TiaVoice />
        <TiaRoadmap />
        <TiaCTA />
      </main>
      <Footer />
    </div>
  </ForceDarkMode>
);

export default Tia;
