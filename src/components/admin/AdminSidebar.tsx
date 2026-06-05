import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Star, 
  FileText, 
  Sparkles, 
  CalendarCheck, 
  LogOut,
  Flower2, 
  MessageSquare,
  Settings,      // ✅ Added Settings Icon
  Image,         // ✅ Added Image Icon for Banners
  ChevronRight
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import sunLogo from "@/assets/sun-logo.png";

// ✅ Final Menu Items Configuration
const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Appointments", url: "/admin/appointments", icon: CalendarCheck },
  { title: "Support Inbox", url: "/admin/support", icon: MessageSquare },
   // ✅ New: Banners Manager
  { title: "Pooja Services", url: "/admin/poojas", icon: Flower2 }, 
  { title: "Pooja Bookings", url: "/admin/pooja-bookings", icon: Sparkles },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Astrologers", url: "/admin/astrologers", icon: Star },
  { title: "Blogs", url: "/admin/blogs", icon: FileText },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings }, // ✅ New: Settings
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#0f0a1e] text-white">
      
      {/* 1. Header (Logo) */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/5">
        <div className="flex items-center gap-2 px-2 w-full transition-all duration-300">
           <img src={sunLogo} alt="Logo" className="w-8 h-8 animate-pulse" />
           {!isCollapsed && (
             <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
               Admin<span className="text-white">Panel</span>
             </span>
           )}
        </div>
      </SidebarHeader>

      {/* 2. Menu Items */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 uppercase tracking-widest text-[10px] mb-2 px-2">
            {!isCollapsed ? "Management" : "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      className={`
                        w-full transition-all duration-200 rounded-xl px-3 py-6
                        ${isActive 
                          ? "bg-primary/20 text-primary border-l-4 border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? "animate-bounce-subtle" : ""}`} />
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium text-sm">{item.title}</span>
                            {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer (Profile & Logout) */}
      <SidebarFooter className="border-t border-white/5 p-4 bg-black/20">
        <SidebarMenu>
          <SidebarMenuItem>
             <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                <Avatar className="w-9 h-9 border border-primary/30 cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
                </Avatar>
                
                {!isCollapsed && (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">Admin User</span>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                    </span>
                  </div>
                )}
                
                {!isCollapsed && (
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
             </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}