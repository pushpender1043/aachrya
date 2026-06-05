import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, ChevronRight, Sun, Moon, Sparkles, 
  Calendar as CalendarIcon, Clock, Flame, ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HINDU CONSTANTS ---
const HINDU_MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", 
  "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", 
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni"
];

// --- FESTIVALS (Demo Data) ---
const FESTIVALS: Record<string, string> = {
  "1-14": "Makar Sankranti", "1-26": "Republic Day",
  "3-8": "Maha Shivratri", "3-25": "Holi",
  "4-17": "Ram Navami", "8-15": "Independence Day",
  "8-19": "Raksha Bandhan", "8-26": "Janmashtami",
  "9-7": "Ganesh Chaturthi", "10-12": "Dussehra",
  "11-1": "Diwali", "12-25": "Christmas"
};

const Panchang = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jumpDate, setJumpDate] = useState("");

  // --- LOGIC: Tithi Calculation (Approx) ---
  const getTithiInfo = (date: Date) => {
    const knownNewMoon = new Date('2000-01-06'); 
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const daysSince = diffTime / (1000 * 60 * 60 * 24);
    const cycleLength = 29.53059;
    const phase = daysSince % cycleLength;
    
    // Paksha
    const isShukla = phase < 14.76;
    const paksha = isShukla ? "Shukla Paksha" : "Krishna Paksha";
    
    // Tithi Index (0-14)
    let tithiIndex = Math.floor(phase) % 15;
    if (!isShukla) tithiIndex = Math.floor(phase - 14.76) % 15;
    
    // Special Cases
    let tithiName = TITHIS[tithiIndex] || "Pratipada";
    if (Math.abs(phase - 14.76) < 1) tithiName = "Purnima 🌕"; // Full Moon
    if (phase < 1 || phase > 28.5) tithiName = "Amavasya 🌑"; // New Moon

    return { name: tithiName, paksha, isShukla };
  };

  // --- LOGIC: Vedic Timings (Based on Weekday) ---
  const getVedicTimings = (date: Date) => {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Static logic for demo (In real app, calculate based on sunrise)
    const rahuKaalMap = ["04:30 PM - 06:00 PM", "07:30 AM - 09:00 AM", "03:00 PM - 04:30 PM", "12:00 PM - 01:30 PM", "01:30 PM - 03:00 PM", "10:30 AM - 12:00 PM", "09:00 AM - 10:30 AM"];
    const yamagandaMap = ["12:00 PM - 01:30 PM", "10:30 AM - 12:00 PM", "09:00 AM - 10:30 AM", "07:30 AM - 09:00 AM", "06:00 AM - 07:30 AM", "03:00 PM - 04:30 PM", "01:30 PM - 03:00 PM"];

    return {
      rahuKaal: rahuKaalMap[day],
      yamaganda: yamagandaMap[day],
      nakshatra: NAKSHATRAS[(date.getDate() + date.getMonth()) % NAKSHATRAS.length] // Pseudo-random logic
    };
  };

  // --- HANDLERS ---
  const handleJumpDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateStr = e.target.value;
    setJumpDate(newDateStr);
    if (newDateStr) {
      const newDate = new Date(newDateStr);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // --- CALENDAR GRID GENERATION ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const selectedTithiInfo = getTithiInfo(selectedDate);
  const vedicTimings = getVedicTimings(selectedDate);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-black/5 dark:bg-white/5 rounded-lg opacity-50"></div>);

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const dateStr = `${currentDate.getMonth() + 1}-${d}`;
    const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
    const isSelected = d === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
    const tithi = getTithiInfo(thisDate);
    const festival = FESTIVALS[dateStr];

    calendarDays.push(
      <motion.div
        key={d}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedDate(thisDate)}
        className={`
          relative p-1 md:p-2 h-24 md:h-28 rounded-xl border flex flex-col justify-between cursor-pointer transition-all overflow-hidden group
          ${isSelected ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.3)]" : "border-border/40 bg-card/60 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"}
          ${isToday ? "ring-2 ring-blue-500 bg-blue-500/5" : ""}
        `}
      >
        {/* Date Number & Festival Dot */}
        <div className="flex justify-between items-start">
            <span className={`text-lg font-bold ${isToday ? "text-blue-500" : "text-foreground"}`}>{d}</span>
            {festival && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title={festival}></span>}
        </div>

        {/* Festival Text (Small) */}
        {festival && (
            <div className="bg-red-500/10 text-red-600 dark:text-red-300 text-[9px] md:text-[10px] px-1 rounded truncate font-medium">
                {festival}
            </div>
        )}

        {/* Tithi Name (Bottom) */}
        <div className="mt-auto">
            <div className={`text-[10px] md:text-xs font-medium truncate ${tithi.isShukla ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`}>
                {tithi.name}
            </div>
        </div>
        
        {/* Active Selection Glow */}
        {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Mystic Background */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-background to-background" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div className="space-y-2">
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200">
                    <Sun className="w-3 h-3 mr-1" /> Ultra Panchang
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold">
                    Vedic <span className="gradient-text">Calendar</span>
                </h1>
                <p className="text-muted-foreground">Plan your auspicious moments with precision.</p>
            </div>

            {/* Direct Date Picker */}
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border shadow-sm">
                <span className="text-sm font-medium text-muted-foreground pl-2 hidden sm:block">Jump to:</span>
                <Input 
                    type="date" 
                    value={jumpDate} 
                    onChange={handleJumpDate} 
                    className="w-40 bg-transparent border-none focus-visible:ring-0 text-foreground font-medium"
                />
            </div>
        </div>

        <div className="grid xl:grid-cols-[3fr_1.2fr] gap-8">
          
          {/* --- LEFT: ULTRA CALENDAR GRID --- */}
          <Card className="bg-card/80 backdrop-blur-xl border-orange-200/50 dark:border-orange-800/50 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Calendar Controls */}
            <div className="p-6 flex items-center justify-between bg-muted/20 border-b border-border">
               <Button variant="outline" onClick={prevMonth} className="hover:border-orange-500 hover:text-orange-500">
                  <ChevronLeft className="w-5 h-5" />
               </Button>
               
               <div className="text-center">
                  <h2 className="text-2xl font-bold flex items-center gap-2 justify-center">
                    {currentDate.toLocaleString('default', { month: 'long' })} 
                    <span className="text-orange-500">{currentDate.getFullYear()}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">
                     {HINDU_MONTHS[currentDate.getMonth()]} Maas
                  </p>
               </div>

               <Button variant="outline" onClick={nextMonth} className="hover:border-orange-500 hover:text-orange-500">
                  <ChevronRight className="w-5 h-5" />
               </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center py-4 bg-orange-50/50 dark:bg-orange-900/5 border-b border-border/50 text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">
               <div className="text-red-500">Sun</div>
               <div>Mon</div>
               <div>Tue</div>
               <div>Wed</div>
               <div>Thu</div>
               <div>Fri</div>
               <div>Sat</div>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 p-2 md:p-4 bg-background/30 flex-grow">
               {calendarDays}
            </div>
          </Card>

          {/* --- RIGHT: DETAILED PANCHANG PANEL --- */}
          <div className="space-y-6">
             <AnimatePresence mode="wait">
             <motion.div 
               key={selectedDate.toString()}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="h-full"
             >
                <Card className="h-full bg-gradient-to-br from-[#1a103d] to-[#2d1b5e] text-white border-none shadow-2xl relative overflow-hidden">
                   {/* Cosmic Noise Texture */}
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>

                   <CardContent className="p-6 md:p-8 flex flex-col h-full relative z-10">
                      
                      {/* Selected Date Header */}
                      <div className="text-center space-y-1 mb-6">
                         <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium tracking-wide mb-2">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                         </div>
                         <div className="text-5xl font-bold text-white">{selectedDate.getDate()}</div>
                         <div className="text-lg text-orange-200">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                      </div>

                      {/* Main Tithi Info */}
                      <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 mb-6 backdrop-blur-md">
                         <div className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-300 mb-1">
                            {selectedTithiInfo.isShukla ? <Sun className="w-6 h-6 animate-spin-slow" /> : <Moon className="w-6 h-6" />}
                            {selectedTithiInfo.name}
                         </div>
                         <div className="text-sm text-white/70">{selectedTithiInfo.paksha}</div>
                      </div>

                      {/* Vedic Timings Grid */}
                      <div className="space-y-4">
                         <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 border-b border-white/10 pb-2">Auspicious Timings</h3>
                         
                         <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 rounded-lg bg-black/20">
                                <div className="flex items-center gap-2 text-xs text-red-300 mb-1">
                                    <ShieldAlert className="w-3 h-3" /> Rahu Kaal
                                </div>
                                <div className="font-semibold text-sm">{vedicTimings.rahuKaal}</div>
                             </div>
                             <div className="p-3 rounded-lg bg-black/20">
                                <div className="flex items-center gap-2 text-xs text-yellow-300 mb-1">
                                    <Clock className="w-3 h-3" /> Yamaganda
                                </div>
                                <div className="font-semibold text-sm">{vedicTimings.yamaganda}</div>
                             </div>
                         </div>

                         <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-300" />
                                <span className="text-sm font-medium">Nakshatra</span>
                            </div>
                            <span className="font-bold text-orange-200">{vedicTimings.nakshatra}</span>
                         </div>
                      </div>

                      {/* Festival Banner (If any) */}
                      {FESTIVALS[`${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`] && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-lg animate-pulse text-center">
                           <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
                              <Flame className="w-5 h-5" />
                              {FESTIVALS[`${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`]}
                           </div>
                        </div>
                      )}

                   </CardContent>
                </Card>
             </motion.div>
             </AnimatePresence>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Panchang;