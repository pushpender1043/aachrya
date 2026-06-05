import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, Loader2 } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  // Relation ka naam 'products' hi hona chahiye
  products: {
    name: string;
    price: number;
    description: string;
    image_url?: string; // Optional rakha hai taaki crash na ho
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // ✅ Robust Query
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        product_id,
        products (name, price, description, image_url) 
      `)
      .eq("user_id", session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Cart Fetch Error:", error);
      toast.error("Cart load failed. Check console.");
    } else {
      setCartItems(data as any[] || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    // Optimistic UI Update (Turant dikhane ke liye)
    setCartItems(items => items.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    if (error) {
      toast.error("Update failed");
      fetchCart(); // Revert
    }
  };

  const removeItem = async (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId)); // Remove from UI immediately

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast.error("Delete failed");
      fetchCart();
    } else {
      toast.success("Item removed");
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart ({cartItems.length})</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-4 font-medium">Your cart is empty</p>
              <Button onClick={() => navigate("/products")} className="bg-primary text-white hover:bg-primary/90">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="md:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center">
                    {/* Image Fallback */}
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <img 
                            src={item.products?.image_url || "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=200"} 
                            alt={item.products?.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-semibold line-clamp-1">{item.products?.name}</h3>
                        <span className="font-bold text-primary">₹{(item.products?.price || 0) * item.quantity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{item.products?.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border rounded-md p-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted rounded"><Minus className="w-3 h-3" /></button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted rounded"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                  <Button onClick={() => navigate("/checkout")} className="w-full h-12 text-lg">
                    Proceed to Checkout
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;