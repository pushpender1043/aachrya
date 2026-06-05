import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  astrologerId: string;
  astrologerName: string;
  price: number;
}

const TIME_SLOTS = [
  "10:00 AM - 10:30 AM",
  "11:00 AM - 11:30 AM",
  "04:00 PM - 04:30 PM",
  "05:00 PM - 05:30 PM",
  "06:00 PM - 06:30 PM",
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const AppointmentDialog = ({
  open,
  onOpenChange,
  astrologerId,
  astrologerName,
  price,
}: AppointmentDialogProps) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    phone: "",
    topic: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const handlePaymentAndBook = async () => {
    if (!user) {
      toast.error("Please login to book an appointment");
      return;
    }

    if (!formData.phone) {
      toast.error("Please provide your phone number");
      return;
    }

    setLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    const options = {
      key: "rzp_test_RfGakomKfHIGQm", // 🔴 IMPORTANT: Put your Razorpay Test Key here
      amount: price * 100, // Paise
      currency: "INR",
      name: "Aachrya Cosmic Guide",
      description: `Appointment with Acharya ${astrologerName}`,
      
      handler: async function (response: any) {
        try {
          const { error } = await supabase.from("appointments").insert({
            user_id: user.id,
            astrologer_id: astrologerId,
            appointment_date: format(date!, "yyyy-MM-dd"),
            appointment_time: selectedSlot,
            amount: price,
            status: "confirmed",
            payment_status: "paid", 
          });

          if (error) throw error;

          toast.success("Payment Successful! Appointment Booked ✨");
          
          // Reset internal states
          setStep(1);
          setDate(undefined);
          setSelectedSlot("");
          setFormData({ phone: "", topic: "" });

        } catch (error: any) {
          console.error("Booking Error:", error);
          toast.error("Payment succeeded but booking failed. Please contact support.");
        }
      },
      
      prefill: {
        name: user?.user_metadata?.full_name || "Seeker",
        email: user?.email || "",
        contact: formData.phone,
      },
      theme: {
        color: "#ea580c", 
      },
      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled. You can try booking again.");
        },
      },
    };

    // ✅ THE MAGIC FIX: Close our Popup first to remove the "Focus Trap" lock
    onOpenChange(false);
    setLoading(false);

    // ✅ Give a slight delay (300ms) so our popup completely closes before Razorpay opens
    setTimeout(() => {
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            with Acharya {astrologerName}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="bg-card text-card-foreground"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {date && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Available Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        className={cn(
                          "text-xs h-9",
                          selectedSlot === slot 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                className="w-full mt-4 glow-effect" 
                disabled={!date || !selectedSlot}
                onClick={() => setStep(2)}
              >
                Next Step
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-muted/50 rounded-lg border border-border flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span>{date ? format(date, "MMM dd, yyyy") : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{selectedSlot}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+91 9876543210" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-background border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Problem / Topic</Label>
                <Textarea 
                  id="topic" 
                  placeholder="What do you want to discuss? (e.g. Career, Marriage)" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="bg-background border-input"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="text-xl font-bold text-primary">₹{price}</span>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 glow-effect"
                    onClick={handlePaymentAndBook}
                    disabled={loading || !formData.phone}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay ₹${price} & Book`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;