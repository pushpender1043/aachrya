import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-cosmic.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Cosmic astrology background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background"></div>
      </div>

      {/* Animated Stars */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating Planets - Solar System Theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Large Planet - Purple/Blue */}
        <div className="absolute top-1/4 right-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm animate-float opacity-60">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
        </div>

        {/* Medium Planet - Golden */}
        <div className="absolute bottom-1/3 left-[5%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 backdrop-blur-sm animate-orbit opacity-70">
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-accent/30 to-transparent"></div>
        </div>

        {/* Small Planet - Top */}
        <div className="absolute top-[15%] left-[15%] w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 backdrop-blur-sm animate-spin-slow opacity-50"></div>

        {/* Tiny Planet - Accent */}
        <div className="absolute top-[40%] right-[25%] w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-accent/50 to-primary/30 backdrop-blur-sm animate-orbit-reverse opacity-60"></div>

        {/* Ring Planet */}
        <div className="absolute bottom-[20%] right-[15%] w-20 h-20 md:w-28 md:h-28 animate-float-slow opacity-40">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 backdrop-blur-sm"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-8 md:w-44 md:h-10 border-2 border-primary/30 rounded-full transform rotate-[20deg]"></div>
        </div>

        {/* Orbital Paths */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] border border-primary/10 rounded-full animate-spin-very-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] border border-secondary/10 rounded-full animate-spin-very-slow" style={{ animationDirection: 'reverse' }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="space-y-6 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 md:px-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-foreground leading-tight px-4">
            {t("hero.title")}
            <span className="block gradient-text">{t("hero.subtitle")}</span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4">
            <Link to="/astrologers" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 glow-effect text-base md:text-lg px-6 md:px-8"
              >
                <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                {t("hero.chat")}
              </Button>
            </Link>
            <Link to="/astrologers" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base md:text-lg px-6 md:px-8"
              >
                <Phone className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                {t("hero.call")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-8 md:pt-12 px-4">
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
              <div className="text-xs md:text-sm text-muted-foreground">{t("hero.astrologers")}</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-primary">1M+</div>
              <div className="text-xs md:text-sm text-muted-foreground">{t("hero.customers")}</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-primary">4.8★</div>
              <div className="text-xs md:text-sm text-muted-foreground">{t("hero.rating")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0"></div>
    </section>
  );
};

export default HeroSection;
