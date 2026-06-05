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
import { 
  Loader2, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  XCircle, 
  User,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          astrologers (name, image_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Update Status Logic
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Video Call Link
  const getMeetingLink = (id: string) => `https://meet.jit.si/AcharyaJi-${id}`;

  const handleJoin = (id: string) => {
    window.open(getMeetingLink(id), "_blank");
  };

  // Filter
  const filteredAppointments = appointments.filter(app => 
    app.astrologers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <Calendar className="w-8 h-8 text-primary" /> Consultations
                </h1>
                <p className="text-muted-foreground">Manage video calls and schedules.</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Total</p>
                    <p className="text-2xl font-bold text-primary">{appointments.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary/20" />
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {appointments.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500/20" />
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500/20" />
                </CardContent>
              </Card>
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {appointments.filter(a => a.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-blue-500/20" />
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Astrologer or Status..." 
                className="pl-10 bg-card"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Appointments Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Astrologer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredAppointments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No appointments found.</TableCell></TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{apt.astrologers?.name || "Acharya Ji"}</p>
                              <p className="text-xs text-muted-foreground">Video Consultation</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-muted-foreground" /> 
                              {format(new Date(apt.appointment_date), "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" /> {apt.appointment_time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {apt.duration} Mins
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            apt.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-0' : 
                            apt.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-0' : 
                            apt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-0' :
                            'bg-yellow-500/10 text-yellow-500 border-0'
                          }>
                            {apt.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            
                            {/* Actions based on Status */}
                            {apt.status === 'pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(apt.id, 'confirmed')}>
                                Accept
                              </Button>
                            )}

                            {apt.status === 'confirmed' && (
                              <>
                                <Button size="sm" className="animate-pulse bg-primary hover:bg-primary/90" onClick={() => handleJoin(apt.id)}>
                                  <Video className="w-4 h-4 mr-1" /> Join
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, 'completed')}>
                                  Complete
                                </Button>
                              </>
                            )}

                            {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                              <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => updateStatus(apt.id, 'cancelled')}>
                                <XCircle className="w-4 h-4" />
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

export default AdminAppointments;