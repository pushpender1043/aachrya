import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Loader2, ArrowRight, TrendingUp, Heart, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire" },
  { name: "Taurus", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth" },
  { name: "Gemini", symbol: "♊", dates: "May 21 - Jun 20", element: "Air" },
  { name: "Cancer", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water" },
  { name: "Leo", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire" },
  { name: "Virgo", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth" },
  { name: "Libra", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air" },
  { name: "Scorpio", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire" },
  { name: "Capricorn", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth" },
  { name: "Aquarius", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air" },
  { name: "Pisces", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water" },
];

// Mock Data Generator to simulate "Real-time" daily updates
const generateDailyPrediction = (signName: string) => {
  const today = new Date().toDateString(); // Ensures prediction changes daily
  
  // Dynamic arrays for variety
  const moods = ["Optimistic", "Reflective", "Energetic", "Calm", "Ambitious", "Romantic"];
  const colors = ["Saffron Orange", "Golden Yellow", "Deep Purple", "Cosmic Blue", "Ruby Red", "Emerald Green"];
  const matches = ["Leo", "Virgo", "Libra", "Scorpio", "Aries", "Gemini"];
  
  // Randomizer based on date + sign (pseudo-random)
  const seed = signName.length + new Date().getDate();
  
  return {
    prediction: `Today, the cosmic alignment suggests a powerful shift for ${signName}. The movement of the Moon brings clarity to your emotional sector. Focus on your goals, as Saturn's influence rewards discipline. A surprise encounter in the evening could change your perspective.`,
    love: "Passion is high today. Express your feelings openly.",
    career: "New opportunities are knocking. Be ready to lead.",
    health: "Drink water and meditate for 10 minutes.",
    luckyNumber: Math.floor(Math.random() * 99) + 1,
    luckyColor: colors[seed % colors.length],
    mood: moods[seed % moods.length],
    match: matches[seed % matches.length]
  };
};

const DailyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { t } = useLanguage();

  // Load Initial Data
  useEffect(() => {
    fetchHoroscope(ZODIAC_SIGNS[0]);
  }, []);

  const fetchHoroscope = (sign: typeof ZODIAC_SIGNS[0]) => {
    setLoading(true);
    setSelectedSign(sign);
    setData(null);

    // Simulate API Call Delay for "Real-time" feel
    setTimeout(() => {
      const result = generateDailyPrediction(sign.name);
      setData(result);
      setLoading(false);
    }, 1200); // 1.2s delay for "Connecting to Stars..." effect
  };

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 border-orange-200">
             <Star className="w-3 h-3 mr-1" /> Daily Guidance
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("horoscope.title") || "Daily"} <span className="gradient-text">{t("horoscope.titleHighlight") || "Horoscope"}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your zodiac sign to reveal what the stars have planned for you today.
          </p>
        </div>

        {/* Zodiac Selector Grid */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {ZODIAC_SIGNS.map((sign, index) => (
            <motion.button
              key={sign.name}
              onClick={() => fetchHoroscope(sign)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300
                ${selectedSign.name === sign.name 
                  ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(255,165,0,0.4)]" 
                  : "border-border bg-card/50 text-muted-foreground hover:border-orange-300 hover:text-orange-400"
                }
              `}
            >
              <span className="text-2xl">{sign.symbol}</span>
              {selectedSign.name === sign.name && (
                <motion.div 
                  layoutId="active-ring"
                  className="absolute -inset-1 rounded-full border-2 border-orange-500/30 animate-pulse" 
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Prediction Display Area */}
        <div className="max-w-4xl mx-auto min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[400px] space-y-4"
              >
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Star className="w-6 h-6 text-orange-400 animate-pulse" />
                   </div>
                </div>
                <p className="text-lg font-medium gradient-text animate-pulse">Connecting to the Cosmos...</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                 <Card className="relative overflow-hidden border-orange-200/50 dark:border-orange-800/50 bg-card/80 backdrop-blur-xl shadow-2xl">
                    {/* Glowing Top Border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                    
                    <div className="p-8 md:p-10 grid md:grid-cols-[1fr_2fr] gap-8">
                        
                        {/* Left Column: Sign Info */}
                        <div className="text-center md:text-left space-y-6 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
                            <div>
                                <div className="text-6xl md:text-8xl font-thin text-foreground/10 absolute -top-4 -left-4 select-none">
                                    {selectedSign.symbol}
                                </div>
                                <div className="relative">
                                    <h3 className="text-4xl font-bold text-foreground">{selectedSign.name}</h3>
                                    <p className="text-muted-foreground font-medium">{selectedSign.dates}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Lucky Number</div>
                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{data?.luckyNumber}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Lucky Color</div>
                                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{data?.luckyColor}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Prediction Details */}
                        <div className="space-y-6">
                             <div className="space-y-2">
                                <h4 className="text-xl font-semibold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-orange-500" /> 
                                    Daily Prediction
                                </h4>
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    {data?.prediction}
                                </p>
                             </div>

                             <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-2 text-rose-500">
                                        <Heart className="w-4 h-4" /> Love
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data?.love}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-2 text-amber-500">
                                        <Zap className="w-4 h-4" /> Career
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data?.career}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-2 text-emerald-500">
                                        <TrendingUp className="w-4 h-4" /> Health
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data?.health}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-2 text-blue-500">
                                        <Star className="w-4 h-4" /> Mood
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data?.mood}</p>
                                </div>
                             </div>

                             <div className="pt-4 flex justify-end">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 group">
                                    View Full Chart <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                        </div>

                    </div>
                 </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default DailyHoroscope;