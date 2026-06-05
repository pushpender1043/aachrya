import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Star, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TrendingProducts = () => {
  // --- FETCH REAL PRODUCTS FROM DB ---
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      // Fetch latest 4 products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(4)
        .order('created_at', { ascending: false }); // Jo naya add kiya wo pehle aayega
      
      if (error) throw error;
      return data;
    },
  });

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <section className="py-20 bg-background flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </section>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return null; // Agar error aaye to section chup chap hide ho jaye (clean look ke liye)
  }

  // --- IF NO PRODUCTS ---
  if (!products || products.length === 0) {
    return null; // Products nahi hai to section mat dikhao
  }

  return (
    <section className="py-20 relative bg-background overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-[-10%] w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 border-orange-200">
               <Sparkles className="w-3 h-3 mr-1" /> New Arrivals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Sacred <span className="gradient-text">Treasures</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore the latest spiritual essentials added to our collection.
            </p>
          </div>

          {/* Desktop Arrow Button */}
          <Link to="/products" className="hidden md:block">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 group">
              View All Collection <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* --- Products Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Card className="h-full bg-card/50 backdrop-blur-md border-orange-100 dark:border-orange-900/30 overflow-hidden hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col">
                
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden bg-muted">
                   <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop"} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 dark:bg-black/80 text-foreground backdrop-blur-sm shadow-sm">
                        New
                      </Badge>
                   </div>
                   {/* Overlay Button on Hover */}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link to="/products">
                        <Button className="rounded-full bg-white text-black hover:bg-orange-100 border-none">
                           View Details
                        </Button>
                      </Link>
                   </div>
                </div>

                {/* Content Area */}
                <CardHeader className="p-5 pb-2 flex-grow">
                   <div className="flex justify-between items-start">
                      <div className="text-xs font-medium text-orange-500 uppercase tracking-wide">
                        {product.category || "Spiritual"}
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                         <Star className="w-3 h-3 fill-current mr-1" /> 4.9
                      </div>
                   </div>
                   <h3 className="font-bold text-lg line-clamp-1 group-hover:text-orange-600 transition-colors pt-1">
                      {product.name}
                   </h3>
                </CardHeader>

                <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
                   <div className="text-xl font-bold">₹{product.price.toLocaleString()}</div>
                   <Link to="/products">
                     <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                        <ShoppingBag className="w-5 h-5" />
                     </Button>
                   </Link>
                </CardFooter>

              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile Arrow Button (Bottom) */}
        <div className="mt-12 text-center md:hidden">
            <Link to="/products">
            <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full group">
              Explore All Products <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TrendingProducts;