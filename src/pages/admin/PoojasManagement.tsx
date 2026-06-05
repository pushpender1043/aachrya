import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  IndianRupee, 
  Sparkles, 
  Search, 
  Loader2, 
  Clock, 
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";

// --- INTERFACE (UNCHANGED) ---
interface Pooja {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  category: string | null;
  image_url: string | null;
  benefits: string[] | null;
  items_included: string[] | null;
  is_available: boolean | null;
}

const PoojasManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPooja, setEditingPooja] = useState<Pooja | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // UI Search State

  // --- FORM STATE (UNCHANGED) ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    image_url: "",
    benefits: "",
    items_included: "",
    is_available: true,
  });

  // --- QUERIES & MUTATIONS (UNCHANGED LOGIC) ---
  const { data: poojas, isLoading } = useQuery({
    queryKey: ["admin-poojas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poojas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Pooja[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("poojas").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-poojas"] });
      toast.success("Pooja created successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create pooja");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("poojas").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-poojas"] });
      toast.success("Pooja updated successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pooja");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("poojas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-poojas"] });
      toast.success("Pooja deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete pooja");
    },
  });

  // --- HELPERS (UNCHANGED) ---
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      image_url: "",
      benefits: "",
      items_included: "",
      is_available: true,
    });
    setEditingPooja(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (pooja: Pooja) => {
    setEditingPooja(pooja);
    setFormData({
      name: pooja.name,
      description: pooja.description || "",
      price: pooja.price.toString(),
      duration: pooja.duration || "",
      category: pooja.category || "",
      image_url: pooja.image_url || "",
      benefits: pooja.benefits?.join(", ") || "",
      items_included: pooja.items_included?.join(", ") || "",
      is_available: pooja.is_available ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      duration: formData.duration || null,
      category: formData.category || null,
      image_url: formData.image_url || null,
      benefits: formData.benefits ? formData.benefits.split(",").map((b) => b.trim()) : null,
      items_included: formData.items_included ? formData.items_included.split(",").map((i) => i.trim()) : null,
      is_available: formData.is_available,
    };

    if (editingPooja) {
      updateMutation.mutate({ id: editingPooja.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // --- FILTER LOGIC (NEW) ---
  const filteredPoojas = poojas?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Logic
  const totalPoojas = poojas?.length || 0;
  const activePoojas = poojas?.filter(p => p.is_available).length || 0;

  // --- UI RENDER (SHYNEX THEME) ---
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 w-full overflow-hidden">
          <SidebarTrigger className="md:hidden mb-4" />

          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" /> Divine Services
                </h1>
                <p className="text-muted-foreground">Manage spiritual rituals and poojas.</p>
              </div>

              {/* ADD DIALOG */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()} className="glow-effect bg-primary text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add New Pooja
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPooja ? "Edit Pooja Service" : "Add New Pooja Service"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Pooja Name *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 2-3 hours" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Wealth, Health" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                      <Textarea id="benefits" value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder="Remove obstacles, Peace of mind" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="items">Items Included (comma-separated)</Label>
                      <Textarea id="items" value={formData.items_included} onChange={(e) => setFormData({ ...formData, items_included: e.target.value })} placeholder="Flowers, Coconut, Incense" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div className="flex items-center space-x-2 bg-secondary/20 p-3 rounded-lg border border-border">
                      <Switch id="available" checked={formData.is_available} onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })} />
                      <Label htmlFor="available">Available for booking</Label>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                      <Button type="submit">{editingPooja ? "Update Service" : "Create Service"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Total Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary flex items-center">
                    <Sparkles className="w-6 h-6 mr-1" />
                    {totalPoojas}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/5 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600 uppercase tracking-wider">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 flex items-center gap-2">
                    {activePoojas}
                    <CheckCircle2 className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-500/5 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600 uppercase tracking-wider">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 flex items-center gap-2">
                    {new Set(poojas?.map(p => p.category)).size}
                    <Sparkles className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search poojas by name or category..." 
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sexy Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredPoojas?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No poojas found.</TableCell></TableRow>
                  ) : (
                    filteredPoojas?.map((pooja) => (
                      <TableRow key={pooja.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                           <Avatar className="w-10 h-10 rounded-lg border border-border">
                              <AvatarImage src={pooja.image_url || ""} className="object-cover" />
                              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                 <ImageIcon className="w-5 h-5" />
                              </AvatarFallback>
                           </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{pooja.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-200">
                             {pooja.category || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          <span className="flex items-center">
                            <IndianRupee className="w-3 h-3" />
                            {pooja.price.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {pooja.duration || "N/A"}
                            </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pooja.is_available ? "default" : "secondary"}
                             className={pooja.is_available ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-red-500/10 text-red-600 hover:bg-red-500/20"}>
                            {pooja.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(pooja)} className="text-blue-500 hover:bg-blue-50">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this pooja?")) {
                                  deleteMutation.mutate(pooja.id);
                                }
                              }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PoojasManagement;