import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Package, Truck, CheckCircle, Clock, ShoppingBag, 
  MapPin, Banknote, CreditCard, Pencil, X, Save 
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderItem {
  quantity: number;
  price: number;
  products: { name: string; image_url: string; };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  order_items?: OrderItem[];
}

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "", houseNo: "", area: "", city: "", state: "", pincode: "", phone: "", paymentMethod: ""
  });

  const parseAddress = (addressData: any) => {
    if (!addressData) return null;
    if (typeof addressData === 'object') return addressData;
    try {
      const parsed = JSON.parse(addressData);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch (e) { return null; }
  };

  // ✅ डेटा फेच करने का फंक्शन
  const fetchMyOrders = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (quantity, price, products ( name, image_url ))`)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as Order[] || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyOrders();

    // ✅ असली फिक्स: किसी भी अपडेट पर सीधे डेटाबेस से ताज़ा डेटा लाएं
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('Admin updated something:', payload);
          // 🚀 जैसे ही एडमिन कुछ बदलेगा, यह फंक्शन तुरंत नया डेटा लाएगा
          fetchMyOrders(); 
          toast.info("Order status updated!", {
            description: "Your order details have been refreshed."
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMyOrders]);

  const handleEditClick = (order: Order) => {
    const addr = parseAddress(order.shipping_address);
    setEditingOrder(order);
    setNewAddress({
      fullName: addr?.fullName || "",
      houseNo: addr?.houseNo || "",
      area: addr?.area || "",
      city: addr?.city || "",
      state: addr?.state || "",
      pincode: addr?.pincode || "",
      phone: addr?.phone || "",
      paymentMethod: addr?.paymentMethod || ""
    });
    setIsEditing(true);
  };

  const handleUpdateAddress = async () => {
    if (!editingOrder) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ shipping_address: newAddress })
        .eq("id", editingOrder.id);

      if (error) throw error;
      toast.success("Address updated!");
      setIsEditing(false);
      fetchMyOrders();
    } catch (error) {
      toast.error("Failed to update address");
    }
  };

  const getStatusUI = (status: string) => {
    const s = status?.toLowerCase() || "pending";
    switch (s) {
      case "pending": return { icon: Clock, color: "text-yellow-600 bg-yellow-100 border-yellow-200", text: "Pending" };
      case "processing": return { icon: Package, color: "text-blue-600 bg-blue-100 border-blue-200", text: "Processing" };
      case "shipped": return { icon: Truck, color: "text-purple-600 bg-purple-100 border-purple-200", text: "Shipped" };
      case "delivered": return { icon: CheckCircle, color: "text-green-600 bg-green-100 border-green-200", text: "Delivered" };
      case "cancelled": return { icon: X, color: "text-red-600 bg-red-100 border-red-200", text: "Cancelled" };
      default: return { icon: Clock, color: "text-gray-600 bg-gray-100", text: status };
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col pb-20">
      <Navbar />
      <div className="bg-background border-b pt-24 pb-6 px-4 mb-8 shadow-sm">
         <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-orange-600" /> My Orders
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Status updates appear here in real-time.</p>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl flex-1">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border">
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const address = parseAddress(order.shipping_address);
              const isCod = address?.paymentMethod === 'cod';
              const StatusData = getStatusUI(order.status);
              const StatusIcon = StatusData.icon;
              const canEdit = order.status === 'pending' || order.status === 'processing';

              return (
                <Card key={order.id} className="overflow-hidden shadow-md bg-card rounded-2xl border-border">
                  <div className="bg-muted/30 border-b p-4 sm:p-6 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono bg-secondary px-2 py-1 rounded w-fit">#{order.id.split('-')[0]}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{format(new Date(order.created_at), "PPP")}</span>
                    </div>
                    {/* ✅ एडमिन जो स्टेटस अपडेट करेगा वो यहाँ दिखेगा */}
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-sm ${StatusData.color} transition-all duration-300`}>
                      <StatusIcon className="w-4 h-4" /> {StatusData.text}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-background p-3 rounded-xl border border-border/50">
                          <img src={item.products?.image_url} className="w-14 h-14 rounded-lg object-cover border" alt={item.products?.name} />
                          <div className="flex-1">
                            <h5 className="font-bold text-sm line-clamp-1">{item.products?.name}</h5>
                            <p className="text-muted-foreground text-xs font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                          <div className="font-black text-sm text-primary">₹{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 md:border-l md:pl-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-muted-foreground">Shipping Address</h4>
                        {canEdit && <Pencil className="w-3.5 h-3.5 text-orange-600 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleEditClick(order)} />}
                      </div>
                      <div className="text-sm p-4 bg-muted/20 rounded-xl border border-dashed border-border">
                        {address ? (
                          <div className="space-y-1">
                            <p className="font-bold text-foreground">{address.fullName}</p>
                            <p className="text-muted-foreground text-xs">{address.houseNo}, {address.area}</p>
                            <p className="text-muted-foreground text-xs">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-xs font-medium text-primary mt-2">📞 {address.phone}</p>
                          </div>
                        ) : <p className="text-red-500 text-xs italic">Parsing Address...</p>}
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Payment</span>
                         <Badge variant="outline" className={`text-[10px] ${isCod ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                           {isCod ? "COD" : "PAID ONLINE"}
                         </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 flex justify-between items-center border-t border-primary/10">
                     <span className="text-sm font-bold text-muted-foreground">Amount Paid</span>
                     <span className="text-xl font-black text-primary">₹{order.total_amount.toLocaleString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Update Delivery Address</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>House No</Label>
                <Input value={newAddress.houseNo} onChange={(e) => setNewAddress({...newAddress, houseNo: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Pincode</Label>
                <Input value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Area / Locality</Label>
              <Input value={newAddress.area} onChange={(e) => setNewAddress({...newAddress, area: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateAddress} className="bg-orange-600 text-white w-full h-12 font-bold shadow-lg">Update Order Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default MyOrders;