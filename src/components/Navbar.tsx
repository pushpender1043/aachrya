import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ Added useLocation
import { Moon, Sun, ShoppingCart, ChevronDown, Star, Heart, Calculator, Sparkles, User, LogOut, Package } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import sunLogo from "@/assets/sun-logo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Track page changes
  const { t } = useLanguage();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ SUPER FIXED: Fetch Cart Count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }
      
      try {
        // Count fetch karne ka sabse safe tareeka
        const { count, error } = await supabase
          .from("cart_items")
          .select("id", { count: "exact" }) 
          .eq("user_id", user.id);
        
        if (!error && count !== null) {
          setCartCount(count);
        }
      } catch (err) {
        console.error("Cart count error:", err);
      }
    };

    fetchCartCount();

    // Listen for custom event
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    
  }, [user, location.pathname]); // ✅ location.pathname se har page change par count update hoga

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LOGO SECTION --- */}
          <Link to="/" className="flex items-center space-x-2 group relative">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={sunLogo} 
                alt="Aachrya" 
                className="w-10 h-10 relative z-10 transition-transform duration-700 ease-in-out group-hover:rotate-180"
                style={{ filter: "sepia(100%) saturate(300%) hue-rotate(355deg) drop-shadow(0 0 5px rgba(255,140,0,0.5))" }} 
              />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 group-hover:to-orange-400 transition-all duration-300">
              Aachrya
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.home")}
            </Link>
            <Link to="/astrologers" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.astrologers")}
            </Link>
            <Link to="/products" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.products")}
            </Link>
            <Link to="/kundli" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.kundli")}
            </Link>
            <Link to="/poojas" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.poojas")}
            </Link>
            <Link to="/panchang" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              Panchang
            </Link>
            
            {/* MEGA MENU: Free Tools */}
            <div className="group relative h-16 flex items-center cursor-pointer">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors px-3 py-1 rounded-full group-hover:bg-primary/5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {t("nav.calculators") || "Free Tools"}
                    <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:-rotate-180" />
                </div>

                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[650px] p-6 bg-card/95 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-[0_10px_40px_-10px_rgba(255,100,0,0.2)] opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px]" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]" />

                    <div className="grid grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-rose-100 dark:border-rose-900/30 pb-2">
                                <Heart className="w-3.5 h-3.5" /> Relationship
                            </h4>
                            <ul className="space-y-2.5">
                                {[
                                  { name: "Love Calculator", path: "love-calculator" },
                                  { name: "FLAMES Test", path: "flames-calculator" },
                                  { name: "Friendship Meter", path: "friendship-calculator" },
                                  { name: "Name Match", path: "name-compatibility" }
                                ].map((item) => (
                                  <li key={item.path}>
                                    <Link to={`/calculators?tool=${item.path}`} className="group/item flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-200 group-hover/item:bg-rose-500 transition-colors" />
                                      <span className="group-hover/item:translate-x-1 transition-transform duration-300">{item.name}</span>
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/30 pb-2">
                                <Calculator className="w-3.5 h-3.5" /> Numerology
                            </h4>
                            <ul className="space-y-2.5">
                                {[
                                  { name: "Full Report", path: "numerology-calculator" },
                                  { name: "Mulank (Root No)", path: "mulank-calculator" },
                                  { name: "Mobile Number", path: "mobile-numerology" },
                                  { name: "Vehicle Number", path: "lucky-vehicle" }
                                ].map((item) => (
                                  <li key={item.path}>
                                    <Link to={`/calculators?tool=${item.path}`} className="group/item flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover/item:bg-blue-500 transition-colors" />
                                      <span className="group-hover/item:translate-x-1 transition-transform duration-300">{item.name}</span>
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                        </div>

                         <div className="space-y-4">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-amber-100 dark:border-amber-900/30 pb-2">
                                <Star className="w-3.5 h-3.5" /> Astrology
                            </h4>
                            <ul className="space-y-2.5">
                                {[
                                  { name: "Sun Sign", path: "sun-sign" },
                                  { name: "Moon Sign", path: "moon-sign" },
                                  { name: "Kundli Chart", path: "birth-chart" },
                                  { name: "Sade Sati", path: "sade-sati" }
                                ].map((item) => (
                                  <li key={item.path}>
                                    <Link to={`/calculators?tool=${item.path}`} className="group/item flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-200 group-hover/item:bg-amber-500 transition-colors" />
                                      <span className="group-hover/item:translate-x-1 transition-transform duration-300">{item.name}</span>
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border/50 text-center">
                        <Link to="/calculators" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">
                            View All 25+ Calculators <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            <Link to="/blogs" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.blogs")}
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide">
              {t("nav.contact")}
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <LanguageSwitcher />
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>

            {/* ✅ CART ICON WITH BADGE */}
            {user && (
              <Link to="/cart" className="hidden lg:flex items-center">
                <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 rounded-full relative group">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-background animate-fade-in">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            )}
            
            {/* USER PROFILE */}
            {user ? (
              <div className="hidden lg:flex relative group items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full shadow-sm ml-1"
                >
                  <User className="w-5 h-5" />
                </Button>

                <div className="absolute right-0 top-12 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <Link 
                      to="/my-orders" 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10 text-sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20 border-0 transition-all duration-300 text-sm">
                    {t("nav.signup")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

export default Navbar;