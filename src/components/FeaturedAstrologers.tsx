import { useState } from "react";
import { Star, Calendar, Clock, Award, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import AppointmentDialog from "./AppointmentDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

// ✅ Accept showAll prop
interface FeaturedAstrologersProps {
  showAll?: boolean;
}

const FeaturedAstrologers = ({ showAll = false }: FeaturedAstrologersProps) => {
  const { t } = useLanguage();
  
  // Dialog ke liye selected astrologer ka state
  const [selectedAstrologer, setSelectedAstrologer] = useState<any>(null);

  // ✅ Fetch ALL astrologers
  const { data: astrologers, isLoading } = useQuery({
    queryKey: ["all-astrologers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("astrologers")
        .select("*")
        .order("created_at", { ascending: true }); // Purane/Main pehle aayenge

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 container flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!astrologers || astrologers.length === 0) return null;

  const mainAcharya = astrologers[0]; // Hero section ke liye pehla astrologer

  return (
    <section className={`relative overflow-hidden ${!showAll ? "py-16 md:py-24" : ""}`}>
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />

      {/* =========================================
          MODE 1: SINGLE HERO VIEW (For Home Page)
          ========================================= */}
      {!showAll && (
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            
            {/* Image Section */}
            <div className="w-full md:w-1/2 relative group animate-fade-in">
              <div className="relative z-10 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
                <img
                  src={mainAcharya.image_url || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"}
                  alt={mainAcharya.name}
                  className="w-full h-[500px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md px-4 py-3 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-full text-primary">
                          <Award className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience</p>
                          <p className="font-bold text-foreground text-lg">{mainAcharya.experience_years}+ Years</p>
                      </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/30 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-xl" />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 space-y-8 text-center md:text-left animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Star className="w-3 h-3 mr-2 fill-primary" /> Official Vedic Consultant
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Astrologer <br/>
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                    {mainAcharya.name}
                  </span>
                </h2>
                
                <p className="text-xl text-foreground/80 font-light">{mainAcharya.specialization}</p>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg border-l-4 border-primary/30 pl-4 md:pl-6">
                {mainAcharya.bio || "Get expert guidance on Vedic Astrology, Kundli Analysis, and Vastu Shastra."}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                  <ShieldCheck className="w-6 h-6 text-green-400 mb-2 mx-auto md:mx-0" />
                  <h4 className="font-semibold text-foreground">Verified</h4>
                  <p className="text-xs text-muted-foreground">100% Authentic</p>
                </div>
                <div className="p-4 rounded-xl bg-card/50 border border-border">
                  <Star className="w-6 h-6 text-yellow-400 mb-2 mx-auto md:mx-0" />
                  <h4 className="font-semibold text-foreground">Premium</h4>
                  <p className="text-xs text-muted-foreground">1-on-1 Sessions</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Consultation Fee</p>
                  <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">₹{mainAcharya.price_per_minute}</span>
                      <span className="text-sm text-muted-foreground">/ min</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 h-14 text-lg font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  onClick={() => setSelectedAstrologer(mainAcharya)}
                >
                  <Calendar className="w-5 h-5 mr-2" /> Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODE 2: GRID VIEW (For Astrologers Page)
          ========================================= */}
      {showAll && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {astrologers.map((astro) => (
            <Card key={astro.id} className="bg-card/40 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-all duration-300 group overflow-hidden flex flex-col">
              <div className="relative h-64 overflow-hidden bg-muted">
                <img 
                  src={astro.image_url || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"} 
                  alt={astro.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-xs flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" /> 5.0
                </div>
                <div className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  ₹{astro.price_per_minute}/min
                </div>
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-1 line-clamp-1">{astro.name}</h3>
                <p className="text-primary text-sm font-medium mb-3 line-clamp-1">{astro.specialization}</p>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                  {astro.bio || "Expert in Vedic astrology and life predictions."}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                   <span className="flex items-center"><Award className="w-4 h-4 mr-1 text-primary" /> {astro.experience_years}+ Years Exp.</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0" 
                  onClick={() => setSelectedAstrologer(astro)}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ Shared Appointment Dialog */}
      {selectedAstrologer && (
        <AppointmentDialog
          open={!!selectedAstrologer}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedAstrologer(null);
          }}
          astrologerId={selectedAstrologer.id}
          astrologerName={selectedAstrologer.name}
          price={selectedAstrologer.price_per_minute}
        />
      )}
    </section>
  );
};

export default FeaturedAstrologers;