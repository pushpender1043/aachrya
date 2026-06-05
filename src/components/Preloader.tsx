import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sunLogo from "@/assets/sun-logo.png";

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Total animation time 3.5 seconds for the full magical effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  // SVG path variants for the drawing animation
  const pathVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
        opacity: 1, 
        pathLength: 1,
        transition: { 
            duration: 2,
            ease: "easeInOut"
        }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          // EXIT ANIMATION: The Portal opens up (Scale up and fade out)
          exit={{ 
            opacity: 0,
            scale: 2, // Bada hokar gayab hoga
            filter: "blur(20px)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0a041a]"
        >
            {/* --- Background Ambient Light --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] mix-blend-overlay" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* --- CENTERPIECE: Logo & SVG Drawing Rings --- */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    
                    {/* Spinning Sun Logo in Center */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 1.5, ease: "backOut" }}
                        className="relative z-20"
                    >
                         {/* Glow behind logo */}
                        <div className="absolute inset-0 bg-orange-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <img 
                            src={sunLogo} 
                            alt="Aachrya" 
                            className="w-24 h-24 drop-shadow-[0_0_20px_rgba(255,165,0,0.8)] relative z-10"
                        />
                    </motion.div>

                    {/* SVG Mandala/Cosmic Rings Drawing Animation */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                        {/* Inner Ring - Dashed */}
                        <motion.circle
                            cx="100" cy="100" r="50"
                            stroke="url(#paint0_linear)" strokeWidth="2" fill="none"
                            strokeDasharray="10 5"
                            variants={pathVariants} initial="hidden" animate="visible"
                            style={{ rotate: -90, transformOrigin: "center" }}
                        />
                        {/* Middle Ring - Solid */}
                        <motion.circle
                            cx="100" cy="100" r="70"
                            stroke="url(#paint1_linear)" strokeWidth="1.5" fill="none"
                            variants={pathVariants} initial="hidden" animate="visible"
                            transition={{ delay: 0.3, duration: 2 }} // Slight delay
                            style={{ rotate: 90, transformOrigin: "center" }}
                        />
                        {/* Outer Ring - Complex Pattern Simulated */}
                        <motion.path
                            d="M100,10 A90,90 0 1,1 99.9,10" // Full circle path
                            stroke="url(#paint2_linear)" strokeWidth="3" fill="none" strokeLinecap="round"
                            strokeDasharray="20 30 10 30" // Makes it look like ancient markings
                            variants={pathVariants} initial="hidden" animate="visible"
                            transition={{ delay: 0.6, duration: 2.2 }}
                        />

                        {/* Gradients for Gold/Orange look */}
                        <defs>
                            <linearGradient id="paint0_linear" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF8C00" />
                                <stop offset="100%" stopColor="#FFD700" />
                            </linearGradient>
                            <linearGradient id="paint1_linear" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FFA500" />
                                <stop offset="100%" stopColor="#FF4500" />
                            </linearGradient>
                            <linearGradient id="paint2_linear" x1="50%" y1="0%" x2="50%" y2="100%">
                                <stop offset="0%" stopColor="#FFD700" />
                                <stop offset="50%" stopColor="#FF8C00" />
                                <stop offset="100%" stopColor="#FFD700" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* --- Loading Text --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center space-y-2"
                >
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 tracking-[0.2em] uppercase drop-shadow-sm">
                        Aachrya
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-orange-200/70 text-sm tracking-widest">
                        <span className="w-8 h-[1px] bg-orange-200/30"></span>
                        Aligning Stars...
                        <span className="w-8 h-[1px] bg-orange-200/30"></span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;