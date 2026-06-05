import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, IndianRupee, Clock, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pooja {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  category: string | null;
  benefits: string[] | null;
  items_included: string[] | null;
}

interface PoojaBookingDialogProps {
  pooja: Pooja;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  "6:00 AM - 8:00 AM (Brahma Muhurta)",
  "8:00 AM - 10:00 AM (Morning)",
  "10:00 AM - 12:00 PM (Late Morning)",
  "4:00 PM - 6:00 PM (Evening)",
  "6:00 PM - 8:00 PM (Sandhya Kaal)",
];

const PoojaBookingDialog = ({ pooja, open, onOpenChange }: PoojaBookingDialogProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const handleDemoPayment = () => {
    return new Promise<boolean>((resolve) => {
      // Simulate payment processing
      setTimeout(() => {
        // 90% success rate for demo
        const success = Math.random() > 0.1;
        resolve(success);
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book a pooja");
      navigate("/auth");
      return;
    }

    if (!date || !timeSlot || !contactName || !contactPhone || !contactAddress) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    toast.info("Processing demo payment...");

    try {
      // Demo payment simulation
      const paymentSuccess = await handleDemoPayment();
      
      if (!paymentSuccess) {
        toast.error("Demo payment failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Demo payment successful!");

      const { error } = await supabase.from("pooja_bookings").insert({
        user_id: user.id,
        pooja_id: pooja.id,
        booking_date: format(date, "yyyy-MM-dd"),
        booking_time: timeSlot,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        special_requests: specialRequests,
        total_amount: pooja.price,
        status: "confirmed",
      });

      if (error) throw error;

      toast.success("Pooja booked successfully! We will contact you shortly.");
      onOpenChange(false);
      
      // Reset form
      setDate(undefined);
      setTimeSlot("");
      setContactName("");
      setContactPhone("");
      setContactAddress("");
      setSpecialRequests("");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Failed to book pooja. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">{pooja.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to book this sacred pooja
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Pooja Details */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-3">Pooja Details</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="flex items-center text-primary font-bold">
                    <IndianRupee className="w-4 h-4" />
                    {pooja.price.toLocaleString()}
                  </span>
                </div>
                {pooja.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="flex items-center text-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {pooja.duration}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {pooja.benefits && pooja.benefits.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <Check className="w-4 h-4 mr-2 text-primary" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {pooja.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="text-primary mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pooja.items_included && pooja.items_included.length > 0 && (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-accent" />
                  Items Included
                </h4>
                <div className="flex flex-wrap gap-1">
                  {pooja.items_included.map((item, idx) => (
                    <span key={idx} className="text-xs bg-accent/10 text-foreground px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 border-border",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Select Time Slot *</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="mt-1 border-border">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="mt-1 border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Enter your complete address for the pooja"
                className="mt-1 border-border"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="requests">Special Requests (Optional)</Label>
              <Textarea
                id="requests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any specific requirements or preferences"
                className="mt-1 border-border"
                rows={2}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-foreground font-semibold">Total Amount:</span>
                <span className="flex items-center text-primary font-bold text-xl">
                  <IndianRupee className="w-5 h-5" />
                  {pooja.price.toLocaleString()}
                </span>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-effect"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing Payment..." : "Pay & Confirm Booking (Demo)"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                🔒 This is a demo payment. No actual charges will be made.
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PoojaBookingDialog;
