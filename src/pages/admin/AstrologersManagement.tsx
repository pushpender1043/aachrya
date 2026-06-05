import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Star, 
  Briefcase, 
  IndianRupee, 
  Power,
  Loader2,
  Languages
} from "lucide-react";

// ✅ 1. Interface matches YOUR Database Schema
interface Astrologer {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  price_per_minute: number;
  rating: number;
  image_url: string;
  bio: string;
  languages: string[];
  is_available: boolean;
}

export default function AstrologersManagement() {
  // ✅ 2. State Management (Same as your working code + Search state)
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAstrologer, setEditingAstrologer] = useState<Astrologer | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // Added for Search UI
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience_years: "",
    price_per_minute: "",
    rating: "",
    image_url: "",
    bio: "",
    languages: "",
    is_available: true,
  });

  // ✅ 3. Fetch Logic (UNCHANGED)
  useEffect(() => {
    fetchAstrologers();
  }, []);

  const fetchAstrologers = async () => {
    const { data, error } = await supabase
      .from("astrologers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch astrologers",
        variant: "destructive",
      });
    } else {
      setAstrologers(data || []);
    }
    setLoading(false);
  };

  // ✅ 4. Submit Logic (UNCHANGED)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const astrologerData = {
      name: formData.name,
      specialization: formData.specialization,
      experience_years: parseInt(formData.experience_years) || 0,
      price_per_minute: parseFloat(formData.price_per_minute) || 0,
      rating: parseFloat(formData.rating) || 4.5,
      image_url: formData.image_url,
      bio: formData.bio,
      languages: formData.languages.split(",").map((l) => l.trim()),
      is_available: formData.is_available,
    };

    if (editingAstrologer) {
      const { error } = await supabase
        .from("astrologers")
        .update(astrologerData)
        .eq("id", editingAstrologer.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Updated successfully" });
        fetchAstrologers();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("astrologers").insert(astrologerData);

      if (error) {
        toast({ title: "Error", description: "Failed to create", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Created successfully" });
        fetchAstrologers();
        resetForm();
      }
    }
  };

  // ✅ 5. Delete Logic (UNCHANGED)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this astrologer?")) return;

    const { error } = await supabase.from("astrologers").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted successfully" });
      fetchAstrologers();
    }
  };

  // ✅ 6. Toggle Status (New Helper for UI)
  const toggleStatus = async (astrologer: Astrologer) => {
    // Optimistic Update
    const newStatus = !astrologer.is_available;
    setAstrologers(prev => prev.map(a => a.id === astrologer.id ? { ...a, is_available: newStatus } : a));

    const { error } = await supabase
      .from("astrologers")
      .update({ is_available: newStatus })
      .eq("id", astrologer.id);

    if (error) {
      toast({ title: "Error", description: "Status update failed", variant: "destructive" });
      fetchAstrologers(); // Revert on error
    } else {
      toast({ title: "Success", description: newStatus ? "Marked Online" : "Marked Offline" });
    }
  };

  const handleEdit = (astrologer: Astrologer) => {
    setEditingAstrologer(astrologer);
    setFormData({
      name: astrologer.name,
      specialization: astrologer.specialization,
      experience_years: astrologer.experience_years.toString(),
      price_per_minute: astrologer.price_per_minute.toString(),
      rating: astrologer.rating.toString(),
      image_url: astrologer.image_url || "",
      bio: astrologer.bio || "",
      languages: astrologer.languages ? astrologer.languages.join(", ") : "",
      is_available: astrologer.is_available,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      experience_years: "",
      price_per_minute: "",
      rating: "4.5",
      image_url: "",
      bio: "",
      languages: "",
      is_available: true,
    });
    setEditingAstrologer(null);
    setDialogOpen(false);
  };

  // ✅ 7. Filter Logic for UI
  const filteredList = astrologers.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UI RENDERING (NEW SEXY LOOK) ---
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
                  <Star className="w-8 h-8 text-primary" /> Astrologers Team
                </h1>
                <p className="text-muted-foreground">Manage experts profiles and availability.</p>
              </div>

              {/* ADD DIALOG */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="glow-effect bg-primary text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Expert
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAstrologer ? "Edit Profile" : "Add New Expert"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Experience (Years)</Label>
                        <Input type="number" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₹/min)</Label>
                        <Input type="number" step="0.01" value={formData.price_per_minute} onChange={(e) => setFormData({ ...formData, price_per_minute: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rating (0-5)</Label>
                        <Input type="number" step="0.1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Languages</Label>
                        <Input placeholder="Hindi, English" value={formData.languages} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Image URL</Label>
                      <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} />
                    </div>
                    <div className="flex items-center space-x-2 bg-secondary/20 p-3 rounded-lg border border-border">
                      <Switch id="available" checked={formData.is_available} onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })} />
                      <Label htmlFor="available">Available for consultations</Label>
                    </div>
                    <DialogFooter>
                       <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                       <Button type="submit">{editingAstrologer ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Name or Specialization..." 
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
                    <TableHead>Profile</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredList.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No astrologers found.</TableCell></TableRow>
                  ) : (
                    filteredList.map((astrologer) => (
                      <TableRow key={astrologer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-primary/20">
                              <AvatarImage src={astrologer.image_url} className="object-cover" />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">{astrologer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{astrologer.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Languages className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{astrologer.languages?.join(", ") || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                             {astrologer.specialization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <span>{astrologer.experience_years} Years</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                             <div className="flex items-center">
                                <IndianRupee className="w-3 h-3" /> {astrologer.price_per_minute}/min
                             </div>
                        </TableCell>
                        <TableCell>
                           {/* Quick Toggle Button */}
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => toggleStatus(astrologer)}
                             className={`flex items-center gap-2 border ${
                               astrologer.is_available 
                               ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20" 
                               : "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20"
                             }`}
                           >
                              <Power className="w-3 h-3" />
                              {astrologer.is_available ? "Online" : "Offline"}
                           </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(astrologer)} className="text-blue-500 hover:bg-blue-50">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(astrologer.id)} className="text-red-500 hover:bg-red-50">
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
}