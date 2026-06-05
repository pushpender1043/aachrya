import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Sparkles, Search } from "lucide-react"; // Added Icons
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "See you again, Acharya Ji! 🙏",
    });
    navigate("/");
  };

  // 1. Premium Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0514] text-white">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Sparkles className="w-16 h-16 text-primary animate-spin-slow relative z-10" />
        </div>
        <p className="mt-6 text-lg font-medium text-muted-foreground animate-pulse">
          Accessing Cosmic Dashboard...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0514] text-foreground font-sans selection:bg-primary/30">
        
        {/* Sidebar */}
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* 2. Background Glow Effects */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

          {/* 3. Floating Glass Header */}
          <header className="h-20 sticky top-0 z-40 border-b border-white/5 bg-[#0a0514]/80 backdrop-blur-xl flex items-center justify-between px-6 transition-all duration-300">
            
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-white/10 text-white transition-colors" />
              
              {/* Optional: Global Search Bar in Header */}
              <div className="hidden md:flex items-center relative">
                 <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                 <Input 
                   placeholder="Quick Search..." 
                   className="pl-9 w-64 h-9 bg-white/5 border-white/10 text-sm focus:bg-white/10 transition-all rounded-full"
                 />
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Notification Icon (Visual Only) */}
               <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors group">
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
               </button>

               <div className="h-6 w-px bg-white/10 mx-1" />

               {/* Profile & Logout */}
               <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-white">Admin</p>
                    <p className="text-[10px] text-green-400">System Active</p>
                  </div>
                  
                  <Avatar className="h-9 w-9 border border-primary/20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
               </div>
            </div>
          </header>

          {/* 4. Main Content Area */}
          <main className="flex-1 p-6 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
             <div className="animate-fade-in">
                {children}
             </div>
          </main>
          
        </div>
      </div>
    </SidebarProvider>
  );
};