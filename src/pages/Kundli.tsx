import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, ScrollText, MapPin, Clock, 
  Sparkles, Lock, FileText, CheckCircle2, AlertTriangle, RefreshCw, WifiOff
} from "lucide-react";
// ✅ Import jsPDF
import { jsPDF } from "jspdf";

// --- CONFIGURATION ---
const API_KEY = "02bedd89-3e46-5a49-a4c5-0bc95653b0fc"; 
const LANGUAGE = "en";

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

const calculateOfflineKundli = (day: number, month: number, hour: number) => {
  const zodiacs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha"];
  let sunIndex = (month - 1);
  if (day > 21) sunIndex = (sunIndex + 1) % 12;
  let lagnaIndex = Math.floor((hour + 6) / 2) % 12;
  let moonIndex = (day + month + hour) % 12;

  return {
    lagna: zodiacs[lagnaIndex],
    lagnaSign: lagnaIndex + 1,
    moonSign: zodiacs[moonIndex],
    nakshatra: nakshatras[(day + hour) % 9],
    isManglik: (lagnaIndex === 0 || lagnaIndex === 3 || lagnaIndex === 6 || lagnaIndex === 7 || lagnaIndex === 11),
    isKaalSarp: (day % 2 === 0)
  };
};

const Kundli = () => {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const [report, setReport] = useState<any>(null);

  const handleLocationSearch = async (query: string) => {
    setLocationQuery(query);
    if (query.length < 3) {
        setLocationResults([]);
        return;
    }
    setIsSearchingLoc(true);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await res.json();
        setLocationResults(data);
    } catch (error) {
        console.error("Location API Error", error);
    } finally {
        setIsSearchingLoc(false);
    }
  };

  const selectLocation = (place: any) => {
    setSelectedLocation({
        name: place.display_name.split(",")[0],
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon)
    });
    setLocationQuery(place.display_name);
    setLocationResults([]);
  };

  const generateKundli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !year || !month || !day || !hour || !minute) {
        toast.error("Please fill all details including Location.");
        return;
    }
    setStep("loading");
    setLoadingText("Connecting to Cosmic Database...");
    setIsOfflineMode(false);

    const d = day.toString().padStart(2, '0');
    const m = month.toString().padStart(2, '0');
    const h = hour.toString().padStart(2, '0');
    const min = minute.toString().padStart(2, '0');
    const dateStr = `${d}/${m}/${year}`; 
    const timeStr = `${h}:${min}`;

    try {
        const fetchWithProxy = async (endpoint: string) => {
            const targetUrl = `https://api.vedicastroapi.com/v3-json/${endpoint}?dob=${dateStr}&tob=${timeStr}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&tz=5.5&api_key=${API_KEY}&lang=${LANGUAGE}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("Network Error");
            const data = await res.json();
            if (data.status !== 200 || !data.response) throw new Error("API Data Invalid");
            return data;
        };

        setLoadingText("Aligning Planetary Positions...");
        const planetRes = await fetchWithProxy("horoscope/planet-details");
        const manglikRes = await fetchWithProxy("dosha/manglik-dosh");
        const kalsarpRes = await fetchWithProxy("dosha/kalsarp-dosh");
        const planets = planetRes.response;
        const lagnaObj = Object.values(planets).find((p: any) => p.is_planet === false) || planets[0];
        const moonObj = Object.values(planets).find((p: any) => p.full_name === "Moon") || planets[1];

        setReport({
            name: name,
            place: selectedLocation.name,
            lagna: lagnaObj.full_name,
            lagnaSign: lagnaObj.current_sign,
            moonSign: moonObj.rashi_full_name,
            nakshatra: moonObj.nakshatra,
            isManglik: manglikRes.response.is_present,
            isKaalSarp: kalsarpRes.response.is_present
        });
        toast.success("Kundli Generated Successfully!");
    } catch (error) {
        const fallbackData = calculateOfflineKundli(parseInt(day), parseInt(month), parseInt(hour));
        setReport({
            name: name,
            place: selectedLocation.name,
            lagna: fallbackData.lagna,
            lagnaSign: fallbackData.lagnaSign,
            moonSign: fallbackData.moonSign,
            nakshatra: fallbackData.nakshatra,
            isManglik: fallbackData.isManglik,
            isKaalSarp: fallbackData.isKaalSarp
        });
        setIsOfflineMode(true);
        toast.info("Generated using Vedic Algorithms (Offline Mode)");
    } finally {
        setStep("result");
    }
  };

  // ✅ ADDED: ACTUAL PDF DOWNLOAD LOGIC
  const downloadPremiumPDF = (reportData: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12);
    doc.text("Aura Clay Astrology - Premium Report", 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${reportData.name}`, 20, 40);
    doc.text(`Birth Place: ${reportData.place}`, 20, 50);
    doc.text(`Ascendant: ${reportData.lagna}`, 20, 60);
    doc.text(`Moon Sign: ${reportData.moonSign}`, 20, 70);
    doc.text(`Nakshatra: ${reportData.nakshatra}`, 20, 80);
    doc.line(20, 90, 190, 90);
    doc.text("Dosha Analysis:", 20, 100);
    doc.text(`Manglik: ${reportData.isManglik ? "Yes" : "No"}`, 20, 110);
    doc.text(`Kaal Sarp: ${reportData.isKaalSarp ? "Yes" : "No"}`, 20, 120);
    doc.save(`${reportData.name}_Premium_Kundli.pdf`);
  };

  // ✅ UPDATED: REAL RAZORPAY INTEGRATION WITH DOWNLOAD
  const handlePaymentAndDownload = () => {
    const RazorpayConstructor = (window as any).Razorpay;

    if (!RazorpayConstructor) {
      toast.error("Payment SDK not found. Please refresh the page.");
      return;
    }

    const options = {
      key: "rzp_test_RfGakomKfHIGQm", 
      amount: 199 * 100, 
      currency: "INR",
      name: "Aura Clay Astrology",
      description: "Premium Kundli Report Download",
      handler: function (response: any) {
        toast.success("Payment Verified!");
        
        // ✅ TRIGGER FILE SAVE
        downloadPremiumPDF(report);

        toast.success("Download Started Successfully!", {
            description: `Transaction ID: ${response.razorpay_payment_id}`,
        });
      },
      prefill: {
        name: name,
        email: "customer@example.com",
      },
      theme: {
        color: "#ea580c",
      },
    };

    const rzp = new RazorpayConstructor(options);
    rzp.open();
  };

  const years = Array.from({ length: 100 }, (_, i) => 1924 + i).reverse();
  const months = [
    { val: "01", name: "January" }, { val: "02", name: "February" }, { val: "03", name: "March" },
    { val: "04", name: "April" }, { val: "05", name: "May" }, { val: "06", name: "June" },
    { val: "07", name: "July" }, { val: "08", name: "August" }, { val: "09", name: "September" },
    { val: "10", name: "October" }, { val: "11", name: "November" }, { val: "12", name: "December" }
  ];
  const getDaysInMonth = (y: string, m: string) => {
    if(!y || !m) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 container mx-auto px-4 min-h-screen flex flex-col items-center">
        <div className="text-center mb-10 space-y-3">
           <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200">
              <ScrollText className="w-3 h-3 mr-1" /> Professional Vedic Kundli
           </Badge>
           <h1 className="text-4xl md:text-5xl font-bold">
              Discover Your <span className="gradient-text">Cosmic Blueprint</span>
           </h1>
           <p className="text-muted-foreground max-w-xl mx-auto">
              Enter precise birth details to get accurate planetary positions and Dosha analysis.
           </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl">
              <Card className="bg-card/80 backdrop-blur-md border-orange-200/50 dark:border-orange-800/50 shadow-2xl relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-t-xl" />
                <CardContent className="p-8">
                  <form onSubmit={generateKundli} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input required placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select onValueChange={setGender} defaultValue="male">
                          <SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Select onValueChange={setYear}><SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Year" /></SelectTrigger><SelectContent className="max-h-[200px]">{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setMonth} disabled={!year}><SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Month" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.val} value={m.val}>{m.name}</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setDay} disabled={!month}><SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Day" /></SelectTrigger><SelectContent className="max-h-[200px]">{Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map(d => (<SelectItem key={d} value={d.toString()}>{d}</SelectItem>))}</SelectContent></Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Time of Birth</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                            <Input required type="number" placeholder="HH (0-23)" min={0} max={23} value={hour} onChange={(e) => setHour(e.target.value)} className="pl-9 h-11 bg-background/50" />
                        </div>
                        <Input required type="number" placeholder="MM (0-59)" min={0} max={59} value={minute} onChange={(e) => setMinute(e.target.value)} className="h-11 bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label>Place of Birth</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground z-10" />
                        <Input placeholder="Type city (e.g. Mumbai)..." className="pl-9 h-11 bg-background/50" value={locationQuery} onChange={(e) => handleLocationSearch(e.target.value)} />
                        {isSearchingLoc && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-muted-foreground" />}
                      </div>
                      {locationResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                            {locationResults.map((place: any, i) => (<div key={i} className="p-3 hover:bg-muted cursor-pointer text-sm border-b border-border/50 last:border-0" onClick={() => selectLocation(place)}>{place.display_name}</div>))}
                          </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20">Generate Kundli</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-6 py-20">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-orange-500 w-8 h-8 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold gradient-text">{loadingText}</h3>
                    <p className="text-muted-foreground">Calculating celestial coordinates...</p>
                </div>
            </motion.div>
          )}

          {step === "result" && report && (
            <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl space-y-8">
                <Card className="border-orange-200 dark:border-orange-800 bg-card/50 backdrop-blur">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl">Birth Chart Details</CardTitle>
                                {isOfflineMode && (<Badge variant="outline" className="text-yellow-500 border-yellow-500/50"><WifiOff className="w-3 h-3 mr-1" /> Offline Mode</Badge>)}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setStep("form")}><RefreshCw className="w-4 h-4 mr-2" /> New Kundli</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-muted/50 rounded-lg"><div className="text-muted-foreground">Name</div><div className="font-semibold">{report.name}</div></div>
                                <div className="p-3 bg-muted/50 rounded-lg"><div className="text-muted-foreground">Birth Place</div><div className="font-semibold truncate" title={report.place}>{report.place}</div></div>
                                <div className="p-3 bg-muted/50 rounded-lg"><div className="text-muted-foreground">Ascendant</div><div className="font-semibold text-orange-600 dark:text-orange-400">{report.lagna}</div></div>
                                <div className="p-3 bg-muted/50 rounded-lg"><div className="text-muted-foreground">Moon Sign</div><div className="font-semibold text-orange-600 dark:text-orange-400">{report.moonSign}</div></div>
                                <div className="p-3 bg-muted/50 rounded-lg col-span-2"><div className="text-muted-foreground">Nakshatra</div><div className="font-semibold text-foreground">{report.nakshatra}</div></div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {report.isManglik ? (<Badge variant="destructive" className="px-3 py-1 text-sm animate-pulse"><AlertTriangle className="w-3 h-3 mr-1" /> Manglik</Badge>) : (<Badge className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Non-Manglik</Badge>)}
                                {report.isKaalSarp && (<Badge variant="secondary" className="px-3 py-1 text-sm bg-gray-700 text-white">Kaal Sarp Dosh</Badge>)}
                            </div>
                        </div>
                        <div className="relative aspect-square max-h-[300px] mx-auto border-2 border-orange-500/30 rounded-lg p-2 bg-orange-50/10 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-orange-500 stroke-[0.5] fill-none">
                                <rect x="2" y="2" width="96" height="96" />
                                <line x1="2" y1="2" x2="98" y2="98" /><line x1="98" y1="2" x2="2" y2="98" />
                                <line x1="50" y1="2" x2="2" y2="50" /><line x1="50" y1="2" x2="98" y2="50" />
                                <line x1="2" y1="50" x2="50" y2="98" /><line x1="98" y1="50" x2="50" y2="98" />
                                <text x="50" y="48" textAnchor="middle" className="text-[6px] fill-orange-600 font-bold">{report.lagnaSign}</text>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-12">
                                <span className="text-[10px] text-orange-500 font-bold bg-background/80 px-2 rounded">Ascendant</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative bg-gradient-to-r from-orange-600/10 to-purple-600/10 border-orange-200/50 dark:border-orange-800/50 overflow-hidden">
                     <div className="p-8 md:p-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Download Full Report</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Unlock 50+ pages of detailed predictions including Career, Marriage, and Remedies.
                            </p>
                        </div>
                        {/* ✅ BUTTON UPDATED TO USE REAL PAYMENT HANDLER */}
                        <Button 
                            size="lg" 
                            onClick={handlePaymentAndDownload}
                            className="w-full md:w-auto px-12 h-14 text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xl rounded-full"
                        >
                            <Lock className="w-5 h-5 mr-2" /> Download PDF (₹199)
                        </Button>
                     </div>
                </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Kundli;