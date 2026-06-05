import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, Calendar, MapPin, Save, Package, 
  Clock, CheckCircle, Truck, Sparkles, Star, LogOut 
} from "lucide-react";
import { motion } from "framer-motion";

// --- HELPER: Spiritual Background Component ---
const SpiritualBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-background">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-orange-50/5 dark:to-purple-900/10" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-500/10 blur-[100px]"
    />
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[-5%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-purple-600/10 blur-[100px]"
    />
  </div>
);

// --- HELPER: Zodiac Calculator ---
const getZodiacSign = (day: number, month: number) => {
  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricorn (Makar)";
  if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Aquarius (Kumbh)";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces (Meen)";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries (Mesh)";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus (Vrishabh)";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini (Mithun)";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer (Kark)";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo (Simha)";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo (Kanya)";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra (Tula)";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio (Vrishchik)";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius (Dhanu)";
  return "Unknown";
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    full_name: "",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth: "",
    gender: "male",
    zodiac_sign: ""
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (profile) {
        setProfileData({
          full_name: profile.full_name || "",
          date_of_birth: profile.date_of_birth || "",
          time_of_birth: profile.time_of_birth || "",
          place_of_birth: profile.place_of_birth || "",
          gender: profile.gender || "male",
          zodiac_sign: profile.zodiac_sign || ""
        });
      }

      // 2. Fetch Orders (Karmic Ledger)
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
        
      setOrders(orderData || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  // --- HANDLERS ---
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate Zodiac
    let zodiac = profileData.zodiac_sign;
    if (profileData.date_of_birth) {
      const date = new Date(profileData.date_of_birth);
      zodiac = getZodiacSign(date.getDate(), date.getMonth() + 1);
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profileData,
          zodiac_sign: zodiac
        });

      if (error) throw error;
      
      setProfileData(prev => ({ ...prev, zodiac_sign: zodiac }));
      toast.success("Astral Identity Updated! ✨");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="animate-spin w-8 h-8 text-orange-500" /></div>;

  return (
    <div className="min-h-screen relative flex flex-col">
      <SpiritualBackground />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
              {profileData.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Namaste, {profileData.full_name || "Seeker"} 🙏</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                {profileData.zodiac_sign ? (
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Star className="w-4 h-4 fill-current" /> {profileData.zodiac_sign}
                  </span>
                ) : "Complete your profile to see your Zodiac"}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="border-red-200 hover:bg-red-50 text-red-600 gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        {/* --- TABS SECTION --- */}
        <Tabs defaultValue="orders" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 mb-8 rounded-xl">
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              📜 Karmic Ledger (Orders)
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              🌌 Astral Identity (Profile)
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
              🕉️ Divine Meetings
            </TabsTrigger>
          </TabsList>

          {/* 1. ORDERS TAB */}
          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <Card className="text-center py-16 bg-white/50 backdrop-blur border-dashed">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold">No Karmic Exchange Yet</h3>
                <p className="text-muted-foreground mb-6">Start your spiritual journey with our sacred collection.</p>
                <Button onClick={() => navigate("/products")}>Explore Store</Button>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow bg-white/80 backdrop-blur">
                  <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          #{order.id.slice(0, 8)}
                        </span>
                        <Badge className={`
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                            'bg-amber-100 text-amber-700'} border-none
                        `}>
                          {order.status === 'pending' ? '⏳ Ritual in Progress' : 
                           order.status === 'shipped' ? '🚚 Dispatched with Blessings' : 
                           order.status === 'delivered' ? '✅ Energy Received' : order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ordered on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Energy Exchange</p>
                      <p className="text-xl font-bold text-orange-600">₹{order.total_amount}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* 2. PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Your Birth Details</CardTitle>
                <CardDescription>
                  Save your details for accurate Kundli and future predictions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter full name" className="pl-9" 
                        value={profileData.full_name} 
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Place of Birth</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="City, Country" className="pl-9"
                        value={profileData.place_of_birth} 
                        onChange={(e) => setProfileData({...profileData, place_of_birth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date" className="pl-9"
                        value={profileData.date_of_birth} 
                        onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Time of Birth</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="time" className="pl-9"
                        value={profileData.time_of_birth} 
                        onChange={(e) => setProfileData({...profileData, time_of_birth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                      <Save className="w-4 h-4 mr-2" /> Save Astral Identity
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. APPOINTMENTS TAB */}
          <TabsContent value="appointments">
            <Card className="text-center py-20 bg-gradient-to-br from-orange-50 to-white border-dashed">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-orange-900">No Upcoming Consultations</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect with our expert Acharyas to find clarity and guidance for your life path.
              </p>
              <Button onClick={() => navigate("/astrologers")} className="bg-orange-600">
                Book a Session
              </Button>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;