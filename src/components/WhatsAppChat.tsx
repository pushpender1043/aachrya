import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WhatsAppChat = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Replace with your actual WhatsApp business number
  const phoneNumber = "1234567890";
  const message = "Hello! I need help with astrology services.";
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 animate-float-slow"
        aria-label="Chat on WhatsApp"
      >
        {/* Icon container */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full">
          <MessageCircle className="w-7 h-7" />
        </div>
        
        {/* Expandable text */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isHovered ? "max-w-[200px] pr-5" : "max-w-0"
          }`}
        >
          <span className="whitespace-nowrap font-medium">Chat with us!</span>
        </div>
        
        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping"></div>
      </button>
      
      {/* Tooltip on mobile */}
      {!isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-card text-foreground text-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none md:hidden">
          Need help? Chat now!
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;
