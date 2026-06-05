import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The astrologer's guidance helped me make the right career decision. Highly recommended!",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    text: "Accurate predictions and wonderful advice. The consultation was truly enlightening.",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Anjali Patel",
    location: "Bangalore",
    rating: 5,
    text: "Found the perfect gemstone recommendation. Already seeing positive changes in my life!",
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 5,
    text: "The kundli matching service was detailed and accurate. Very satisfied with the experience.",
    date: "5 days ago",
  },
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 cosmic-bg opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground px-4">
            {t("testimonials.title")} <span className="gradient-text">{t("testimonials.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            {t("testimonials.subtitle")}
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="cosmic-card p-6 md:p-8 lg:p-12 relative animate-fade-in">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-2 top-1/2 -translate-y-1/2 hover:bg-primary/20"
            >
              <ChevronLeft className="w-6 h-6 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary/20"
            >
              <ChevronRight className="w-6 h-6 text-primary" />
            </Button>

            {/* Content */}
            <div className="text-center space-y-4 md:space-y-6 px-4 md:px-8">
              {/* Stars */}
              <div className="flex justify-center space-x-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-base md:text-xl text-foreground leading-relaxed italic">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author Info */}
              <div className="pt-6 border-t border-border">
                <div className="font-semibold text-lg text-foreground">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-muted-foreground">
                  {testimonials[currentIndex].location} • {testimonials[currentIndex].date}
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "bg-primary w-8" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-8 md:mt-12">
          <div className="text-center space-y-1 md:space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
            <div className="text-xs md:text-sm text-muted-foreground">{t("testimonials.reviews")}</div>
          </div>
          <div className="text-center space-y-1 md:space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
            <div className="text-xs md:text-sm text-muted-foreground">{t("testimonials.satisfaction")}</div>
          </div>
          <div className="text-center space-y-1 md:space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
            <div className="text-xs md:text-sm text-muted-foreground">{t("testimonials.support")}</div>
          </div>
          <div className="text-center space-y-1 md:space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">1M+</div>
            <div className="text-xs md:text-sm text-muted-foreground">{t("testimonials.consultations")}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
