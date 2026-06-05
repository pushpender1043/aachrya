import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import CosmicBackground from "@/components/admin/CosmicBackground"; // ✅ Same background
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Image as ImageIcon, ExternalLink, Save } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link: string;
  is_active: boolean;
  display_order: number;
}

export default function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New Banner Form State
  const [newTitle, setNewTitle] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLink, setNewLink] = useState("/");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH BANNERS ---
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- ADD BANNER ---
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("banners").insert([
        { title: newTitle, image_url: newImage, link: newLink, display_order: banners.length + 1 }
      ]);

      if (error) throw error;

      toast({ title: "Success", description: "Banner added successfully! 🚀", className: "bg-green-600 text-white" });
      
      // Reset Form & Refresh
      setNewTitle("");
      setNewImage("");
      setNewLink("/");
      fetchBanners();

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE BANNER ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this banner?")) return;
    
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      setBanners(prev => prev.filter(b => b.id !== id));
      toast({ title: "Deleted", description: "Banner removed." });
    }
  };

  // --- TOGGLE ACTIVE ---
  const toggleActive = async (id: string, currentState: boolean) => {
    // Optimistic UI Update
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !currentState } : b));
    
    await supabase.from("banners").update({ is_active: !currentState }).eq("id", id);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full text-white font-sans">
        <CosmicBackground />
        <AdminSidebar />
        
        <main className="flex-1 p-6 w-full overflow-hidden relative z-10">
          <SidebarTrigger className="md:hidden mb-4 text-white" />

          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                  Banner Manager
                </h1>
                <p className="text-white/60">Control the visuals of your home page sliders.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* LEFT: Add New Banner Form */}
                <Card className="glass-card bg-white/5 border-white/10 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-400" /> Add New Banner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddBanner} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white">Title (Internal Name)</Label>
                                <Input 
                                    value={newTitle} onChange={e => setNewTitle(e.target.value)} 
                                    placeholder="e.g., Diwali Sale" 
                                    className="bg-black/20 border-white/10 text-white" required 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-white">Image URL</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={newImage} onChange={e => setNewImage(e.target.value)} 
                                        placeholder="https://..." 
                                        className="bg-black/20 border-white/10 text-white" required 
                                    />
                                </div>
                                <p className="text-xs text-white/40">Paste a link from Unsplash or your storage.</p>
                            </div>

                            {/* Image Preview */}
                            {newImage && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/20 mt-2">
                                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" 
                                         onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-white">Target Link (Optional)</Label>
                                <Input 
                                    value={newLink} onChange={e => setNewLink(e.target.value)} 
                                    placeholder="/products" 
                                    className="bg-black/20 border-white/10 text-white" 
                                />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Publish Banner</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* RIGHT: Banner List */}
                <Card className="glass-card bg-white/5 border-white/10 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-purple-400" /> Active Banners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-white/10 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead className="text-white">Preview</TableHead>
                                        <TableHead className="text-white">Details</TableHead>
                                        <TableHead className="text-white">Status</TableHead>
                                        <TableHead className="text-right text-white">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-white" /></TableCell></TableRow>
                                    ) : banners.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-white/50">No banners found. Add one!</TableCell></TableRow>
                                    ) : (
                                        banners.map((banner) => (
                                            <TableRow key={banner.id} className="hover:bg-white/5 border-white/10">
                                                <TableCell>
                                                    <div className="w-24 h-14 rounded bg-black/40 overflow-hidden">
                                                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-white">{banner.title}</div>
                                                    <div className="text-xs text-white/50 flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" /> {banner.link}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch 
                                                            checked={banner.is_active}
                                                            onCheckedChange={() => toggleActive(banner.id, banner.is_active)}
                                                            className="data-[state=checked]:bg-green-500"
                                                        />
                                                        <span className={`text-xs ${banner.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                                                            {banner.is_active ? 'Live' : 'Hidden'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="hover:bg-red-500/20 hover:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}