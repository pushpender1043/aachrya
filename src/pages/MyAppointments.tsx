import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Check User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      // 2. Fetch User's Appointments
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          astrologers (name, image_url)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        // toast.error("Failed to load appointments"); // Silent fail for now
        console.error(error);
      } else {
        setAppointments(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Jitsi Meet Link Generator
  const getMeetingLink = (id: string) => {
    return `https://meet.jit.si/AcharyaJi-${id}`;
  };

  const handleJoin = (id: string) => {
    const link = getMeetingLink(id);
    window.open(link, "_blank");
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold gradient-text mb-8">My Appointments</h1>

        {!user ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Please login to view your appointments.</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-4">Book a session with Acharya Ji to get guidance.</p>
              <Button onClick={() => window.location.href = '/astrologers'}>Book Now</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((apt) => (
              <Card key={apt.id} className="hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Acharya {apt.astrologers?.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Vedic Consultation</p>
                    </div>
                    <Badge className={
                      apt.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                      apt.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-yellow-500/10 text-yellow-500'
                    }>
                      {apt.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(new Date(apt.appointment_date), "PPP")}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{apt.appointment_time}</span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    {apt.status === 'confirmed' ? (
                      <Button 
                        className="w-full glow-effect" 
                        onClick={() => handleJoin(apt.id)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Video Call
                      </Button>
                    ) : apt.status === 'completed' ? (
                      <Button variant="outline" className="w-full" disabled>
                        Session Completed
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        Waiting for confirmation
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyAppointments;