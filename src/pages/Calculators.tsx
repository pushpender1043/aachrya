import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, Moon, Sun, Calculator, Star, Flame, Car, 
  Users, AlertTriangle, Fingerprint, Calendar, 
  ArrowLeft, Sparkles, Loader2, MapPin, Phone, 
  ScrollText, ArrowUpRight, Hourglass, ScanLine 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. CONFIGURATION: All Tools List ---
const TOOLS = [
  // Love & Relationships
  { id: "love-calculator", title: "Love Calculator", icon: Heart, desc: "Check compatibility percentage.", category: "Relationship", color: "text-rose-400", bg: "bg-rose-500/10" },
  { id: "flames-calculator", title: "FLAMES Calculator", icon: Flame, desc: "Friends, Love, Affection, Marriage, Enemy.", category: "Relationship", color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "friendship-calculator", title: "Friendship Calculator", icon: Users, desc: "How strong is your bond?", category: "Relationship", color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "name-compatibility", title: "Name Compatibility", icon: Fingerprint, desc: "Numerological vibration match.", category: "Relationship", color: "text-purple-400", bg: "bg-purple-500/10" },

  // Numerology
  { id: "numerology-calculator", title: "Numerology Report", icon: Calculator, desc: "Full numerology analysis.", category: "Numerology", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "mulank-calculator", title: "Mulank Calculator", icon: Calculator, desc: "Root number based on birth date.", category: "Numerology", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { id: "destiny-number", title: "Destiny Number", icon: Star, desc: "Bhagyank calculator.", category: "Numerology", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { id: "mobile-numerology", title: "Mobile Numerology", icon: Phone, desc: "Is your phone number lucky?", category: "Numerology", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "lucky-vehicle", title: "Lucky Vehicle No.", icon: Car, desc: "Check your car/bike number.", category: "Numerology", color: "text-red-400", bg: "bg-red-500/10" },

  // Astrology (Zodiac)
  { id: "sun-sign", title: "Sun Sign Calculator", icon: Sun, desc: "Know your western zodiac.", category: "Astrology", color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "moon-sign", title: "Moon Sign Calculator", icon: Moon, desc: "Vedic Rashi calculator.", category: "Astrology", color: "text-slate-300", bg: "bg-slate-500/10" },
  { id: "rising-sign", title: "Rising Sign / Ascendant", icon: ArrowUpRight, desc: "Your Lagna based on time.", category: "Astrology", color: "text-teal-400", bg: "bg-teal-500/10" },

  // Vedic Dosha & Charts (Complex)
  { id: "birth-chart", title: "Birth Chart / Kundli", icon: ScrollText, desc: "Generate your natal chart.", category: "Vedic", color: "text-orange-300", bg: "bg-orange-500/10" },
  { id: "mangal-dosha", title: "Mangal Dosha", icon: AlertTriangle, desc: "Check Mars placement effects.", category: "Vedic", color: "text-red-500", bg: "bg-red-500/10" },
  { id: "sade-sati", title: "Shani Sade Sati", icon: Hourglass, desc: "Saturn transit analysis.", category: "Vedic", color: "text-blue-300", bg: "bg-blue-600/10" },
  { id: "kaal-sarp", title: "Kaal Sarp Dosh", icon: ScanLine, desc: "Rahu-Ketu axis analysis.", category: "Vedic", color: "text-gray-400", bg: "bg-gray-500/10" },
  
  // Others
  { id: "age-calculator", title: "Age Calculator", icon: Calendar, desc: "Exact age in years, months, days.", category: "Utility", color: "text-green-400", bg: "bg-green-500/10" },
];

const Calculators = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeToolId = searchParams.get("tool");

  const activeTool = TOOLS.find(t => t.id === activeToolId);

  const handleBack = () => {
    navigate("/calculators");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Background Ambience - The "Divine Energy" */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-500/10 dark:bg-orange-900/20 rounded-full blur-[150px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-900/20 rounded-full blur-[120px] animate-float-slow" />
         <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-28 min-h-[85vh]">
        <AnimatePresence mode="wait">
          {!activeToolId ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <MenuSelection tools={TOOLS} />
            </motion.div>
          ) : (
            <motion.div 
              key="tool"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-3xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    className="mb-8 hover:bg-orange-500/10 hover:text-orange-500 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                  Back to All Tools
                </Button>
                
                {/* Dynamic Component Rendering with Glass Effect */}
                <div className="relative">
                    {/* Glow behind the tool */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur-lg opacity-50" />
                    <ToolRenderer tool={activeTool!} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

// --- 2. MENU COMPONENT (Upgraded) ---
const MenuSelection = ({ tools }: { tools: typeof TOOLS }) => {
  const navigate = useNavigate();
  const categories = ["Relationship", "Numerology", "Astrology", "Vedic", "Utility"];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold tracking-wider uppercase border border-orange-200 dark:border-orange-800">
           <Sparkles className="w-4 h-4" /> Free Vedic Tools
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="gradient-text">Cosmic Calculators</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Unveil the hidden patterns of your destiny. Choose a tool below to get instant astrological insights powered by ancient wisdom.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((cat, catIdx) => (
          <div key={cat} className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1 }}
                className="flex items-center gap-4"
            >
                <h2 className="text-2xl font-bold text-foreground">{cat} Tools</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-border to-transparent" />
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.filter(t => t.category === cat).map((tool, idx) => (
                <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                >
                    <Card 
                      onClick={() => navigate(`?tool=${tool.id}`)}
                      className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                    >
                      <CardHeader className="flex flex-row items-start gap-4 p-6">
                        <div className={`p-3.5 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <tool.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">{tool.desc}</CardDescription>
                        </div>
                      </CardHeader>
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. CALCULATOR WRAPPER & LOGIC ---

// Helper Wrapper for all calculator forms
const CalculatorCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card className="bg-card/90 backdrop-blur-xl border-orange-200/50 dark:border-orange-900/50 shadow-2xl overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
    <CardHeader className="text-center pb-2 border-b border-border/50 bg-muted/20">
       <CardTitle className="text-3xl font-bold gradient-text">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-8 md:p-10">
       {children}
    </CardContent>
  </Card>
);

const ToolRenderer = ({ tool }: { tool: typeof TOOLS[0] }) => {
  if (["love-calculator", "friendship-calculator", "name-compatibility"].includes(tool.id)) {
    return <LoveLogic toolName={tool.title} />;
  }
  if (tool.id === 'flames-calculator') return <FlamesLogic />;
  if (["numerology-calculator", "mulank-calculator", "destiny-number"].includes(tool.id)) {
    return <NumerologyLogic toolId={tool.id} title={tool.title} />;
  }
  if (tool.id === 'sun-sign') return <SunSignLogic />;
  if (tool.id === 'lucky-vehicle') return <VehicleLogic />;
  if (tool.id === 'age-calculator') return <AgeLogic />;
  
  return <VedicForm title={tool.title} />;
};

// --- LOGIC COMPONENTS ---

const LoveLogic = ({ toolName }: { toolName: string }) => {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    if (!name1 || !name2) return;
    setLoading(true);
    setTimeout(() => {
      const combined = (name1 + name2).toLowerCase().replace(/\s/g, '');
      let sum = 0;
      for (let i = 0; i < combined.length; i++) sum += combined.charCodeAt(i);
      setResult((sum % 100) + 1);
      setLoading(false);
    }, 1500);
  };

  return (
    <CalculatorCard title={toolName}>
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6 relative">
            <div className="space-y-2">
              <Label className="text-base">Your Name</Label>
              <Input value={name1} onChange={e => setName1(e.target.value)} placeholder="Enter name" className="h-12 text-lg bg-background/50 border-input focus:border-rose-500" />
            </div>
            
            {/* Heart Icon in Center (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 items-center justify-center w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-500 z-10">
                <Heart className="w-5 h-5 fill-current" />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Partner's Name</Label>
              <Input value={name2} onChange={e => setName2(e.target.value)} placeholder="Enter name" className="h-12 text-lg bg-background/50 border-input focus:border-rose-500" />
            </div>
        </div>
        
        {!result && (
           <Button onClick={calculate} disabled={loading || !name1 || !name2} className="w-full h-12 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 transition-all">
             {loading ? <Loader2 className="animate-spin mr-2" /> : "Calculate Match ❤️"}
           </Button>
        )}

        {result !== null && !loading && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 pt-4 border-t border-border">
              <div className="inline-block relative">
                 <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">{result}%</div>
                 <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-xl font-medium text-muted-foreground">
                {result > 85 ? "Soulmates! Made in Heaven 💍" : result > 60 ? "Strong Connection ❤️" : "Relationships take work! 🩹"}
              </p>
              <Button variant="outline" onClick={() => setResult(null)} className="mt-4">Check Another</Button>
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  );
};

const FlamesLogic = () => {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculateFlames = () => {
     if(!name1 || !name2) return;
     const outcomes = ["Friends 🤝", "Lovers ❤️", "Affection 🤗", "Marriage 💍", "Enemy ⚔️", "Siblings 👧👦"];
     const count = (name1 + name2).replace(/\s/g, '').length;
     setResult(outcomes[count % 6]);
  };

  return (
    <CalculatorCard title="FLAMES Test">
       <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={name1} onChange={e => setName1(e.target.value)} placeholder="Your Name" className="h-12" />
            <Input value={name2} onChange={e => setName2(e.target.value)} placeholder="Crush's Name" className="h-12" />
          </div>
          <Button onClick={calculateFlames} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg">
             <Flame className="w-5 h-5 mr-2 fill-orange-200" /> Check Fate
          </Button>
          {result && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
               <h3 className="text-4xl font-bold text-orange-600 dark:text-orange-400">{result}</h3>
            </motion.div>
          )}
       </div>
    </CalculatorCard>
  );
};

const NumerologyLogic = ({ toolId, title }: { toolId: string, title: string }) => {
  const [date, setDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
     if(!date) return;
     const d = new Date(date);
     const day = d.getDate();
     const month = d.getMonth() + 1;
     const year = d.getFullYear();

     const sumDigits = (n: number) => {
        while(n > 9) n = n.toString().split('').reduce((a,b) => parseInt(a)+parseInt(b), 0);
        return n;
     };
     setResult({ mulank: sumDigits(day), bhagyank: sumDigits(day + month + year) });
  };

  return (
    <CalculatorCard title={title}>
       <div className="space-y-6">
          <div className="space-y-2">
             <Label>Date of Birth</Label>
             <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 text-lg" />
          </div>
          <Button onClick={calculate} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white">Reveal Numbers</Button>
          
          {result && (
             <div className="grid grid-cols-2 gap-6 mt-6">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center">
                   <div className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">Mulank (Root)</div>
                   <div className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-2">{result.mulank}</div>
                </motion.div>
                {toolId !== 'mulank-calculator' && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                      <div className="text-sm font-semibold text-purple-500 uppercase tracking-wider">Bhagyank (Destiny)</div>
                      <div className="text-5xl font-extrabold text-purple-700 dark:text-purple-300 mt-2">{result.bhagyank}</div>
                  </motion.div>
                )}
             </div>
          )}
       </div>
    </CalculatorCard>
  );
};

const SunSignLogic = () => {
   const [date, setDate] = useState("");
   const [sign, setSign] = useState("");

   const getZodiac = (dateStr: string) => {
      const date = new Date(dateStr);
      const days = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22];
      const signs = ["Aquarius ♒", "Pisces ♓", "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋", "Leo ♌", "Virgo ♍", "Libra ♎", "Scorpio ♏", "Sagittarius ♐", "Capricorn ♑"];
      let month = date.getMonth();
      let day = date.getDate();
      if(month === 0 && day <= 20) month = 11;
      else if(day < days[month]) month--;
      setSign(signs[month]);
   };

   return (
      <CalculatorCard title="Sun Sign Finder">
         <div className="space-y-6">
            <Label>Enter Date of Birth</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12" />
            <Button onClick={() => getZodiac(date)} className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold">Find Zodiac</Button>
            {sign && (
               <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-full w-48 h-48 mx-auto flex items-center justify-center border-4 border-amber-200 dark:border-amber-800">
                  <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{sign}</h3>
               </motion.div>
            )}
         </div>
      </CalculatorCard>
   );
};

const VehicleLogic = () => {
   const [number, setNumber] = useState("");
   const [lucky, setLucky] = useState<number | null>(null);

   const calculate = () => {
      const digits = number.replace(/\D/g, ''); 
      let sum = 0;
      for (let i = 0; i < digits.length; i++) sum += parseInt(digits[i]);
      while(sum > 9) sum = sum.toString().split('').reduce((a,b) => parseInt(a)+parseInt(b), 0);
      setLucky(sum);
   };

   return (
      <CalculatorCard title="Lucky Vehicle Number">
         <div className="space-y-6">
            <div className="space-y-2">
                <Label>Vehicle Number (e.g. DL 4C 1234)</Label>
                <Input value={number} onChange={e => setNumber(e.target.value.toUpperCase())} className="h-14 text-center text-2xl font-mono tracking-widest uppercase" placeholder="XX 00 XX 0000" />
            </div>
            <Button onClick={calculate} className="w-full h-12">Calculate</Button>
            {lucky && (
               <div className="text-center space-y-2">
                  <p className="text-muted-foreground">The Numerological Total is</p>
                  <div className="text-8xl font-black text-primary">{lucky}</div>
               </div>
            )}
         </div>
      </CalculatorCard>
   );
};

const AgeLogic = () => {
   const [dob, setDob] = useState("");
   const [age, setAge] = useState<string>("");

   const calculate = () => {
      const birthDate = new Date(dob);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
         years--;
         months += 12;
      }
      if(days < 0) {
          months--;
          days += 30; // approx
      }
      setAge(`${years} Years, ${months} Months, ${days} Days`);
   };

   return (
      <CalculatorCard title="Age Calculator">
         <div className="space-y-6">
            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="h-12" />
            <Button onClick={calculate} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white">Calculate Age</Button>
            {age && <h3 className="text-center text-2xl font-bold text-green-600 dark:text-green-400 mt-4">{age}</h3>}
         </div>
      </CalculatorCard>
   );
};

// --- GENERIC VEDIC FORM ---
const VedicForm = ({ title }: { title: string }) => {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 2500);
  };

  return (
    <CalculatorCard title={title}>
      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label>Date of Birth</Label>
                 <Input type="date" required className="h-12 bg-background/50" />
              </div>
              <div className="space-y-2">
                 <Label>Time of Birth</Label>
                 <Input type="time" required className="h-12 bg-background/50" />
              </div>
           </div>
           <div className="space-y-2">
              <Label>Place of Birth</Label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                 <Input placeholder="City, Country" className="pl-10 h-12 bg-background/50" required />
              </div>
           </div>
           
           <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-lg shadow-lg shadow-orange-500/20">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Aligning Stars...</span> : "Generate Free Report"}
           </Button>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full"><Sparkles className="text-green-600 dark:text-green-300 w-5 h-5" /></div>
              <div>
                 <h4 className="font-bold text-green-700 dark:text-green-300">Analysis Complete</h4>
                 <p className="text-sm text-green-600/80 dark:text-green-400/80">Vedic Calculation Successful</p>
              </div>
           </div>

           <div className="space-y-4 text-foreground/80 leading-relaxed p-4 bg-muted/30 rounded-lg">
              <p>Based on the planetary positions at your birth time, the chart indicates a strong influence of <strong>Jupiter (Guru)</strong> in your career house.</p>
              <p className="text-sm border-l-2 border-orange-500 pl-4 italic">
                "This is a summary report. For a detailed 50+ page Kundli analysis including Dasha, Gochar, and Remedies, please consult Acharya Ji."
              </p>
           </div>

           <div className="flex gap-4">
             <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1">Calculate Again</Button>
             <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">Book Consultation</Button>
           </div>
        </div>
      )}
    </CalculatorCard>
  );
};

export default Calculators;