import { useState } from "react";
import { MessageCircle, Phone, Video, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "./ui/use-toast";

interface Astrologer {
  id: number;
  name: string;
  specialization: string;
  price: number;
  image: string;
}

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  astrologer: Astrologer | null;
  consultationType: "chat" | "voice" | "video" | null;
}

const ConsultationDialog = ({
  open,
  onOpenChange,
  astrologer,
  consultationType,
}: ConsultationDialogProps) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  if (!astrologer || !consultationType) return null;

  const handleStartConsultation = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      toast({
        title: "Connecting...",
        description: `Starting ${consultationType} consultation with ${astrologer.name}`,
      });
      setIsConnecting(false);
      onOpenChange(false);
      
      // Navigate to consultation interface
      window.location.href = `/consultation/${consultationType}/${astrologer.id}`;
    }, 1500);
  };

  const getIcon = () => {
    switch (consultationType) {
      case "chat":
        return <MessageCircle className="w-12 h-12 text-primary" />;
      case "voice":
        return <Phone className="w-12 h-12 text-primary" />;
      case "video":
        return <Video className="w-12 h-12 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (consultationType) {
      case "chat":
        return "Start Chat Consultation";
      case "voice":
        return "Start Voice Call";
      case "video":
        return "Start Video Call";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              {getIcon()}
            </div>
          </div>

          {/* Astrologer Info */}
          <div className="text-center space-y-2">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-primary/20">
              <img
                src={astrologer.image}
                alt={astrologer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">{astrologer.name}</h3>
            <p className="text-sm text-muted-foreground">{astrologer.specialization}</p>
            <p className="text-2xl font-bold text-primary">₹{astrologer.price}/min</p>
          </div>

          {/* Consultation Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consultation Type:</span>
              <span className="font-medium capitalize">{consultationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-medium">₹{astrologer.price}/minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Duration:</span>
              <span className="font-medium">5 minutes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleStartConsultation}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Start Consultation"}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-center text-muted-foreground">
            You will be charged ₹{astrologer.price} per minute. Minimum charge applies for 5 minutes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
