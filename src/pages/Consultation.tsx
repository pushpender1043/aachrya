import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Video, Send, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import astrologerImage from "@/assets/astrologer-1.jpg";
import { useWebRTC } from "@/hooks/useWebRTC";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  sender: "user" | "astrologer";
  content: string;
  timestamp: Date;
}

const Consultation = () => {
  const { type, astrologerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [duration, setDuration] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const roomId = `${astrologerId}-${Date.now()}`;
  const {
    localStream,
    remoteStream,
    isConnected,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    cleanup,
  } = useWebRTC({
    roomId,
    isInitiator: true,
  });

  // Get current user and load messages
  useEffect(() => {
    const initConsultation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);
      const sessionId = `${user.id}-${astrologerId}-${Date.now()}`;
      setConsultationId(sessionId);

      // Load existing messages for this consultation
      const { data: existingMessages, error } = await supabase
        .from("consultation_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("astrologer_id", astrologerId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else if (existingMessages) {
        const loadedMessages: Message[] = existingMessages.map((msg) => ({
          id: Date.parse(msg.created_at),
          sender: msg.sender as "user" | "astrologer",
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    };

    initConsultation();
  }, [astrologerId, navigate, toast]);

  // Mock astrologer data
  const astrologer = {
    id: astrologerId,
    name: "Pandit Raj Kumar",
    specialization: "Vedic Astrology",
    price: 30,
    image: astrologerImage,
  };

  // Timer for consultation duration
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isConnected && (type === "video" || type === "voice")) {
      toast({
        title: "Connected",
        description: "You are now connected with the astrologer",
      });
    }
  }, [isConnected, type]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !userId || !consultationId) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Save message to database
    const { error } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: consultationId,
        user_id: userId,
        astrologer_id: astrologerId!,
        sender: "user",
        content: newMessage.content,
      });

    if (error) {
      console.error("Error saving message:", error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
    }

    // Simulate astrologer response
    setTimeout(async () => {
      const response: Message = {
        id: Date.now(),
        sender: "astrologer",
        content: "Thank you for your question. Let me analyze your chart...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);

      // Save astrologer response to database
      await supabase
        .from("consultation_messages")
        .insert({
          consultation_id: consultationId,
          user_id: userId,
          astrologer_id: astrologerId!,
          sender: "astrologer",
          content: response.content,
        });
    }, 2000);
  };

  const handleEndConsultation = () => {
    cleanup();
    toast({
      title: "Consultation Ended",
      description: `Duration: ${formatDuration(duration)} | Total: ₹${Math.ceil(duration / 60) * astrologer.price}`,
    });
    navigate("/astrologers");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 cosmic-bg">
        <div className="container mx-auto px-4 h-[calc(100vh-80px)]">
          <div className="cosmic-card h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={astrologer.image}
                      alt={astrologer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{astrologer.name}</h2>
                    <p className="text-sm text-muted-foreground">{astrologer.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold text-primary">{formatDuration(duration)}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEndConsultation}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex">
              {/* Video/Voice Area (for video/voice calls) */}
              {(type === "video" || type === "voice") && (
                <div className="flex-1 bg-muted/20 flex items-center justify-center relative">
                  {type === "video" ? (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Video className="w-16 h-16 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Video call in progress...</p>
                      <p className="text-xs text-muted-foreground">
                        Video calling requires integration with services like Twilio or Agora
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                        <Phone className="w-16 h-16 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Voice call in progress...</p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                    {type === "video" && (
                      <Button
                        size="lg"
                        variant={isCameraOn ? "default" : "secondary"}
                        className="rounded-full w-14 h-14"
                        onClick={toggleCamera}
                      >
                        {isCameraOn ? (
                          <Video className="w-6 h-6" />
                        ) : (
                          <VideoOff className="w-6 h-6" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant={isMicOn ? "default" : "secondary"}
                      className="rounded-full w-14 h-14"
                      onClick={toggleMic}
                    >
                      {isMicOn ? (
                        <Mic className="w-6 h-6" />
                      ) : (
                        <MicOff className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat Area */}
              {type === "chat" && (
                <div className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                        maxLength={10000}
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Consultation;
