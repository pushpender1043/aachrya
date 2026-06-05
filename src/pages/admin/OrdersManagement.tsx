import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, Package, Truck, CheckCircle, Clock, Search, IndianRupee,
  MapPin, Phone, Eye, Filter, MoreHorizontal, ShoppingBag, CreditCard, Banknote, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  user_id: string;
  order_items?: OrderItem[]; 
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const parseAddress = (addressData: any) => {
    if (!addressData) return null;
    if (typeof addressData === 'object') return addressData;
    try {
      const parsed = JSON.parse(addressData);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch (e) {
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (quantity, price, products (name, image_url))`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as Order[] || []);
    } catch (error: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ FIXED: Update Status with instant UI feedback for Table AND Modal
const updateStatus = async (id: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;

    // ✅ डेटाबेस अपडेट सफल होने के बाद ताज़ा डेटा लाएँ
    await fetchOrders(); 
    toast.success(`Order status saved as ${newStatus}`);
    
  } catch (error: any) {
    console.error("Update failed:", error.message);
    toast.error("Failed to save status in database.");
  }
};

  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (Number(o.total_amount) || 0) : sum, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  const filteredOrders = orders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const addr = parseAddress(o.shipping_address);
    const nameMatch = addr?.fullName?.toLowerCase().includes(searchLower);
    const idMatch = o.id.toLowerCase().includes(searchLower);
    
    return (idMatch || nameMatch) && (statusFilter === "all" ? true : o.status === statusFilter);
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 w-full overflow-hidden">
          <SidebarTrigger className="md:hidden mb-4" />
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8 text-orange-600" /> Orders Management
              </h1>
              <Button variant="outline" onClick={fetchOrders}>Refresh</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-orange-50/50 border-orange-100">
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-orange-600">Total Revenue</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold flex items-center"><IndianRupee className="w-5 h-5 mr-1"/>{totalRevenue.toLocaleString()}</CardContent>
              </Card>
              <Card className="bg-yellow-50/50 border-yellow-100">
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-yellow-600">Pending Orders</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{pendingOrders}</CardContent>
              </Card>
              <Card className="bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-blue-600">Shipped</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{shippedOrders}</CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search Customer or Order ID..." className="pl-10" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-orange-500" /></TableCell></TableRow> : 
                  filteredOrders.map((order) => {
                    const addr = parseAddress(order.shipping_address);
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs">#{order.id.slice(0,8)}</TableCell>
                        <TableCell className="font-medium">{addr?.fullName || "User"}</TableCell>
                        <TableCell className="font-bold text-orange-600">₹{order.total_amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={()=>{setSelectedOrder(order); setIsDetailsOpen(true);}}><Eye className="w-4 h-4 text-blue-500"/></Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={()=>updateStatus(order.id, "processing")}>Mark Processing</DropdownMenuItem>
                                <DropdownMenuItem onClick={()=>updateStatus(order.id, "shipped")}>Mark Shipped</DropdownMenuItem>
                                <DropdownMenuItem onClick={()=>updateStatus(order.id, "delivered")}>Mark Delivered</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={()=>updateStatus(order.id, "cancelled")}>Cancel Order</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* View Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex justify-between items-center pr-6">
                    <DialogTitle className="text-xl">Order Details</DialogTitle>
                    <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                      {selectedOrder?.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">ID: {selectedOrder?.id}</p>
                </DialogHeader>
                
                {selectedOrder && (
                  <div className="space-y-6 mt-4">
                    {/* Items Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2"><ShoppingBag className="w-4 h-4 text-orange-500"/> Ordered Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.order_items?.map((item, i)=>(
                          <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-xl border border-border">
                            <img src={item.products?.image_url} className="w-14 h-14 rounded-lg object-cover border" alt={item.products?.name}/>
                            <div className="flex-1">
                              <p className="text-sm font-bold line-clamp-1">{item.products?.name}</p>
                              <p className="text-xs text-muted-foreground font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <div className="font-bold text-sm flex items-center">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Address Section */}
                      <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                        <h4 className="text-xs font-bold uppercase text-orange-600 mb-3 flex items-center gap-2"><MapPin className="w-3 h-3"/> Delivery Address</h4>
                        {(() => {
                          const addr = parseAddress(selectedOrder.shipping_address);
                          if(!addr) return <p className="text-red-500 text-xs">Address unavailable</p>;
                          return (
                            <div className="text-sm space-y-1">
                              <p className="font-bold text-foreground">{addr.fullName}</p>
                              <p className="text-muted-foreground text-xs leading-relaxed">{addr.houseNo}, {addr.area}, {addr.city} - {addr.pincode}</p>
                              <p className="text-xs pt-1 flex items-center gap-1 font-medium"><Phone className="w-3 h-3"/> {addr.phone}</p>
                            </div>
                          )
                        })()}
                      </div>

                      {/* ✅ Payment Details Section (NEW) */}
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-center">
                        <h4 className="text-xs font-bold uppercase text-blue-600 mb-3 flex items-center gap-2">Payment Information</h4>
                        {(() => {
                          const addr = parseAddress(selectedOrder.shipping_address);
                          const isCod = addr?.paymentMethod === 'cod';
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isCod ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                  {isCod ? <Banknote className="w-4 h-4"/> : <CreditCard className="w-4 h-4"/>}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-muted-foreground uppercase">Method</p>
                                  <p className="text-sm font-bold">{isCod ? "Cash on Delivery" : "Paid Online"}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <span className="font-bold text-muted-foreground">Amount to Collect</span>
                      <span className="text-2xl font-black text-primary">₹{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default OrdersManagement;