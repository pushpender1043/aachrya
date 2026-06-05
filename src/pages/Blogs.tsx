import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, User, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { format } from "date-fns";

// Interface (Same as before)
interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  cover_image?: string;
  author: string;
  category?: string;
  tags?: string[];
  created_at: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SAME FUNCTIONING ---
  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error:", error);
      else setBlogs(data || []);
      
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  // --- UI RESTORED (Theme Adaptive) ---
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Logic: Separate Featured vs Recent
  const featuredBlog = blogs[0];
  const recentBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="px-4 py-1 text-primary mb-2">
            Our Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
             Latest <span className="text-primary">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore articles on astrology, spirituality, and cosmic wisdom curated by our experts.
          </p>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
             <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-xl font-semibold">No articles yet</h3>
             <p className="text-muted-foreground">Check back soon for updates.</p>
          </div>
        )}

        {/* Featured Blog Section */}
        {featuredBlog && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-500" /> Featured Article
            </h2>
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                 {/* Image */}
                 <div className="relative h-64 md:h-auto overflow-hidden">
                    <img 
                      src={featuredBlog.image_url || featuredBlog.cover_image || "/placeholder.svg"} 
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                       <Badge className="bg-primary text-primary-foreground">Latest</Badge>
                    </div>
                 </div>
                 
                 {/* Content */}
                 <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                       <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(featuredBlog.created_at), "MMM dd, yyyy")}</span>
                       <span className="flex items-center gap-1"><User className="w-4 h-4" /> {featuredBlog.author || "Admin"}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                       {featuredBlog.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                       {featuredBlog.excerpt}
                    </p>
                    
                    <div>
                       <Button variant="default" size="lg" className="rounded-full px-8">
                          Read More <ArrowRight className="ml-2 w-4 h-4" />
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Blogs Grid */}
        {recentBlogs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Recent Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {recentBlogs.map((blog) => (
                  <Card key={blog.id} className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                     {/* Card Image */}
                     <div className="h-52 overflow-hidden relative">
                        <img 
                          src={blog.image_url || blog.cover_image || "/placeholder.svg"} 
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {blog.category && (
                           <Badge variant="secondary" className="absolute top-3 right-3 shadow-sm">
                              {blog.category}
                           </Badge>
                        )}
                     </div>
                     
                     {/* Card Content */}
                     <CardContent className="flex-1 p-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                           <span>{format(new Date(blog.created_at), "MMM dd, yyyy")}</span>
                           <span>•</span>
                           <span>{blog.author || "Team"}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                           {blog.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-3">
                           {blog.excerpt}
                        </p>
                     </CardContent>
                     
                     {/* Card Footer */}
                     <CardFooter className="p-6 pt-0 mt-auto">
                        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary hover:text-primary/80 font-semibold">
                           Read Article <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                     </CardFooter>
                  </Card>
               ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

// Helper Icon for Featured Section
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 01.72.545l.313 1.096c.214.75.875 1.33 1.63 1.545l1.095.313a.75.75 0 010 1.442l-1.095.313a2.25 2.25 0 00-1.63 1.545l-.313 1.096a.75.75 0 01-1.442 0l-.313-1.096a2.25 2.25 0 00-1.63-1.545l-1.095-.313a.75.75 0 010-1.442l1.095-.313a2.25 2.25 0 001.63-1.545l.313-1.096a.75.75 0 01.72-.545zM12 11.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z" clipRule="evenodd" />
    </svg>
  );
}

export default Blogs;