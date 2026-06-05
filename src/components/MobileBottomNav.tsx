import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, ShoppingBag, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MobileBottomNav = () => {
  const location = useLocation();

  // Helper to check active state
  const isActive = (path: string) => location.pathname === path;

  // Icons List (Main Tabs)
  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Consult", icon: User, path: "/astrologers" }, // Papa se baat
    { label: "Pooja", icon: Sparkles, path: "/poojas" },
    { label: "Shop", icon: ShoppingBag, path: "/products" },
  ];

  // Extra Menu Items (Jo Drawer mein rahenge)
  const menuItems = [
    { label: "Kundli Generator", path: "/kundli" },
    { label: "Calculators", path: "/calculators" },
    { label: "Blogs", path: "/blogs" },
    { label: "My Appointments", path: "/my-appointments" },
    { label: "Cart", path: "/cart" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* 1. Main 4 Tabs */}
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "fill-current" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* 2. Fifth Item: "Menu" (Triggers Drawer) */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-card/95 backdrop-blur-xl border-r border-border">
            <div className="flex flex-col h-full py-6">
              <h2 className="text-xl font-bold gradient-text px-4 mb-6">Aachrya Ji</h2>
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                  {/* Repeat Main Links for clarity */}
                  <p className="text-xs font-semibold text-muted-foreground px-4 mb-2 uppercase tracking-wider">Main</p>
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <Button variant="ghost" className="w-full justify-start mb-1">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                        </Button>
                    </Link>
                  ))}
                  
                  <Separator className="my-4 bg-border/50" />
                  
                  {/* Other Links */}
                  <p className="text-xs font-semibold text-muted-foreground px-4 mb-2 uppercase tracking-wider">Explore</p>
                  {menuItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <Button variant="ghost" className="w-full justify-start mb-1 text-muted-foreground hover:text-foreground">
                            {item.label}
                        </Button>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="mt-auto px-4 pt-4 border-t border-border">
                <Link to="/auth">
                    <Button className="w-full glow-effect">Login / Sign Up</Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
};

export default MobileBottomNav;