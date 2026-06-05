import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
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
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  Search, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  CalendarDays
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- INTERFACE (UNCHANGED) ---
interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  cover_image: string;
  tags: string[];
  published_at: string;
  created_at: string;
}

export default function BlogsManagement() {
  // --- STATE (UNCHANGED LOGIC + Search State) ---
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // UI Filter ke liye
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "Aachrya Team",
    cover_image: "",
    tags: "",
  });

  // --- FETCH LOGIC (UNCHANGED) ---
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  // --- SUBMIT LOGIC (UNCHANGED) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const blogData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      author: formData.author,
      cover_image: formData.cover_image,
      tags: formData.tags.split(",").map((t) => t.trim()),
      published_at: new Date().toISOString(),
    };

    if (editingBlog) {
      const { error } = await supabase
        .from("blogs")
        .update(blogData)
        .eq("id", editingBlog.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update blog", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Blog updated successfully" });
        fetchBlogs();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("blogs").insert(blogData);

      if (error) {
        toast({ title: "Error", description: "Failed to create blog", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Blog created successfully" });
        fetchBlogs();
        resetForm();
      }
    }
  };

  // --- DELETE LOGIC (UNCHANGED) ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete blog", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Blog deleted successfully" });
      fetchBlogs();
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      author: blog.author || "Aachrya Team",
      cover_image: blog.cover_image || "",
      tags: blog.tags?.join(", ") || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "Aachrya Team",
      cover_image: "",
      tags: "",
    });
    setEditingBlog(null);
    setDialogOpen(false);
  };

  // --- UI FILTER LOGIC ---
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER (NEW SHYNEX THEME) ---
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
                  <FileText className="w-8 h-8 text-primary" /> Content Studio
                </h1>
                <p className="text-muted-foreground">Manage your articles and spiritual insights.</p>
              </div>

              {/* ADD DIALOG */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="glow-effect bg-primary text-white">
                    <Plus className="w-4 h-4 mr-2" /> Write New Blog
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBlog ? "Edit Article" : "Compose New Article"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Short Excerpt</Label>
                        <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Full Content (HTML/Text)</Label>
                        <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10} required className="font-mono text-sm" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover_image">Cover Image URL</Label>
                        <Input id="cover_image" value={formData.cover_image} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="astrology, horoscope, vedic" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button type="submit">{editingBlog ? "Update Article" : "Publish Article"}</Button>
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
                  placeholder="Search articles by title..." 
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                  Total: {blogs.length}
              </Badge>
            </div>

            {/* Sexy Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Cover</TableHead>
                    <TableHead>Article Details</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredBlogs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No blogs found.</TableCell></TableRow>
                  ) : (
                    filteredBlogs.map((blog) => (
                      <TableRow key={blog.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                           <Avatar className="w-12 h-12 rounded-lg border border-border">
                              <AvatarImage src={blog.cover_image} className="object-cover" />
                              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                 <ImageIcon className="w-5 h-5" />
                              </AvatarFallback>
                           </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                             <span className="font-semibold line-clamp-1">{blog.title}</span>
                             <span className="text-xs text-muted-foreground flex items-center gap-1">
                                By {blog.author}
                             </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {blog.tags?.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] bg-secondary/50 border-secondary-foreground/20">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(blog.published_at).toLocaleDateString()}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)} className="text-blue-500 hover:bg-blue-50">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} className="text-red-500 hover:bg-red-50">
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