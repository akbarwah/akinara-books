import Navbar from './Navbar';
import Hero from './Hero';
import POInfoBanner from './POInfoBanner';
import Features from './Features';
import MiniCatalog from './MiniCatalog';
import FAQSection from './FAQSection';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import TrackOrderCTA from './TrackOrderCTA';

export default function AkinaraLanding() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <POInfoBanner />
      <TrackOrderCTA />
      <Features />
      <MiniCatalog />
      <FAQSection />
      <Footer />
      <CartDrawer />
      {/* Nala (ChatbotWidget) telah dihapus dari sini karena sudah pindah ke layout.tsx */}
    </div>
  );
}