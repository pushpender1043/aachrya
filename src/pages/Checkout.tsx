import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, MapPin, Lock, CheckCircle2, ShoppingBag, CreditCard, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ✅ FIXED INTERFACE: Matches Cart.tsx structure
interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    image_url: string;
  };
}

// ✅ Load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    area: "",
    houseNo: "",
    city: "",
    state: "",
    country: "India"
  });

  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Fetch Cart Items
  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["cart-checkout"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data } = await supabase
        .from("cart_items")
        .select("*, products(*)") 
        .eq("user_id", session.user.id);
        
      return data as unknown as CartItem[];
    },
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0) || 0;
  const shipping = 0; 
  const total = subtotal + shipping;

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, pincode: code }));

    if (code.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const data = await response.json();

        if (data[0].Status === "Success") {
          const postOffices = data[0].PostOffice;
          const city = postOffices[0].District;
          const state = postOffices[0].State;
          const areas = postOffices.map((po: any) => po.Name);

          setFormData(prev => ({ ...prev, city, state, area: "" }));
          setAvailableAreas(areas);
          toast.success("Address found!");
        } else {
          toast.error("Invalid Pincode");
          setAvailableAreas([]);
        }
      } catch (error) {
        toast.error("Could not fetch location");
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // ✅ Core Function to Save Order in Database
  const saveOrderToDatabase = async (userId: string, orderStatus: string) => {
    const fullAddress = {
      fullName: formData.fullName,
      phone: formData.phone,
      houseNo: formData.houseNo,
      area: formData.area,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country,
      paymentMethod: paymentMethod // Track what user chose
    };

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: total,
        status: orderStatus, // 'pending' for COD, 'processing' for Online
        shipping_address: fullAddress,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items
    const orderItems = cartItems!.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price 
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // 3. Clear Cart
    await supabase.from("cart_items").delete().eq("user_id", userId);

    return order;
  };

  // ✅ Main Payment Handler
  const handleCheckoutProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pincode || !formData.area || !formData.houseNo || !formData.fullName) {
      toast.error("Please fill all shipping details");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to place order");
        setLoading(false);
        return;
      }

      // 🟡 IF CASH ON DELIVERY
      if (paymentMethod === "cod") {
        await saveOrderToDatabase(session.user.id, "pending");
        toast.success("Order Placed Successfully via Cash on Delivery! 🎉");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/"); // Assuming you have a profile/orders page
        return;
      }

      // 🟢 IF ONLINE PAYMENT (Razorpay)
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_RfGakomKfHIGQm", // 🔴 IMPORTANT: Replace with your Razorpay Key
        amount: total * 100, // paise
        currency: "INR",
        name: "Aachrya Cosmic Guide",
        description: "Sacred Products Order",
        
        handler: async function (response: any) {
          try {
            await saveOrderToDatabase(session.user.id, "processing"); // Mark as processing for paid orders
            toast.success("Payment Successful! Order Placed ✨");
            window.dispatchEvent(new Event("cartUpdated"));
            navigate("/"); 
          } catch (error: any) {
            toast.error("Payment succeeded but order saving failed. Contact Support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: session.user.email,
          contact: formData.phone,
        },
        theme: {
          color: "#ea580c",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Order Error:", error);
      toast.error("Order Failed: " + (error.message || "Something went wrong"));
      setLoading(false);
    }
  };

  if (cartLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
       <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
      <Navbar />
      
      <div className="bg-background border-b border-border pt-24 pb-6 px-4 mb-8">
         <div className="container mx-auto max-w-6xl flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Checkout</h1>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
               <Lock className="w-3 h-3" /> Secure Checkout
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 rounded-2xl shadow-sm border-border">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                   <MapPin className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-xl font-bold">Delivery Address</h2>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input placeholder="Rahul Sharma" className="bg-secondary/20 h-11"
                        value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="9876543210" className="bg-secondary/20 h-11"
                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-2">
                    <Label>Pincode (Auto-detects City/State)</Label>
                    <div className="relative">
                      <Input placeholder="Enter 6-digit Pincode" maxLength={6} className="bg-secondary/20 h-11"
                        value={formData.pincode} onChange={handlePincodeChange} />
                      {pincodeLoading && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-orange-500" />}
                      {formData.city && !pincodeLoading && <CheckCircle2 className="absolute right-3 top-3.5 w-4 h-4 text-green-500" />}
                    </div>
                </div>

                {formData.city && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                        <div><span className="text-xs text-muted-foreground">City</span><div className="font-medium">{formData.city}</div></div>
                        <div><span className="text-xs text-muted-foreground">State</span><div className="font-medium">{formData.state}</div></div>
                        <div><span className="text-xs text-muted-foreground">Country</span><div className="font-medium">{formData.country}</div></div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Area / Locality</Label>
                        <Select disabled={availableAreas.length === 0} value={formData.area} onValueChange={(val) => setFormData({...formData, area: val})}>
                            <SelectTrigger className="h-11 bg-secondary/20">
                                <SelectValue placeholder="Select Area" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAreas.map((area) => (<SelectItem key={area} value={area}>{area}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>House No / Building</Label>
                        <Input placeholder="Flat No, Building Name" className="h-11 bg-secondary/20"
                           value={formData.houseNo} onChange={(e) => setFormData({...formData, houseNo: e.target.value})} />
                    </div>
                </div>
              </form>
            </Card>
          </div>

          {/* RIGHT: Order Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6 rounded-2xl shadow-lg border-orange-200 bg-card">
                 <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-600" /> Order Summary
                 </h2>
                 
                 <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems?.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                         <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border flex-shrink-0">
                            <img src={item.products?.image_url} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                            <p className="font-medium line-clamp-2">{item.products?.name}</p>
                            <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                         </div>
                         <div className="font-semibold">₹{((item.products?.price || 0) * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-3 pt-4 border-t border-dashed border-border">
                    <div className="flex justify-between font-bold text-lg">
                       <span>Total</span>
                       <span className="text-orange-600">₹{total.toLocaleString()}</span>
                    </div>
                 </div>

                 {/* ✅ PAYMENT METHOD SELECTION */}
                 <div className="pt-6 mt-4 border-t border-border">
                    <Label className="text-sm font-bold mb-3 block">Select Payment Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                          onClick={() => setPaymentMethod("online")}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                            paymentMethod === "online" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border hover:bg-muted"
                          )}
                        >
                            <CreditCard className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Pay Online</span>
                        </div>
                        <div 
                          onClick={() => setPaymentMethod("cod")}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all",
                            paymentMethod === "cod" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border hover:bg-muted"
                          )}
                        >
                            <Banknote className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Cash on Delivery</span>
                        </div>
                    </div>
                 </div>

                 <Button 
                    onClick={handleCheckoutProcess} 
                    className="w-full h-12 mt-6 text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl"
                    disabled={loading}
                 >
                    {loading ? <Loader2 className="animate-spin" /> : 
                      paymentMethod === "online" ? `Pay ₹${total.toLocaleString()} & Order` : "Place Order (COD)"
                    }
                 </Button>
              </Card>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;