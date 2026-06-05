import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, LogIn, Sparkles, Trash2, User, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner"; // ✅ Updated to Sonner for consistency
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "What's my daily horoscope? 🔮",
  "Tell me about my zodiac sign ♈",
  "Best time for marriage? 💍",
  "Career guidance needed 💼",
  "Love & relationship advice ❤️",
  "Health wellness tips 🧘",
];

const AstrologyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 I am your cosmic guide. Ask me anything about your stars, planets, or future.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- Auth Check ---
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  // --- Handlers ---
  const handleQuickQuestion = (question: string) => {
    streamChat(question);
  };

  const handleClearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. What else would you like to know? ✨",
    }]);
  };

  const streamChat = async (userMessage: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to consult the cosmic AI.");
      return;
    }

    if (!userMessage.trim()) return;

    setIsLoading(true);
    setInput(""); // Clear input immediately
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/astrology-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) throw new Error("Cosmic connection failed");
      if (!response.body) throw new Error("No response from stars");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      
      // Placeholder for AI response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { 
                    role: "assistant", 
                    content: assistantMessage 
                  };
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("The stars are silent right now. Please try again later.");
      // Remove the empty assistant message if error occurred
      setMessages((prev) => prev.slice(0, -1)); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      streamChat(input);
    }
  };

  // Helper to format text (Simple Bold support)
  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => 
      part.startsWith("**") && part.endsWith("**") ? 
        <strong key={index} className="text-orange-400">{part.slice(2, -2)}</strong> : part
    );
  };

  return (
    <>
      {/* --- Chat Window --- */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[600px] bg-background/95 backdrop-blur-xl border-t sm:border border-orange-500/20 sm:rounded-2xl shadow-2xl z-[60] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-orange-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Aachrya AI</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vedic Guide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="text-white/80 hover:text-white hover:bg-white/20"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-orange-50/10 dark:from-background dark:to-orange-950/10" ref={scrollRef}>
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 mt-1 border border-orange-500/30">
                      <AvatarFallback className="bg-orange-100 text-orange-600"><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-tr-sm"
                        : "bg-card border border-orange-100 dark:border-orange-900/50 text-foreground rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{formatText(message.content)}</p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-8 h-8 mt-1 border border-border">
                      <AvatarFallback className="bg-secondary"><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                   <Avatar className="w-8 h-8 mt-1 border border-orange-500/30">
                      <AvatarFallback className="bg-orange-100 text-orange-600"><Bot className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                   <div className="bg-card border border-orange-100 dark:border-orange-900/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Questions (Visible only when chat is empty-ish) */}
          {messages.length < 3 && !isLoading && (
            <div className="px-4 pb-2">
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 text-muted-foreground px-3 py-1.5 transition-all"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
            {isAuthenticated === false ? (
              <div className="flex flex-col gap-3 items-center text-center py-2">
                <p className="text-sm text-muted-foreground">Unlock cosmic wisdom by logging in.</p>
                <Button onClick={() => { setIsOpen(false); navigate("/auth"); }} className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
                  <LogIn className="w-4 h-4 mr-2" /> Login to Chat
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your destiny..."
                  disabled={isLoading}
                  className="flex-1 bg-secondary/50 border-orange-200/50 focus-visible:ring-orange-500 rounded-xl"
                />
                <Button
                  onClick={() => streamChat(input)}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-90 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Floating Button --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 group"
        >
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
          
          {/* Button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3 border-4 border-white/10 backdrop-blur-md">
            <Bot className="w-8 h-8 text-white animate-pulse" />
            
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-bold py-2 px-4 rounded-xl shadow-xl whitespace-nowrap border border-orange-100 dark:border-orange-900 flex items-center gap-2">
              <span>Ask AI Astrologer</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
          </div>
        </button>
      )}
    </>
  );
};

export default AstrologyBot;