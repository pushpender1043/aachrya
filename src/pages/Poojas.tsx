import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, IndianRupee, Sparkles, Check, ImageOff } from "lucide-react"; // ImageOff icon added
import PoojaBookingDialog from "@/components/PoojaBookingDialog";

interface Pooja {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  category: string | null;
  image_url: string | null;
  benefits: string[] | null;
  items_included: string[] | null;
  is_available: boolean | null;
}

const Poojas = () => {
  const { t } = useLanguage();
  const [selectedPooja, setSelectedPooja] = useState<Pooja | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: poojas, isLoading } = useQuery({
    queryKey: ["poojas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poojas")
        .select("*")
        .eq("is_available", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return data as Pooja[];
    },
  });

  const categories = ["All", ...new Set(poojas?.map((p) => p.category).filter(Boolean) as string[])];

  const filteredPoojas = selectedCategory === "All" 
    ? poojas 
    : poojas?.filter((p) => p.category === selectedCategory);

  const handleBookNow = (pooja: Pooja) => {
    setSelectedPooja(pooja);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {t("poojas.badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              {t("poojas.title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("poojas.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-primary text-primary-foreground" : "border-primary/50 text-foreground hover:bg-primary/10"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Poojas Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card border-border overflow-hidden">
                  <Skeleton className="h-48 w-full" /> {/* Skeleton for Image */}
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoojas?.map((pooja) => (
                <Card 
                  key={pooja.id} 
                  className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group overflow-hidden flex flex-col h-full"
                >
                  {/* --- NEW: Image Section --- */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {pooja.image_url ? (
                        <img 
                          src={pooja.image_url} 
                          alt={pooja.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        // Fallback Image if URL is missing
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                            <ImageOff className="w-12 h-12" />
                        </div>
                    )}
                    
                    {/* Category Overlay Badge */}
                    {pooja.category && (
                        <div className="absolute top-3 right-3">
                           <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-foreground shadow-sm">
                             {pooja.category}
                           </Badge>
                        </div>
                    )}
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {pooja.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center text-primary font-bold text-lg">
                          <IndianRupee className="w-4 h-4" />
                          {pooja.price.toLocaleString()}
                        </div>
                        {pooja.duration && (
                          <div className="flex items-center justify-end text-muted-foreground text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {pooja.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3 flex-grow">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {pooja.description}
                    </p>
                    
                    {pooja.benefits && pooja.benefits.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider opacity-70">{t("poojas.benefits")}:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pooja.benefits.slice(0, 3).map((benefit, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full flex items-center border border-orange-100 dark:border-orange-800"
                            >
                              <Check className="w-2.5 h-2.5 mr-1" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 pb-4 px-6 border-t border-border mt-auto">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-500/20"
                      onClick={() => handleBookNow(pooja)}
                    >
                      {t("poojas.bookNow")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredPoojas?.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
              <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">{t("poojas.noAvailable")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Dialog */}
      {selectedPooja && (
        <PoojaBookingDialog
          pooja={selectedPooja}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
        />
      )}

      <Footer />
    </div>
  );
};

export default Poojas;