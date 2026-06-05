import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedAstrologers from "@/components/FeaturedAstrologers";
import TrendingProducts from "@/components/TrendingProducts"; // ✅ 1. Import Added
import DailyHoroscope from "@/components/DailyHoroscope";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import WhatsAppChat from "@/components/WhatsAppChat";
import AstrologyBot from "@/components/AstrologyBot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Top Hero Section (Tridev) */}
        <HeroSection />
        
        {/* Astrologers Section */}
        <FeaturedAstrologers />
        
        {/* ✅ 2. Trending Products Section Added Here (Astrologers ke neeche) */}
        <TrendingProducts />
        
        {/* Daily Horoscope */}
        <DailyHoroscope />
        
        {/* Reviews */}
        <TestimonialsCarousel />
      </main>
      <Footer />
      <AstrologyBot />
      <WhatsAppChat />
    </div>
  );
};

export default Index;