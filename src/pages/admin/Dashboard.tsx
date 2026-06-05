import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // ✅ Layout Imports
import { AdminSidebar } from "@/components/admin/AdminSidebar"; // ✅ Sidebar Import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight,
  Activity,
  Loader2
} from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    products: 0,
    appointments: 0,
    pooja: 0,
    recentSales: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Product Revenue
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .neq("status", "cancelled");
        
        // 2. Fetch Pooja Revenue
        const { data: poojas } = await supabase
          .from("pooja_bookings")
          .select("total_amount")
          .neq("status", "cancelled");

        // 3. Fetch Appointments Revenue
        const { data: appointments } = await supabase
          .from("appointments")
          .select("amount") // Ensure 'amount' column exists or use static logic
          .neq("status", "cancelled");

        // Calculations
        const productRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const poojaRevenue = poojas?.reduce((sum, pooja) => sum + (pooja.total_amount || 0), 0) || 0;
        const apptRevenue = appointments?.reduce((sum, appt) => sum + (appt.amount || 500), 0) || 0; // Default 500 if null

        const totalRevenue = productRevenue + poojaRevenue + apptRevenue;

        setStats({
          total: totalRevenue,
          products: productRevenue,
          appointments: apptRevenue,
          pooja: poojaRevenue,
          recentSales: []
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculation helpers
  const productPercent = stats.total > 0 ? Math.round((stats.products / stats.total) * 100) : 0;
  const poojaPercent = stats.total > 0 ? Math.round((stats.pooja / stats.total) * 100) : 0;
  const apptPercent = stats.total > 0 ? Math.round((stats.appointments / stats.total) * 100) : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background/95">
        
        {/* ✅ SIDEBAR RESTORED */}
        <AdminSidebar />
        
        <main className="flex-1 p-6 w-full overflow-y-auto">
          {/* Mobile Sidebar Trigger */}
          <SidebarTrigger className="md:hidden mb-4" />

          {loading ? (
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h2>
                  <p className="text-muted-foreground">Overview of your spiritual business performance.</p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Activity className="w-4 h-4" /> Live Updates
                </div>
              </div>

              {/* 1. TOP CARDS: Revenue Breakdown */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                
                {/* Total Revenue */}
                <Card className="bg-gradient-to-br from-primary to-purple-700 text-white border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
                    <IndianRupee className="h-4 w-4 text-white/80" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
                    <p className="text-xs text-white/60 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" /> Lifetime Earnings
                    </p>
                  </CardContent>
                </Card>

                {/* Product Sales */}
                <Card className="hover:border-blue-500/50 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.products.toLocaleString()}</div>
                    <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${productPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{productPercent}% of total</p>
                  </CardContent>
                </Card>

                {/* Consultations */}
                <Card className="hover:border-green-500/50 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.appointments.toLocaleString()}</div>
                    <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${apptPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{apptPercent}% of total</p>
                  </CardContent>
                </Card>

                {/* Pooja Bookings */}
                <Card className="hover:border-orange-500/50 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pooja Services</CardTitle>
                    <Sparkles className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.pooja.toLocaleString()}</div>
                    <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${poojaPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{poojaPercent}% of total</p>
                  </CardContent>
                </Card>
              </div>

              {/* 2. SECOND ROW: Analysis & Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Revenue Source Visualizer */}
                <Card className="col-span-4 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Revenue Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Products</span>
                            <span className="font-bold">₹{stats.products.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${productPercent}%` }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Consultations</span>
                            <span className="font-bold">₹{stats.appointments.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${apptPercent}%` }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Pooja Services</span>
                            <span className="font-bold">₹{stats.pooja.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: `${poojaPercent}%` }} />
                        </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Insights / Info */}
                <Card className="col-span-3 bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> 
                        Business Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">Top Performing</h4>
                            <p className="text-xs text-muted-foreground">
                                {stats.products >= stats.pooja && stats.products >= stats.appointments ? "Products Store" : 
                                 stats.pooja > stats.products && stats.pooja > stats.appointments ? "Pooja Services" : "Consultations"} 
                                is leading the revenue this month.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold">Growth Tip</h4>
                            <p className="text-xs text-muted-foreground">
                                Try promoting 
                                {stats.products < stats.pooja ? " Products " : " Pooja Services "} 
                                on your blog to balance revenue.
                            </p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;