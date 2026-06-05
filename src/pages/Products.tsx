import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { 
  Loader2, Search, ArrowUpDown, ShoppingBag, Star, 
  Heart, Eye, Clock, Zap, X, CheckCircle2, AlertCircle, Flame 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress"; // Ensure you have this component or remove usage

// --- HERO SLIDES DATA ---
const HERO_SLIDES = [
  {
    id: 1,
    title: "Sacred Gemstones",
    subtitle: "Energized for Prosperity & Peace",
    image: "https://images.unsplash.com/photo-1615655114865-4cc1bda5901e?q=80&w=1974&auto=format&fit=crop",
    color: "from-blue-600/80 to-purple-600/80"
  },
  {
    id: 2,
    title: "Authentic Rudraksha",
    subtitle: "Direct from Nepal with Lab Certificate",
    image: "https://m.media-amazon.com/images/I/71wYp-y+HFL._AC_UY1100_.jpg",
    color: "from-orange-600/80 to-red-600/80"
  },
  {
    id: 3,
    title: "Vastu Yantras",
    subtitle: "Correct Your Home's Energy Flow",
    image: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=1935&auto=format&fit=crop",
    color: "from-emerald-600/80 to-teal-600/80"
  }
];

// --- INTERNAL COMPONENT: ADVANCED PRODUCT CARD ---
const AdvancedProductCard = ({ product, onAddToCart, onQuickView, onToggleWishlist, isWishlisted }: any) => {
  // Fake Stock Logic for urgency
  const stockLeft = useMemo(() => Math.floor(Math.random() * 15) + 2, []);
  
  return (
    <div className="group relative bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-col h-full">
      
      {/* Image Area */}
      <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-muted">
        <img 
          src={product.image_url || "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop"} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradient (Better Text Readability on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           {product.category && (
             <Badge className="bg-black/70 backdrop-blur-md text-white border-none shadow-sm">{product.category}</Badge>
           )}
           {stockLeft < 5 && (
             <Badge className="bg-red-500 text-white border-none animate-pulse flex items-center gap-1">
               <Flame className="w-3 h-3 fill-current" /> Selling Fast
             </Badge>
           )}
        </div>

        {/* Action Buttons (Right Side) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={() => onToggleWishlist(product.id)}
            className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:text-red-500"}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button 
            onClick={() => onQuickView(product)}
            className="p-2.5 rounded-full bg-white text-gray-700 hover:text-blue-600 shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Button (Bottom Slide Up) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
           <Button 
             onClick={() => onAddToCart(product)}
             className="w-full bg-white text-black hover:bg-orange-50 font-bold shadow-xl border-none h-11"
           >
             <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
           </Button>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer" onClick={() => onQuickView(product)}>
             {product.name}
           </h3>
           <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-800">
              <Star className="w-3 h-3 fill-current mr-1" /> 4.8
           </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
           {product.description || "Authentic spiritual product sourced directly from sacred places."}
        </p>

        {/* Stock Bar (Fake Urgency) */}
        <div className="mb-4">
           <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1">
              <span>Stock Left: {stockLeft}</span>
              <span className="text-green-600">85% Sold</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[85%]" />
           </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
           <div className="space-y-0.5">
              {/* Fake MRP */}
              <span className="text-xs text-gray-400 line-through decoration-red-500/50">
                 ₹{(product.price * 1.3).toFixed(0)}
              </span>
              {/* ✅ PRICE FIX: Explicit Color for Light & Dark Mode */}
              <div className="text-xl font-extrabold text-gray-900 dark:text-orange-400">
                 ₹{product.price.toLocaleString()}
              </div>
           </div>
           
           <div className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded flex items-center border border-green-100 dark:border-green-900/50">
              <Zap className="w-3 h-3 mr-1 fill-current" /> Fast Delivery
           </div>
        </div>
      </div>
    </div>
  );
};

// --- FLASH SALE TIMER COMPONENT ---
const FlashSaleTimer = () => {
  const [time, setTime] = useState({ h: 2, m: 14, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if(prev.s > 0) return { ...prev, s: prev.s - 1 };
        if(prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if(prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return { h: 2, m: 59, s: 59 }; // Reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 text-sm font-mono font-bold text-white bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/30">
       <Clock className="w-4 h-4" />
       {String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}
    </div>
  );
};

const Products = () => {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Quick View & Wishlist State
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // --- FETCH PRODUCTS ---
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // --- AUTO SLIDER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- FILTER & SORT ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "price-low": return filtered.sort((a, b) => a.price - b.price);
      case "price-high": return filtered.sort((a, b) => b.price - a.price);
      case "name-asc": return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default: return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [products, searchQuery, selectedCategory, sortBy]);

  const categories = ["All", ...Array.from(new Set(products?.map((p) => p.category).filter(Boolean)))];

  // --- ACTIONS ---
  const handleAddToCart = async (product: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please login to shop");
      return;
    }

    try {
      // ✅ FIXED: Used maybeSingle() to prevent error if 0 rows found
      const { data: existingItem, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingItem) {
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({
            user_id: session.user.id,
            product_id: product.id,
            quantity: 1,
          });
      }
      
      toast.success(`${product.name} added to cart! 🛍️`);
      // ✅ TRIGGER Navbar Badge Update
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (error: any) {
      console.error("Cart Error:", error);
      toast.error("Failed to add to cart: " + error.message);
    }
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    if(!wishlist.includes(id)) toast.success("Added to Wishlist ❤️");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* --- 1. HERO SLIDER --- */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl group border border-border/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img 
                  src={HERO_SLIDES[currentSlide].image} 
                  alt="Banner" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${HERO_SLIDES[currentSlide].color} opacity-70 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-black/20" />
                
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
                   {/* Flash Sale Badge */}
                   <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4">
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                         <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Flash Sale Ends In</span>
                         <FlashSaleTimer />
                      </div>
                   </motion.div>

                   <motion.h1 
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                      className="text-4xl md:text-7xl font-bold mb-4 drop-shadow-xl"
                   >
                      {HERO_SLIDES[currentSlide].title}
                   </motion.h1>
                   <motion.p 
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-lg md:text-2xl text-white/90 font-light mb-8"
                   >
                      {HERO_SLIDES[currentSlide].subtitle}
                   </motion.p>
                   <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}>
                      <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-10 h-12 font-bold shadow-lg shadow-white/20">
                        Explore Collection
                      </Button>
                   </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Slider Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. ADVANCED FILTER BAR --- */}
      <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-y border-border py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input 
                placeholder="Search gemstones, yantras..." 
                className="pl-10 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <div className="h-8 w-[1px] bg-border mx-2 hidden md:block"></div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] rounded-full border-border bg-background shadow-sm hover:border-primary">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. PRODUCTS GRID --- */}
      <section className="py-12 px-4 min-h-[600px] bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto">
          
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-72 bg-muted/40 rounded-2xl animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted/40 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted/40 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Oops! Could not load products.</h3>
              <p className="text-muted-foreground">Please check your internet connection.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-32 flex flex-col items-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                 <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">No Items Found</h3>
              <p className="text-muted-foreground mt-2 mb-6">We couldn't find any matches for "{searchQuery}"</p>
              <Button onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}>
                View All Products
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && filteredProducts.length > 0 && (
            <>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AdvancedProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={setQuickViewProduct}
                        onToggleWishlist={toggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Load More (Visual only for now) */}
              <div className="mt-16 text-center">
                 <p className="text-muted-foreground text-sm mb-4">Showing {filteredProducts.length} of {products?.length} products</p>
                 <div className="w-48 h-1 bg-secondary mx-auto rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary/50" />
                 </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* --- 4. QUICK VIEW MODAL --- */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-none">
           {quickViewProduct && (
             <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto bg-gray-100 dark:bg-muted">
                   <img 
                      src={quickViewProduct.image_url || "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                      alt={quickViewProduct.name}
                   />
                   <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                      Quick View
                   </div>
                </div>
                <div className="p-8 flex flex-col h-full bg-white dark:bg-card">
                   <DialogHeader>
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary border-none">{quickViewProduct.category}</Badge>
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quickViewProduct.name}</DialogTitle>
                   </DialogHeader>
                   
                   <div className="flex items-center gap-4 my-4">
                      {/* FIXED PRICE COLOR HERE TOO */}
                      <div className="text-3xl font-bold text-gray-900 dark:text-orange-400">₹{quickViewProduct.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground line-through">₹{(quickViewProduct.price * 1.3).toFixed(0)}</div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10">30% OFF</Badge>
                   </div>

                   <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                      {quickViewProduct.description || "This authentic product brings positive vibes and prosperity. Sourced from the most sacred places and energized by expert pundits."}
                   </DialogDescription>

                   <div className="space-y-3 mt-auto">
                      <div className="text-sm font-medium text-red-500 flex items-center gap-2 animate-pulse">
                         <Clock className="w-4 h-4" /> 12 people are viewing this right now!
                      </div>
                      <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12" onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                         Add to Cart
                      </Button>
                   </div>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Products;