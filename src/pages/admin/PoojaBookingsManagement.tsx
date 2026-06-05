import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  CalendarCheck, 
  Check, 
  X, 
  IndianRupee, 
  Search, 
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Booking {
  id: string;
  pooja_id: string;
  contact_name: string;
  contact_phone: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
  pooja_name?: string;
}

const PoojaBookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Fetching Logic (UNCHANGED - Backend Safe)
  const fetchBookings = async () => {
    try {
      setLoading(true);

      // 1. Saari Bookings lao
      const { data: bookingsData, error: bookingError } = await supabase
        .from("pooja_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingError) throw bookingError;

      // 2. Pooja ke naam lao
      const { data: poojasData } = await supabase
        .from("poojas")
        .select("id, name");

      // 3. Merge Data
      const formattedBookings = bookingsData?.map((booking) => {
        const poojaDetails = poojasData?.find((p) => p.id === booking.pooja_id);
        return {
          ...booking,
          pooja_name: poojaDetails?.name || "Unknown Pooja",
        };
      });

      setBookings(formattedBookings || []);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Status Update Logic
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("pooja_bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Stats Calculations
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + (b.total_amount || 0) : sum, 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // Filter Logic
  const filteredBookings = bookings.filter(b => 
    b.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.pooja_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 w-full overflow-hidden">
          <SidebarTrigger className="md:hidden mb-4" />

          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" /> Pooja Bookings
                </h1>
                <p className="text-muted-foreground">Manage spiritual service requests.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600 uppercase tracking-wider">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 flex items-center">
                    <IndianRupee className="w-6 h-6 mr-1" />
                    {totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Pending */}
              <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600 uppercase tracking-wider">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-700 flex items-center gap-2">
                    {pendingCount}
                    <Clock className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              {/* Completed */}
              <Card className="bg-green-500/5 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600 uppercase tracking-wider">Successfully Done</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 flex items-center gap-2">
                    {completedCount}
                    <CalendarCheck className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Customer Name or Pooja..." 
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pooja Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No bookings found.</TableCell></TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                              <span className="font-medium">{booking.contact_name}</span>
                              <span className="text-xs text-muted-foreground">{booking.contact_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {booking.pooja_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">
                                {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {booking.booking_time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          <div className="flex items-center text-green-600">
                              <IndianRupee className="w-3 h-3 mr-1" />
                              {booking.total_amount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-500/10 text-green-500 border-0"
                                : booking.status === "completed"
                                ? "bg-blue-500/10 text-blue-500 border-0"
                                : "bg-yellow-500/10 text-yellow-500 border-0"
                            }
                          >
                            {booking.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {booking.status === 'pending' && (
                                <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => updateStatus(booking.id, "confirmed")}
                                >
                                    Confirm
                                </Button>
                            )}
                            {booking.status === 'confirmed' && (
                                <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                onClick={() => updateStatus(booking.id, "completed")}
                                title="Mark Completed"
                                >
                                <Check className="h-4 w-4" />
                                </Button>
                            )}
                            {booking.status !== "cancelled" && booking.status !== "completed" && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => updateStatus(booking.id, "cancelled")}
                                title="Cancel Booking"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PoojaBookingsManagement;