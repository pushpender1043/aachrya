import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedAstrologers from "@/components/FeaturedAstrologers";

const Astrologers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-24 cosmic-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Our Expert Astrologers
            </h1>
            <p className="text-muted-foreground">
              Connect with certified and experienced astrologers for personalized guidance
            </p>
          </div>
          <FeaturedAstrologers showAll />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Astrologers;
